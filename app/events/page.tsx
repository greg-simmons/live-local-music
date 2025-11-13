import { EventsFilterCard, type FilterFormState } from "./_components/events-filter-card";
import {
  createBoundingBox,
  isWithinBoundingBox,
  lookupZipCoordinates,
  normalizeZipCode,
} from "@/lib/geo";
import { prisma } from "@/lib/prisma";

const RADIUS_OPTIONS = [5, 10, 25, 50] as const;
const DATE_FILTERS = [
  { label: "Tonight", value: "tonight" },
  { label: "Tomorrow", value: "tomorrow" },
  { label: "This Weekend", value: "weekend" },
  { label: "Pick a date", value: "date" },
] as const;

type DateFilterValue = (typeof DATE_FILTERS)[number]["value"];
type RadiusOption = (typeof RADIUS_OPTIONS)[number];
type RawSearchParams = Record<string, string | string[] | undefined>;

const DEFAULT_WHEN: DateFilterValue = "tonight";

type DateRange = {
  start: Date;
  end: Date;
};

const getSingleParam = (params: RawSearchParams, key: string) => {
  const value = params[key];
  return typeof value === "string" ? value : undefined;
};

const isRadiusOption = (value: number): value is RadiusOption =>
  (RADIUS_OPTIONS as readonly number[]).includes(value);

const parseRadiusParam = (value: string | undefined): RadiusOption | null => {
  if (!value) return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && isRadiusOption(parsed) ? parsed : null;
};

const parseWhenParam = (value: string | undefined): DateFilterValue =>
  DATE_FILTERS.some((option) => option.value === value) ? (value as DateFilterValue) : DEFAULT_WHEN;

const isDateInput = (value: string | undefined) => (value ? /^\d{4}-\d{2}-\d{2}$/.test(value) : false);

const startOfUtcDay = (date: Date) => {
  const copy = new Date(date);
  copy.setUTCHours(0, 0, 0, 0);
  return copy;
};

const addUtcDays = (date: Date, days: number) => {
  const copy = new Date(date);
  copy.setUTCDate(copy.getUTCDate() + days);
  return copy;
};

const dateStringToUtc = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
};

const getDateRange = (now: Date, when: DateFilterValue, pickedDate?: string): DateRange | null => {
  const today = startOfUtcDay(now);

  switch (when) {
    case "tonight":
      return { start: today, end: addUtcDays(today, 1) };
    case "tomorrow": {
      const tomorrow = addUtcDays(today, 1);
      return { start: tomorrow, end: addUtcDays(tomorrow, 1) };
    }
    case "weekend": {
      const day = now.getUTCDay();
      if (day >= 5) {
        const friday = startOfUtcDay(addUtcDays(today, -(day - 5)));
        return { start: friday, end: addUtcDays(friday, 3) };
      }
      const daysUntilFriday = 5 - day;
      const friday = addUtcDays(today, daysUntilFriday);
      return { start: friday, end: addUtcDays(friday, 3) };
    }
    case "date":
      if (!pickedDate) return null;
      const date = dateStringToUtc(pickedDate);
      return { start: date, end: addUtcDays(date, 1) };
    default:
      return null;
  }
};

const formatDateTime = (date: Date, time: Date | null) => {
  const dateFormatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });
  const timeFormatter = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" });
  return `${dateFormatter.format(date)} at ${time ? timeFormatter.format(time) : "TBD"}`;
};

type EventsPageProps = {
  searchParams: Promise<RawSearchParams>;
};

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const params = await searchParams;
  const now = new Date();

  const rawWhenParam = getSingleParam(params, "when");
  const parsedWhen = parseWhenParam(rawWhenParam);
  const rawDateParam = getSingleParam(params, "date");
  const sanitizedDateParam = isDateInput(rawDateParam) ? rawDateParam : "";
  const shouldForceDefaultWhen = rawWhenParam === "date" && !sanitizedDateParam;
  const activeWhen: DateFilterValue = shouldForceDefaultWhen ? DEFAULT_WHEN : parsedWhen;
  const radiusParam = parseRadiusParam(getSingleParam(params, "radius"));
  const rawZipParam = getSingleParam(params, "zip") ?? "";
  const normalizedZip = normalizeZipCode(rawZipParam);

  const dateRange = getDateRange(now, activeWhen, activeWhen === "date" ? sanitizedDateParam : undefined);

  const events = await prisma.event.findMany({
    where: {
      isActive: true,
      ...(dateRange
        ? {
            eventDate: {
              gte: dateRange.start,
              lt: dateRange.end,
            },
          }
        : {}),
    },
    include: {
      venue: true,
      artist: true,
    },
    orderBy: [{ eventDate: "asc" }, { eventTime: "asc" }],
    take: 50,
  });

  const shouldApplyLocation = Boolean(normalizedZip && radiusParam);
  const location = shouldApplyLocation && normalizedZip ? await lookupZipCoordinates(normalizedZip) : null;
  const locationError = Boolean(shouldApplyLocation && !location);
  const boundingBox =
    shouldApplyLocation && location && radiusParam ? createBoundingBox(location, radiusParam) : null;

  const filteredEvents = boundingBox
    ? events.filter((event) =>
        isWithinBoundingBox(
          { latitude: event.venue.latitude, longitude: event.venue.longitude },
          boundingBox,
        ),
      )
    : events;

  const initialFilters: FilterFormState = {
    zip: rawZipParam,
    radius: radiusParam ? radiusParam.toString() : "",
    when: rawWhenParam === "date" && sanitizedDateParam ? "date" : activeWhen,
    date: rawWhenParam === "date" && sanitizedDateParam ? sanitizedDateParam : "",
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-12">
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold text-slate-900">Live events</h1>
        <p className="text-sm text-slate-600">Dial in by date or your ZIP code to find the right show tonight.</p>
      </div>

      <EventsFilterCard
        initialValues={initialFilters}
        radiusOptions={RADIUS_OPTIONS}
        dateOptions={DATE_FILTERS}
        locationError={locationError}
      />

      <section className="grid gap-6 md:grid-cols-2">
        {filteredEvents.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-sm text-slate-600 shadow-sm">
            No events match those filters right now. Try clearing the date or widening the radius.
          </div>
        ) : (
          filteredEvents.map((event) => (
            <article key={event.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900">{event.title ?? "Untitled event"}</h2>
              <p className="mt-1 text-sm text-slate-600">{event.description ?? "No description yet."}</p>
              <p className="mt-3 text-sm font-medium text-slate-900">{formatDateTime(event.eventDate, event.eventTime)}</p>
              <p className="text-sm text-slate-600">
                {event.venue.name} - {event.venue.city}, {event.venue.state}
              </p>
              {event.artist ? <p className="text-sm text-slate-600">Featuring {event.artist.name}</p> : null}
              {event.coverCharge ? (
                <p className="text-xs text-slate-500">Cover charge: ${event.coverCharge.toString()}</p>
              ) : null}
            </article>
          ))
        )}
      </section>
    </div>
  );
}

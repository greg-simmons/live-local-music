import { prisma } from "@/lib/prisma";

function parseSearchNumber(value: string | undefined) {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function haversineMiles(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const earthRadiusMiles = 3958.8;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusMiles * c;
}

function formatDateTime(date: Date, time: Date | null) {
  const dateFormatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });
  const timeFormatter = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" });
  return `${dateFormatter.format(date)} · ${time ? timeFormatter.format(time) : "TBD"}`;
}

type EventsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const params = await searchParams;
  const dateFilter = typeof params.date === "string" && params.date ? params.date : undefined;
  const radiusParam = parseSearchNumber(typeof params.radius === "string" ? params.radius : undefined);
  const latitudeParam = parseSearchNumber(typeof params.latitude === "string" ? params.latitude : undefined);
  const longitudeParam = parseSearchNumber(typeof params.longitude === "string" ? params.longitude : undefined);

  const where = {
    isActive: true,
    ...(dateFilter ? { eventDate: new Date(dateFilter) } : {}),
  } satisfies Parameters<typeof prisma.event.findMany>[0]["where"];

  const events = await prisma.event.findMany({
    where,
    include: {
      venue: true,
      artist: true,
    },
    orderBy: [{ eventDate: "asc" }, { eventTime: "asc" }],
    take: 50,
  });

  let filteredEvents = events;

  if (
    radiusParam !== null &&
    radiusParam !== undefined &&
    radiusParam > 0 &&
    latitudeParam !== null &&
    longitudeParam !== null
  ) {
    filteredEvents = events.filter((event) => {
      const distance = haversineMiles(latitudeParam, longitudeParam, event.venue.latitude, event.venue.longitude);
      return distance <= radiusParam;
    });
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-12">
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold text-slate-900">Live events</h1>
        <p className="text-sm text-slate-600">
          Filter by date and radius to find shows that match your schedule.
        </p>
      </div>
      <form method="get" className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-6 md:grid-cols-4">
          <div className="space-y-2">
            <label htmlFor="date" className="block text-sm font-medium text-slate-700">
              Event date
            </label>
            <input
              id="date"
              name="date"
              type="date"
              defaultValue={dateFilter ?? ""}
              className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="radius" className="block text-sm font-medium text-slate-700">
              Radius (miles)
            </label>
            <input
              id="radius"
              name="radius"
              type="number"
              min="0"
              step="1"
              defaultValue={radiusParam ?? ""}
              className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="latitude" className="block text-sm font-medium text-slate-700">
              Latitude
            </label>
            <input
              id="latitude"
              name="latitude"
              type="number"
              step="any"
              defaultValue={latitudeParam ?? ""}
              className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="longitude" className="block text-sm font-medium text-slate-700">
              Longitude
            </label>
            <input
              id="longitude"
              name="longitude"
              type="number"
              step="any"
              defaultValue={longitudeParam ?? ""}
              className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
          </div>
        </div>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <button
            type="submit"
            className="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Apply filters
          </button>
          <a
            href="/events"
            className="text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            Reset
          </a>
        </div>
      </form>
      <section className="grid gap-6 md:grid-cols-2">
        {filteredEvents.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-sm text-slate-600 shadow-sm">
            No events match the selected filters yet. Try expanding your radius or clearing the date filter.
          </div>
        ) : (
          filteredEvents.map((event) => (
            <article key={event.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900">{event.title ?? "Untitled event"}</h2>
              <p className="mt-1 text-sm text-slate-600">{event.description ?? "No description yet."}</p>
              <p className="mt-3 text-sm font-medium text-slate-900">{formatDateTime(event.eventDate, event.eventTime)}</p>
              <p className="text-sm text-slate-600">
                {event.venue.name} · {event.venue.city}, {event.venue.state}
              </p>
              {event.artist ? (
                <p className="text-sm text-slate-600">Featuring {event.artist.name}</p>
              ) : null}
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

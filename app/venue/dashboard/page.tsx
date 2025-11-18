import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function redirectForRole(role: "admin" | "artist" | "venue") {
  if (role === "admin") {
    redirect("/admin");
  }
  if (role === "artist") {
    redirect("/artist/dashboard");
  }
  redirect("/login");
}

function formatDate(date: Date, time: Date | null) {
  const dateFormatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });
  const timeFormatter = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" });
  return `${dateFormatter.format(date)} • ${time ? timeFormatter.format(time) : "TBD"}`;
}

function formatUsPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) {
    return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return phone;
}

function VenueProfileMissing() {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-12">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Venue profile missing</h1>
        <p className="mt-3 text-sm text-slate-600">
          We couldn't find your venue profile. Contact support so we can help reconnect your account.
        </p>
      </div>
    </div>
  );
}

export default async function VenueDashboardPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  if (session.user.role !== "venue") {
    redirectForRole(session.user.role);
  }

  if (!session.user.venueId) {
    return <VenueProfileMissing />;
  }

  const venue = await prisma.venue.findUnique({
    where: { id: session.user.venueId },
    include: {
      events: {
        where: { isActive: true },
        orderBy: [{ eventDate: "asc" }, { eventTime: "asc" }],
        take: 5,
        include: {
          artist: {
            select: {
              name: true,
              genres: {
                select: {
                  genre: {
                    select: { name: true },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!venue) {
    return <VenueProfileMissing />;
  }

  const formattedPhone = venue.phone ? formatUsPhone(venue.phone) : null;

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-12">
      <div className="grid gap-8 lg:grid-cols-[minmax(260px,340px),1fr]">
        <section className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="space-y-3">
            {venue.profileImageUrl ? (
              <div className="flex justify-center">
                <img
                  src={venue.profileImageUrl}
                  alt={venue.name}
                  className="max-h-64 w-auto max-w-full object-contain"
                />
              </div>
            ) : null}
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Venue</p>
              <h1 className="text-3xl font-semibold text-slate-900">{venue.name}</h1>
            </div>
          </div>
          <div className="space-y-1 text-sm text-slate-600">
            <p className="font-semibold text-slate-900">{venue.name}</p>
            <p>{venue.address}</p>
            <p>
              {venue.city}, {venue.state} {venue.zipCode}
            </p>
          </div>
          {formattedPhone ? (
            <p className="text-sm text-slate-600">
              Phone: <span className="font-semibold text-slate-900">{formattedPhone}</span>
            </p>
          ) : null}
          {venue.website ? (
            <a
              href={venue.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-slate-900 underline underline-offset-4 hover:text-slate-700"
            >
              {`${venue.name}'s website`}
            </a>
          ) : null}
          {venue.description ? (
            <p className="text-sm text-slate-600 leading-relaxed">{venue.description}</p>
          ) : null}
        </section>

        <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Upcoming Events</h2>
          {venue.events.length === 0 ? (
            <p className="text-sm text-slate-600">No events scheduled yet.</p>
          ) : (
            <ul className="space-y-4">
              {venue.events.map((event) => {
                const artistName = event.artist?.name ?? event.artistText ?? "Artist to be announced";
                const genreSummary =
                  event.artist?.genres && event.artist.genres.length > 0
                    ? event.artist.genres.map((artistGenre) => artistGenre.genre.name).join(", ")
                    : "Genres TBA";

                return (
                  <li key={event.id} className="rounded-2xl border border-slate-200 p-4">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm font-semibold text-slate-900">{event.title ?? "Untitled event"}</p>
                      <p className="text-xs text-slate-500">{formatDate(event.eventDate, event.eventTime)}</p>
                    </div>
                    <p className="mt-2 text-sm font-medium text-slate-900">{artistName}</p>
                    <p className="text-xs uppercase tracking-wide text-slate-500">{genreSummary}</p>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

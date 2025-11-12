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
  return `${dateFormatter.format(date)} · ${time ? timeFormatter.format(time) : "TBD"}`;
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
    return (
      <div className="mx-auto w-full max-w-3xl px-6 py-12">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-semibold text-slate-900">Venue profile missing</h1>
          <p className="mt-3 text-sm text-slate-600">
            We couldn&rsquo;t find your venue profile. Contact support so we can help reconnect your account.
          </p>
        </div>
      </div>
    );
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
            select: { name: true },
          },
        },
      },
    },
  });

  if (!venue) {
    return (
      <div className="mx-auto w-full max-w-3xl px-6 py-12">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-semibold text-slate-900">Venue profile missing</h1>
          <p className="mt-3 text-sm text-slate-600">
            We couldn&rsquo;t find your venue profile. Contact support so we can help reconnect your account.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 py-12">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-2">
          <p className="text-sm uppercase tracking-wide text-slate-500">Venue dashboard</p>
          <h1 className="text-3xl font-semibold text-slate-900">{venue.name}</h1>
          {venue.description ? <p className="text-sm text-slate-600">{venue.description}</p> : null}
          <div className="flex flex-col gap-2 text-sm text-slate-600 md:flex-row md:flex-wrap md:items-center md:gap-6">
            <span>
              {venue.address}, {venue.city}, {venue.state} {venue.zipCode}
            </span>
            <span>Contact: {venue.contactName}</span>
            <span>{venue.contactEmail}</span>
            {venue.contactPhone ? <span>{venue.contactPhone}</span> : null}
          </div>
        </div>
      </div>
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Upcoming events</h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            {venue.events.length === 0 ? (
              <li>No events scheduled yet.</li>
            ) : (
              venue.events.map((event) => (
                <li key={event.id} className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-sm font-semibold text-slate-900">{event.title ?? "Untitled event"}</p>
                  <p className="text-xs text-slate-500">{formatDate(event.eventDate, event.eventTime)}</p>
                  {event.artist ? (
                    <p className="text-xs text-slate-500">Featuring {event.artist.name}</p>
                  ) : null}
                </li>
              ))
            )}
          </ul>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Booking checklist</h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            <li>Keep event details updated at least two weeks before showtime.</li>
            <li>Confirm tech requirements with artists after booking.</li>
            <li>Share social graphics with artists to boost promotion.</li>
          </ul>
        </div>
      </section>
    </div>
  );
}

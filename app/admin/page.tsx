import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function roleRedirect(role: "admin" | "artist" | "venue") {
  if (role === "artist") {
    redirect("/artist/dashboard");
  }
  if (role === "venue") {
    redirect("/venue/dashboard");
  }
  redirect("/login");
}

function formatDateTime(date: Date, time: Date | null) {
  const dateFormatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });
  const timeFormatter = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" });
  return `${dateFormatter.format(date)} • ${time ? timeFormatter.format(time) : "TBD"}`;
}

export default async function AdminDashboardPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  if (session.user.role !== "admin") {
    roleRedirect(session.user.role);
  }

  const [artistCount, venueCount, eventCount, latestUsers, upcomingEvents] = await Promise.all([
    prisma.artist.count({ where: { isActive: true } }),
    prisma.venue.count({ where: { isActive: true } }),
    prisma.event.count({ where: { isActive: true } }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, email: true, role: true, createdAt: true },
    }),
    prisma.event.findMany({
      where: { isActive: true },
      orderBy: [{ eventDate: "asc" }, { eventTime: "asc" }],
      take: 5,
      include: {
        venue: {
          select: { name: true, city: true, state: true, profileImageUrl: true },
        },
        artist: {
          select: { name: true, profileImageUrl: true },
        },
      },
    }),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-12">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-slate-900">Admin overview</h1>
        <p className="text-sm text-slate-600">
          Monitor platform growth, track new accounts, and stay ahead of upcoming events.
        </p>
      </div>
      <section className="grid gap-6 md:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-600">Active artists</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{artistCount}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-600">Active venues</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{venueCount}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-600">Published events</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{eventCount}</p>
        </div>
      </section>
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Latest signups</h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            {latestUsers.length === 0 ? (
              <li>No recent registrations yet.</li>
            ) : (
              latestUsers.map((user) => (
                <li key={user.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900">{user.email}</p>
                    <p className="text-xs uppercase tracking-wide text-slate-500">{user.role}</p>
                  </div>
                  <p className="text-xs text-slate-500">
                    {new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(user.createdAt)}
                  </p>
                </li>
              ))
            )}
          </ul>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Upcoming events</h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            {upcomingEvents.length === 0 ? (
              <li>No events scheduled yet.</li>
            ) : (
              upcomingEvents.map((event) => (
                <li key={event.id} className="rounded-2xl border border-slate-200 p-4">
                  {event.venue.profileImageUrl ? (
                    <img
                      src={event.venue.profileImageUrl}
                      alt={event.venue.name}
                      className="mb-3 h-32 w-full rounded-2xl object-cover"
                    />
                  ) : null}
                  {event.artist?.profileImageUrl ? (
                    <div className="mb-3 flex justify-center">
                      <img
                        src={event.artist.profileImageUrl}
                        alt={event.artist.name}
                        className="max-h-40 w-auto max-w-full rounded-2xl object-contain"
                      />
                    </div>
                  ) : null}
                  <p className="text-sm font-semibold text-slate-900">{event.title ?? "Untitled event"}</p>
                  <p className="text-xs text-slate-500">{formatDateTime(event.eventDate, event.eventTime)}</p>
                  <p className="text-xs text-slate-500">
                    {event.venue.name} • {event.venue.city}, {event.venue.state}
                  </p>
                  {event.artist ? (
                    <p className="text-xs text-slate-500">Featuring {event.artist.name}</p>
                  ) : null}
                </li>
              ))
            )}
          </ul>
        </div>
      </section>
    </div>
  );
}

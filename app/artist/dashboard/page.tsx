import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function redirectForRole(role: "admin" | "artist" | "venue") {
  if (role === "admin") {
    redirect("/admin");
  }
  if (role === "venue") {
    redirect("/venue/dashboard");
  }
  redirect("/login");
}

function formatDate(date: Date, time: Date | null) {
  const dateFormatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });
  const timeFormatter = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" });
  return `${dateFormatter.format(date)} • ${time ? timeFormatter.format(time) : "TBD"}`;
}

function ArtistMissingProfile() {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-12">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Artist profile missing</h1>
        <p className="mt-3 text-sm text-slate-600">
          We couldn&rsquo;t find your artist profile. Contact support so we can help reconnect your account.
        </p>
      </div>
    </div>
  );
}

export default async function ArtistDashboardPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  if (session.user.role !== "artist") {
    redirectForRole(session.user.role);
  }

  const artistId = session.user.artistId;
  if (!artistId) {
    return <ArtistMissingProfile />;
  }

  let artist = null;
  try {
    artist = await prisma.artist.findUnique({
      where: { id: artistId },
      include: {
        events: {
          where: { isActive: true },
          orderBy: [{ eventDate: "asc" }, { eventTime: "asc" }],
          take: 5,
          include: {
            venue: {
              select: { name: true, city: true, state: true, profileImageUrl: true },
            },
          },
        },
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error("Failed to load artist dashboard data", error);
      return <ArtistMissingProfile />;
    }
    throw error;
  }

  if (!artist) {
    return <ArtistMissingProfile />;
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 py-12">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-2">
          <p className="text-sm uppercase tracking-wide text-slate-500">Artist dashboard</p>
          <h1 className="text-3xl font-semibold text-slate-900">{artist.name}</h1>
          {artist.bio ? <p className="text-sm text-slate-600">{artist.bio}</p> : null}
          <div className="flex flex-col gap-2 text-sm text-slate-600 md:flex-row md:items-center md:gap-6">
            {artist.zipCode ? <span>Based in {artist.zipCode}</span> : null}
            <span>Contact: {artist.contactName}</span>
            <span>{artist.contactEmail}</span>
            <span>{artist.contactPhone}</span>
          </div>
        </div>
      </div>
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Upcoming events</h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            {artist.events.length === 0 ? (
              <li>No events scheduled yet.</li>
            ) : (
              artist.events.map((event) => (
                <li key={event.id} className="rounded-2xl border border-slate-200 p-4">
                  {event.venue.profileImageUrl ? (
                    <img
                      src={event.venue.profileImageUrl}
                      alt={event.venue.name}
                      className="mb-3 h-32 w-full rounded-2xl object-cover"
                    />
                  ) : null}
                  <p className="text-sm font-semibold text-slate-900">{event.title ?? "Untitled event"}</p>
                  <p className="text-xs text-slate-500">{formatDate(event.eventDate, event.eventTime)}</p>
                  <p className="text-xs text-slate-500">
                    {event.venue.name} • {event.venue.city}, {event.venue.state}
                  </p>
                </li>
              ))
            )}
          </ul>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Quick actions</h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            <li>Share your updated bio and social links to attract venue bookers.</li>
            <li>Reach out to venues in your area using the contact list in your inbox.</li>
            <li>Coordinate promotion with venues two weeks before each show.</li>
          </ul>
        </div>
      </section>
    </div>
  );
}

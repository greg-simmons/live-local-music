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

function titleCase(value: string) {
  return value
    .split(/[\s-_]+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
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
              select: { name: true, city: true, state: true },
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

  const socialLinks = artist.socialLinks as Record<string, string> | null;
  const socialLinkEntries = socialLinks
    ? Object.entries(socialLinks).filter(([, value]) => typeof value === "string" && value.trim().length > 0)
    : [];

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-12">
      <div className="grid gap-8 lg:grid-cols-[minmax(260px,340px),1fr]">
        <section className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="space-y-4">
            {artist.profileImageUrl ? (
              <div className="flex justify-center">
                <img
                  src={artist.profileImageUrl}
                  alt={artist.name}
                  className="mx-auto mb-2 h-auto max-h-72 w-auto max-w-full rounded-xl object-contain"
                />
              </div>
            ) : null}
            <div className="space-y-2 text-center lg:text-left">
              <h1 className="text-3xl font-semibold text-slate-900">{artist.name}</h1>
              {artist.website ? (
                <a
                  href={artist.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-slate-900 underline underline-offset-4 hover:text-slate-600"
                >
                  {`${artist.name}’s website`}
                </a>
              ) : null}
              {artist.tipUrl ? (
                <div>
                  <a
                    href={artist.tipUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-slate-900 underline underline-offset-4 hover:text-slate-600"
                  >
                    Tip Jar
                  </a>
                </div>
              ) : null}
            </div>
            {socialLinkEntries.length > 0 ? (
              <div className="flex flex-wrap gap-3 text-sm text-slate-700">
                {socialLinkEntries.map(([platform, link]) => (
                  <a
                    key={platform}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-slate-200 px-3 py-1 font-medium text-slate-900 hover:border-slate-400"
                  >
                    {titleCase(platform)}
                  </a>
                ))}
              </div>
            ) : null}
          </div>
          {artist.bio ? (
            <p className="text-sm text-slate-600 leading-relaxed">{artist.bio}</p>
          ) : (
            <p className="text-sm text-slate-500">Add a bio to let venues know what makes your sound unique.</p>
          )}
        </section>

        <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Upcoming events</h2>
          <ul className="space-y-3 text-sm text-slate-600">
            {artist.events.length === 0 ? (
              <li>No events scheduled yet.</li>
            ) : (
              artist.events.map((event) => (
                <li key={event.id} className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-sm font-semibold text-slate-900">{event.title ?? "Untitled event"}</p>
                  <p className="text-xs text-slate-500">{formatDate(event.eventDate, event.eventTime)}</p>
                  <p className="text-xs text-slate-500">
                    {event.venue.name} • {event.venue.city}, {event.venue.state}
                  </p>
                </li>
              ))
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}

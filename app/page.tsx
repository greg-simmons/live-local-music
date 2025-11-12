import Link from "next/link";

export default function Home() {
  return (
    <div className="bg-gradient-to-b from-slate-100 via-white to-white">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 pb-24 pt-16 md:flex-row md:items-center">
        <div className="flex-1 space-y-6">
          <span className="inline-flex items-center rounded-full bg-slate-900/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-900">
            Live Local Music MVP
          </span>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Discover and promote live music right in your neighborhood.
          </h1>
          <p className="max-w-xl text-lg text-slate-600">
            Artists, venues, and music fans all meet here. Share your upcoming shows, fill your calendar, and find new local music experiences with ease.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/register/artist"
              className="rounded-full bg-slate-900 px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Join as an Artist
            </Link>
            <Link
              href="/register/venue"
              className="rounded-full border border-slate-300 px-6 py-3 text-center text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
            >
              List a Venue
            </Link>
          </div>
        </div>
        <div className="flex-1 space-y-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">How it works</h2>
          <ol className="space-y-4 text-slate-600">
            <li>
              <span className="font-semibold text-slate-900">Artists</span> build a profile, promote shows, and connect with venues actively booking live music.
            </li>
            <li>
              <span className="font-semibold text-slate-900">Venues</span> manage calendars, post event details, and highlight open dates for performers.
            </li>
            <li>
              <span className="font-semibold text-slate-900">Fans</span> browse the <Link href="/events" className="underline decoration-slate-400 underline-offset-4 hover:text-slate-900">public events feed</Link> to see what&rsquo;s playing nearby.
            </li>
          </ol>
        </div>
      </section>
      <section className="bg-white">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-6 py-16 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <h3 className="text-lg font-semibold text-slate-900">Centralized dashboards</h3>
            <p className="mt-3 text-sm text-slate-600">
              Dedicated workspaces for admins, artists, and venues keep your upcoming shows and tasks organized at a glance.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <h3 className="text-lg font-semibold text-slate-900">Simple registration</h3>
            <p className="mt-3 text-sm text-slate-600">
              Sign up in minutes with our artist and venue onboarding forms. We only collect the essentials to get you live quickly.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <h3 className="text-lg font-semibold text-slate-900">Event discovery</h3>
            <p className="mt-3 text-sm text-slate-600">
              Filter the events feed by date and radius to find shows that fit your vibe and schedule.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

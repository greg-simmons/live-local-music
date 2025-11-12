import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Geist, Geist_Mono } from "next/font/google";
import { auth, signOut } from "@/lib/auth";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Live Local Music",
  description: "Discover artists, venues, and upcoming shows in your community.",
};

function dashboardPath(role: "admin" | "artist" | "venue") {
  switch (role) {
    case "admin":
      return "/admin";
    case "artist":
      return "/artist/dashboard";
    case "venue":
    default:
      return "/venue/dashboard";
  }
}

async function handleSignOut() {
  "use server";

  await signOut();
  redirect("/");
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-slate-50 text-slate-900 antialiased`}
      >
        <div className="flex min-h-screen flex-col">
          <header className="border-b border-slate-200 bg-white">
            <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
              <div className="flex items-center gap-6">
                <Link href="/" className="text-lg font-semibold text-slate-900">
                  Live Local Music
                </Link>
                <div className="hidden items-center gap-4 text-sm font-medium text-slate-600 md:flex">
                  <Link href="/events" className="hover:text-slate-900">
                    Events
                  </Link>
                  <Link href="/register/artist" className="hover:text-slate-900">
                    Artist Signup
                  </Link>
                  <Link href="/register/venue" className="hover:text-slate-900">
                    Venue Signup
                  </Link>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm font-medium">
                {session ? (
                  <div className="flex items-center gap-3">
                    <span className="hidden text-slate-600 sm:inline">
                      {session.user.email}
                    </span>
                    <Link
                      href={dashboardPath(session.user.role)}
                      className="rounded-full bg-slate-900 px-4 py-2 text-white transition hover:bg-slate-700"
                    >
                      Dashboard
                    </Link>
                    <form action={handleSignOut}>
                      <button
                        type="submit"
                        className="rounded-full border border-slate-300 px-4 py-2 text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
                      >
                        Log out
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <Link
                      href="/login"
                      className="rounded-full border border-slate-300 px-4 py-2 text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
                    >
                      Log in
                    </Link>
                    <Link
                      href="/register/artist"
                      className="rounded-full bg-slate-900 px-4 py-2 text-white transition hover:bg-slate-700"
                    >
                      Get Started
                    </Link>
                  </div>
                )}
              </div>
            </nav>
          </header>
          <main className="flex-1 bg-slate-50">{children}</main>
          <footer className="border-t border-slate-200 bg-white">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-6 py-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
              <p>&copy; {new Date().getFullYear()} Live Local Music. All rights reserved.</p>
              <div className="flex gap-4">
                <Link href="/events" className="hover:text-slate-700">
                  Browse events
                </Link>
                <Link href="/register/venue" className="hover:text-slate-700">
                  List your venue
                </Link>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}

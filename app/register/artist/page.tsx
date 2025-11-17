import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ArtistRegisterForm } from "./register-form";

export default async function ArtistRegisterPage() {
  const genres = await prisma.genre.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-10 px-6 py-16">
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold text-slate-900">Artist signup</h1>
        <p className="text-sm text-slate-600">
          Create your artist profile to promote shows and connect with local venues.
        </p>
      </div>
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <ArtistRegisterForm genres={genres} />
      </div>
      <p className="text-sm text-slate-600">
        Managing a venue instead? <Link href="/register/venue" className="font-semibold text-slate-900 hover:underline">Register your venue account</Link>.
      </p>
    </div>
  );
}

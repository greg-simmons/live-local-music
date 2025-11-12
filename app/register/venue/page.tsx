import Link from "next/link";
import { VenueRegisterForm } from "./register-form";

export default function VenueRegisterPage() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-6 py-16">
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold text-slate-900">Venue signup</h1>
        <p className="text-sm text-slate-600">
          Tell artists about your space and start posting upcoming shows.
        </p>
      </div>
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <VenueRegisterForm />
      </div>
      <p className="text-sm text-slate-600">
        Looking to perform instead? <Link href="/register/artist" className="font-semibold text-slate-900 hover:underline">Join as an artist</Link>.
      </p>
    </div>
  );
}

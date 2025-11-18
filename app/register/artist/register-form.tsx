"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { registerArtist } from "./actions";
import type { ArtistRegisterState } from "./actions";

type GenreOption = {
  id: string;
  name: string;
};

type ArtistRegisterFormProps = {
  genres: GenreOption[];
};

const initialState: ArtistRegisterState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className="w-full rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70"
      disabled={pending}
    >
      {pending ? "Creating account..." : "Create artist account"}
    </button>
  );
}

export function ArtistRegisterForm({ genres }: ArtistRegisterFormProps) {
  const [state, formAction] = useActionState(registerArtist, initialState);

  return (
    <form action={formAction} encType="multipart/form-data" className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="name" className="block text-sm font-medium text-slate-700">
            Artist or band name
          </label>
          <input
            id="name"
            name="name"
            autoComplete="organization"
            required
            className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="zipCode" className="block text-sm font-medium text-slate-700">
            Home zip code (optional)
          </label>
          <input
            id="zipCode"
            name="zipCode"
            autoComplete="postal-code"
            className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <label htmlFor="bio" className="block text-sm font-medium text-slate-700">
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            rows={4}
            placeholder="Tell venues what makes your performances unique."
            className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <label htmlFor="email" className="block text-sm font-medium text-slate-700">
            Contact email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-medium text-slate-700">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700">
            Confirm password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="contactName" className="block text-sm font-medium text-slate-700">
            Booking contact name
          </label>
          <input
            id="contactName"
            name="contactName"
            autoComplete="name"
            required
            className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="contactPhone" className="block text-sm font-medium text-slate-700">
            Booking phone
          </label>
          <input
            id="contactPhone"
            name="contactPhone"
            type="tel"
            autoComplete="tel"
            required
            className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="website" className="block text-sm font-medium text-slate-700">
            Website
          </label>
          <input
            id="website"
            name="website"
            type="url"
            autoComplete="url"
            placeholder="https://..."
            className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="profile-image" className="block text-sm font-medium text-slate-700">
            Profile image
          </label>
          <input
            id="profile-image"
            name="profileImage"
            type="file"
            accept="image/*"
            className="w-full rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm file:mr-4 file:rounded-full file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:border-slate-400 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <label htmlFor="tipUrl" className="block text-sm font-medium text-slate-700">
            Tip jar link
          </label>
          <input
            id="tipUrl"
            name="tipUrl"
            type="url"
            placeholder="https://venmo.com/yourband"
            className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
          />
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-sm font-medium text-slate-700">Social links</p>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="facebook" className="block text-sm text-slate-600">
              Facebook URL
            </label>
            <input
              id="facebook"
              name="facebook"
              type="url"
              placeholder="https://facebook.com/yourband"
              className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="instagram" className="block text-sm text-slate-600">
              Instagram URL
            </label>
            <input
              id="instagram"
              name="instagram"
              type="url"
              placeholder="https://instagram.com/yourband"
              className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="youtube" className="block text-sm text-slate-600">
              YouTube URL
            </label>
            <input
              id="youtube"
              name="youtube"
              type="url"
              placeholder="https://youtube.com/@yourband"
              className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="tiktok" className="block text-sm text-slate-600">
              TikTok URL
            </label>
            <input
              id="tiktok"
              name="tiktok"
              type="url"
              placeholder="https://tiktok.com/@yourband"
              className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium text-slate-700">Genres</p>
        <div className="grid gap-3 md:grid-cols-2">
          {genres.length ? (
            genres.map((genre) => (
              <label
                key={genre.id}
                htmlFor={`genre-${genre.id}`}
                className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 shadow-sm"
              >
                <input
                  type="checkbox"
                  id={`genre-${genre.id}`}
                  name="genres"
                  value={genre.id}
                  className="h-4 w-4 rounded border-slate-400 text-slate-900 accent-slate-900 focus:ring-slate-500"
                />
                <span>{genre.name}</span>
              </label>
            ))
          ) : (
            <p className="text-sm text-slate-500">No genres available yet.</p>
          )}
        </div>
      </div>

      {state?.error ? <p className="text-sm font-medium text-rose-600">{state.error}</p> : null}
      <SubmitButton />
    </form>
  );
}

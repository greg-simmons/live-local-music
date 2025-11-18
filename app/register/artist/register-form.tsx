"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { registerArtist } from "./actions";
import type { FormState } from "./actions";

type GenreOption = {
  id: string;
  name: string;
};

type ArtistRegisterFormProps = {
  genres: GenreOption[];
};

const initialState: FormState = { ok: false, errors: {}, values: {} };

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
  const selectedGenres = new Set((state.values?.genres ?? "").split(",").filter(Boolean));

  const fieldClass = (field: string) =>
    `w-full rounded-xl border px-4 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 ${
      state.errors?.[field]
        ? "border-rose-500 focus:border-rose-500 focus:ring-rose-200"
        : "border-slate-300 focus:border-slate-500 focus:ring-slate-200"
    }`;

  const textareaClass = (field: string) =>
    `w-full rounded-xl border px-4 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 ${
      state.errors?.[field]
        ? "border-rose-500 focus:border-rose-500 focus:ring-rose-200"
        : "border-slate-300 focus:border-slate-500 focus:ring-slate-200"
    }`;

  useEffect(() => {
    if (!state.errors || Object.keys(state.errors).length === 0) {
      return;
    }

    const firstErrorField = Object.keys(state.errors)[0];
    const el = document.getElementById(firstErrorField);
    if (!el) return;

    el.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => {
      if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
        el.focus({ preventScroll: true });
      }
    }, 200);
  }, [state.errors]);

  return (
    <form action={formAction} encType="multipart/form-data" className="space-y-6">
      {state.formError ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{state.formError}</div>
      ) : null}
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
            defaultValue={state.values?.name ?? ""}
            className={fieldClass("name")}
          />
          {state.errors?.name ? <p className="text-xs text-rose-600">{state.errors.name}</p> : null}
        </div>
        <div className="space-y-2">
          <label htmlFor="zipCode" className="block text-sm font-medium text-slate-700">
            Home zip code (optional)
          </label>
          <input
            id="zipCode"
            name="zipCode"
            autoComplete="postal-code"
            defaultValue={state.values?.zipCode ?? ""}
            className={fieldClass("zipCode")}
          />
          {state.errors?.zipCode ? <p className="text-xs text-rose-600">{state.errors.zipCode}</p> : null}
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
            defaultValue={state.values?.bio ?? ""}
            className={textareaClass("bio")}
          />
          {state.errors?.bio ? <p className="text-xs text-rose-600">{state.errors.bio}</p> : null}
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
            defaultValue={state.values?.email ?? ""}
            className={fieldClass("email")}
          />
          {state.errors?.email ? <p className="text-xs text-rose-600">{state.errors.email}</p> : null}
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
            className={fieldClass("password")}
          />
          {state.errors?.password ? <p className="text-xs text-rose-600">{state.errors.password}</p> : null}
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
            className={fieldClass("confirmPassword")}
          />
          {state.errors?.confirmPassword ? <p className="text-xs text-rose-600">{state.errors.confirmPassword}</p> : null}
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
            defaultValue={state.values?.contactName ?? ""}
            className={fieldClass("contactName")}
          />
          {state.errors?.contactName ? <p className="text-xs text-rose-600">{state.errors.contactName}</p> : null}
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
            defaultValue={state.values?.contactPhone ?? ""}
            className={fieldClass("contactPhone")}
          />
          {state.errors?.contactPhone ? <p className="text-xs text-rose-600">{state.errors.contactPhone}</p> : null}
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
            defaultValue={state.values?.website ?? ""}
            className={fieldClass("website")}
          />
          {state.errors?.website ? <p className="text-xs text-rose-600">{state.errors.website}</p> : null}
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
            defaultValue={state.values?.tipUrl ?? ""}
            className={fieldClass("tipUrl")}
          />
          {state.errors?.tipUrl ? <p className="text-xs text-rose-600">{state.errors.tipUrl}</p> : null}
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
              defaultValue={state.values?.facebook ?? ""}
              className={fieldClass("facebook")}
            />
            {state.errors?.facebook ? <p className="text-xs text-rose-600">{state.errors.facebook}</p> : null}
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
              defaultValue={state.values?.instagram ?? ""}
              className={fieldClass("instagram")}
            />
            {state.errors?.instagram ? <p className="text-xs text-rose-600">{state.errors.instagram}</p> : null}
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
              defaultValue={state.values?.youtube ?? ""}
              className={fieldClass("youtube")}
            />
            {state.errors?.youtube ? <p className="text-xs text-rose-600">{state.errors.youtube}</p> : null}
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
              defaultValue={state.values?.tiktok ?? ""}
              className={fieldClass("tiktok")}
            />
            {state.errors?.tiktok ? <p className="text-xs text-rose-600">{state.errors.tiktok}</p> : null}
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
                  defaultChecked={selectedGenres.has(genre.id)}
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
      <SubmitButton />
    </form>
  );
}

"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { registerVenue } from "./actions";
import type { FormState } from "./actions";

const initialState: FormState = { ok: false, errors: {}, values: {} };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className="w-full rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70"
      disabled={pending}
    >
      {pending ? "Creating account..." : "Create venue account"}
    </button>
  );
}

export function VenueRegisterForm() {
  const [state, formAction] = useActionState(registerVenue, initialState);

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
            Venue name
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
      </div>
      <div className="grid gap-6 md:grid-cols-2">
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
          {state.errors?.confirmPassword ? (
            <p className="text-xs text-rose-600">{state.errors.confirmPassword}</p>
          ) : null}
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
          <label htmlFor="venuePhone" className="block text-sm font-medium text-slate-700">
            Venue phone (public)
          </label>
          <input
            id="venuePhone"
            name="venuePhone"
            type="tel"
            autoComplete="tel"
            defaultValue={state.values?.venuePhone ?? ""}
            className={fieldClass("venuePhone")}
          />
          {state.errors?.venuePhone ? <p className="text-xs text-rose-600">{state.errors.venuePhone}</p> : null}
        </div>
        <div className="space-y-2">
          <label htmlFor="website" className="block text-sm font-medium text-slate-700">
            Website
          </label>
          <input
            id="website"
            name="website"
            type="url"
            autoComplete="url"
            defaultValue={state.values?.website ?? ""}
            className={fieldClass("website")}
          />
          {state.errors?.website ? <p className="text-xs text-rose-600">{state.errors.website}</p> : null}
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
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
        <div className="space-y-2">
          <label htmlFor="description" className="block text-sm font-medium text-slate-700">
            Short description (optional)
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            defaultValue={state.values?.description ?? ""}
            className={textareaClass("description")}
          />
          {state.errors?.description ? <p className="text-xs text-rose-600">{state.errors.description}</p> : null}
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="address" className="block text-sm font-medium text-slate-700">
            Street address
          </label>
          <input
            id="address"
            name="address"
            autoComplete="street-address"
            required
            defaultValue={state.values?.address ?? ""}
            className={fieldClass("address")}
          />
          {state.errors?.address ? <p className="text-xs text-rose-600">{state.errors.address}</p> : null}
        </div>
        <div className="space-y-2">
          <label htmlFor="city" className="block text-sm font-medium text-slate-700">
            City
          </label>
          <input
            id="city"
            name="city"
            autoComplete="address-level2"
            required
            defaultValue={state.values?.city ?? ""}
            className={fieldClass("city")}
          />
          {state.errors?.city ? <p className="text-xs text-rose-600">{state.errors.city}</p> : null}
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-2">
          <label htmlFor="state" className="block text-sm font-medium text-slate-700">
            State
          </label>
          <input
            id="state"
            name="state"
            maxLength={2}
            autoComplete="address-level1"
            required
            defaultValue={state.values?.state ?? ""}
            className={`${fieldClass("state")} uppercase tracking-[0.2em]`}
          />
          {state.errors?.state ? <p className="text-xs text-rose-600">{state.errors.state}</p> : null}
        </div>
        <div className="space-y-2">
          <label htmlFor="zipCode" className="block text-sm font-medium text-slate-700">
            Zip code
          </label>
          <input
            id="zipCode"
            name="zipCode"
            autoComplete="postal-code"
            required
            defaultValue={state.values?.zipCode ?? ""}
            className={fieldClass("zipCode")}
          />
          {state.errors?.zipCode ? <p className="text-xs text-rose-600">{state.errors.zipCode}</p> : null}
        </div>
        <div className="space-y-2">
          <span className="block text-sm font-medium text-slate-700">Allows smoking</span>
          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 shadow-sm">
            <input
              type="checkbox"
              id="allowsSmoking"
              name="allowsSmoking"
              defaultChecked={state.values?.allowsSmoking === "on"}
              className="h-5 w-5 rounded border-slate-400 text-slate-900 accent-slate-900 focus:ring-slate-500"
            />
            <span>Check if guests are allowed to smoke inside the venue.</span>
          </label>
        </div>
      </div>
      <SubmitButton />
    </form>
  );
}

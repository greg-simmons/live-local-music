"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { registerVenue } from "./actions";
import type { VenueRegisterState } from "./actions";

const initialState: VenueRegisterState = {};

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

  return (
    <form action={formAction} className="space-y-6">
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
            className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
          />
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
            className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
          />
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
          <label htmlFor="venuePhone" className="block text-sm font-medium text-slate-700">
            Venue phone (public)
          </label>
          <input
            id="venuePhone"
            name="venuePhone"
            type="tel"
            autoComplete="tel"
            className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
          />
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
            className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
          />
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="profileImageUrl" className="block text-sm font-medium text-slate-700">
            Profile image URL
          </label>
          <input
            id="profileImageUrl"
            name="profileImageUrl"
            type="url"
            placeholder="https://..."
            className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
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
            className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
          />
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
            className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
          />
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
            className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
          />
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
            className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm uppercase tracking-[0.2em] text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
          />
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
            className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
          />
        </div>
        <div className="space-y-2">
          <span className="block text-sm font-medium text-slate-700">Allows smoking</span>
          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 shadow-sm">
            <input
              type="checkbox"
              id="allowsSmoking"
              name="allowsSmoking"
              className="h-5 w-5 rounded border-slate-400 text-slate-900 accent-slate-900 focus:ring-slate-500"
            />
            <span>Check if guests are allowed to smoke inside the venue.</span>
          </label>
        </div>
      </div>
      {state?.error ? <p className="text-sm font-medium text-rose-600">{state.error}</p> : null}
      <SubmitButton />
    </form>
  );
}

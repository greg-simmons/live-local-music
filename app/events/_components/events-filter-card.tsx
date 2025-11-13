"use client";

import type { FormEventHandler } from "react";
import { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type DateFilterValue = "tonight" | "tomorrow" | "weekend" | "date";

export type FilterFormState = {
  zip: string;
  radius: string;
  when: DateFilterValue;
  date: string;
};

type DateOption = {
  label: string;
  value: DateFilterValue;
};

type EventsFilterCardProps = {
  initialValues: FilterFormState;
  radiusOptions: readonly number[];
  dateOptions: readonly DateOption[];
  locationError: boolean;
};

export function EventsFilterCard({
  initialValues,
  radiusOptions,
  dateOptions,
  locationError,
}: EventsFilterCardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, setState] = useState<FilterFormState>(initialValues);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setState(initialValues);
  }, [initialValues]);

  const updateUrl = (values: FilterFormState) => {
    const params = new URLSearchParams(searchParams.toString());

    const setParam = (key: string, value: string) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    };

    setParam("zip", values.zip);
    setParam("radius", values.radius);

    const shouldPersistWhen = values.when !== "tonight" || values.radius || values.zip || values.date;
    if (shouldPersistWhen) {
      setParam("when", values.when);
    } else {
      params.delete("when");
    }

    if (values.when === "date") {
      setParam("date", values.date);
    } else {
      params.delete("date");
    }

    startTransition(() => {
      const query = params.toString();
      router.replace(`/events${query ? `?${query}` : ""}`);
    });
  };

  const handleSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    updateUrl(state);
  };

  const handleReset = () => {
    const resetState: FilterFormState = {
      zip: "",
      radius: "",
      when: "tonight",
      date: "",
    };
    setState(resetState);
    startTransition(() => router.replace("/events"));
  };

  const handleWhenChange = (value: DateFilterValue) => {
    setState((prev) => ({
      ...prev,
      when: value,
    }));
  };

  const disableSubmit = isPending || (state.when === "date" && !state.date);

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <label htmlFor="zip-input" className="block text-sm font-medium text-slate-700">
            ZIP code
          </label>
          <input
            id="zip-input"
            name="zip"
            inputMode="numeric"
            maxLength={5}
            autoComplete="postal-code"
            pattern="[0-9]{5}"
            placeholder="e.g. 95060"
            value={state.zip}
            onChange={(event) =>
              setState((prev) => ({
                ...prev,
                zip: event.target.value.replace(/\D/g, "").slice(0, 5),
              }))
            }
            className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="radius-select" className="block text-sm font-medium text-slate-700">
            Radius
          </label>
          <select
            id="radius-select"
            name="radius"
            value={state.radius}
            onChange={(event) =>
              setState((prev) => ({
                ...prev,
                radius: event.target.value,
              }))
            }
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
          >
            <option value="">Choose radius</option>
            {radiusOptions.map((miles) => (
              <option key={miles} value={miles.toString()}>
                {miles} miles
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <span className="block text-sm font-medium text-slate-700">Date</span>
          <div className="grid grid-cols-2 gap-2">
            {dateOptions.map((option) => {
              const isActive = state.when === option.value;
              return (
                <label
                  key={option.value}
                  className={`cursor-pointer rounded-2xl border px-3 py-2 text-xs font-semibold uppercase tracking-wide ${
                    isActive
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 text-slate-600 hover:border-slate-400"
                  }`}
                >
                  <input
                    type="radio"
                    name="when"
                    value={option.value}
                    checked={isActive}
                    onChange={() => handleWhenChange(option.value)}
                    className="sr-only"
                  />
                  {option.label}
                </label>
              );
            })}
          </div>
        </div>
      </div>

      {state.when === "date" ? (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <label htmlFor="date-picker" className="text-sm font-medium text-slate-700">
            Pick a date
          </label>
          <input
            id="date-picker"
            type="date"
            value={state.date}
            required={state.when === "date"}
            onChange={(event) =>
              setState((prev) => ({
                ...prev,
                date: event.target.value,
              }))
            }
            className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200 sm:max-w-xs"
          />
        </div>
      ) : null}

      {locationError ? (
        <p className="text-sm text-red-600">
          We couldn&apos;t resolve that ZIP code, so events are shown without a distance filter.
        </p>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
        <button
          type="submit"
          disabled={disableSubmit}
          className={`rounded-full px-6 py-3 text-sm font-semibold text-white transition ${
            disableSubmit ? "bg-slate-400" : "bg-slate-900 hover:bg-slate-700"
          }`}
        >
          {isPending ? "Updating..." : "Apply filters"}
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          Reset
        </button>
      </div>
    </form>
  );
}

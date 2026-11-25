"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  getRouteDestinations,
  getSupportedSearchRoute,
  SEARCH_CITIES,
} from "@/lib/rides/supported-routes";

export function SearchRideScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [source, setSource] = useState("Pune");
  const [destination, setDestination] = useState("Mumbai");
  const [rideDate, setRideDate] = useState("");
  const [error, setError] = useState("");
  const allowedDestinations = getRouteDestinations(source);
  const routeError =
    searchParams.get("error") === "route"
      ? "Search is limited to the supported routes shown in the location lists."
      : "";

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const supportedRoute = getSupportedSearchRoute(source, destination);
    if (!supportedRoute || !rideDate) {
      setError("Choose a supported route and travel date.");
      return;
    }

    const params = new URLSearchParams({
      from: supportedRoute.source,
      to: supportedRoute.destination,
      date: rideDate,
    });
    router.push(`/rides?${params.toString()}`);
  }

  return (
    <main className="min-h-dvh bg-[#F7F8FC] px-5 py-8 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-5xl">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#173F35] text-white">
              <svg aria-hidden="true" viewBox="0 0 48 48" className="h-7 w-7" fill="none">
                <path d="M24 9v30M18 15l6-6 6 6M16 33l8-8 8 8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>
            <span className="text-xl font-bold text-[#17221F]">RideShare</span>
          </div>
          <button
            type="button"
            onClick={() => router.push("/rides/new")}
            className="rounded-xl border border-[#DDE3E0] bg-white px-4 py-3 text-sm font-semibold text-[#173F35] shadow-sm transition hover:border-[#173F35]"
          >
            Offer a ride
          </button>
        </header>

        <section className="mt-14 grid items-center gap-10 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#6D7C77]">
              Find a ride
            </p>
            <h1 className="mt-3 max-w-md text-4xl font-bold leading-tight tracking-tight text-[#17221F] sm:text-5xl">
              Where are you going?
            </h1>
            <p className="mt-5 max-w-md leading-7 text-[#66736F]">
              Search available rides and share the journey with fellow travelers.
            </p>
          </div>

          <form
            onSubmit={handleSearch}
            className="rounded-[2rem] border border-white/80 bg-white p-6 shadow-[0_24px_70px_rgba(32,45,71,0.10)] sm:p-8"
          >
            <div className="space-y-5">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-[#34413D]">From</span>
                <select
                  value={source}
                  onChange={(event) => {
                    const nextSource = event.target.value;
                    const nextDestinations = getRouteDestinations(nextSource);
                    setSource(nextSource);
                    setDestination(nextDestinations[0] ?? "");
                  }}
                  className="h-14 w-full rounded-xl border border-[#DDE3E0] px-4 text-[#17221F] outline-none transition placeholder:text-[#A6AFAC] focus:border-[#173F35] focus:ring-4 focus:ring-[#173F35]/10"
                >
                  {SEARCH_CITIES.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-[#34413D]">To</span>
                <select
                  value={destination}
                  onChange={(event) => setDestination(event.target.value)}
                  disabled={allowedDestinations.length === 0}
                  className="h-14 w-full rounded-xl border border-[#DDE3E0] px-4 text-[#17221F] outline-none transition placeholder:text-[#A6AFAC] focus:border-[#173F35] focus:ring-4 focus:ring-[#173F35]/10"
                >
                  {allowedDestinations.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-[#34413D]">Travel date</span>
                <input
                  type="date"
                  value={rideDate}
                  onChange={(event) => setRideDate(event.target.value)}
                  className="h-14 w-full rounded-xl border border-[#DDE3E0] px-4 text-[#17221F] outline-none transition focus:border-[#173F35] focus:ring-4 focus:ring-[#173F35]/10"
                />
              </label>
            </div>

            {error || routeError ? (
              <p role="alert" className="mt-4 text-sm font-medium text-red-600">
                {error || routeError}
              </p>
            ) : null}

            <button
              type="submit"
              className="mt-6 flex h-14 w-full items-center justify-center rounded-xl bg-[#173F35] px-5 text-base font-semibold text-white shadow-[0_12px_24px_rgba(23,63,53,0.20)] transition hover:bg-[#215447] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#173F35]/20 active:scale-[0.99]"
            >
              Search rides
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}

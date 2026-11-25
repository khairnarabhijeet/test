"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createRide } from "@/lib/rides/actions";
import {
  getRouteDestinations,
  getSupportedSearchRoute,
  SEARCH_CITIES,
} from "@/lib/rides/supported-routes";

export function OfferRideScreen() {
  const router = useRouter();
  const [source, setSource] = useState("Pune");
  const [destination, setDestination] = useState("Mumbai");
  const [error, setError] = useState("");
  const [posted, setPosted] = useState(false);
  const [loading, setLoading] = useState(false);
  const allowedDestinations = getRouteDestinations(source);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPosted(false);

    const form = new FormData(event.currentTarget);
    const selectedSource = String(form.get("source") || "").trim();
    const selectedDestination = String(form.get("destination") || "").trim();
    const rideDate = String(form.get("rideDate") || "");
    const departureTime = String(form.get("departureTime") || "");
    const availableSeats = Number(form.get("availableSeats"));
    const pricePerSeat = Number(form.get("pricePerSeat"));
    const vehicleName = String(form.get("vehicleName") || "").trim();

    if (
      !rideDate ||
      !departureTime ||
      !vehicleName ||
      !Number.isInteger(availableSeats) ||
      availableSeats < 1 ||
      !Number.isFinite(pricePerSeat) ||
      pricePerSeat < 0
    ) {
      setError("Complete all fields with valid values.");
      return;
    }

    const supportedRoute = getSupportedSearchRoute(
      selectedSource,
      selectedDestination,
    );
    if (!supportedRoute) {
      setError("Choose one of the supported Pune routes.");
      return;
    }

    setLoading(true);
    try {
      await createRide({
        source: supportedRoute.source,
        destination: supportedRoute.destination,
        rideDate,
        departureTime,
        availableSeats,
        pricePerSeat,
        vehicleName,
      });
      setPosted(true);
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Unable to post ride.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-dvh bg-[#F7F8FC] px-5 py-8 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-4xl">
        <header className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.push("/search")}
            className="flex items-center gap-2 text-sm font-semibold text-[#173F35]"
          >
            <span aria-hidden="true" className="text-xl">←</span>
            Back
          </button>
          <button
            type="button"
            onClick={() => router.push("/my-rides")}
            className="rounded-xl border border-[#DDE3E0] bg-white px-4 py-3 text-sm font-semibold text-[#173F35] shadow-sm"
          >
            My rides
          </button>
        </header>

        <section className="mt-8">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#6D7C77]">
            Offer a ride
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#17221F] sm:text-4xl">
            Share your journey
          </h1>
        </section>

        <form
          onSubmit={handleSubmit}
          className="mt-8 rounded-[1.5rem] border border-white/80 bg-white p-6 shadow-[0_16px_45px_rgba(32,45,71,0.08)] sm:p-8"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-[#34413D]">Source</span>
              <select
                name="source"
                value={source}
                onChange={(event) => {
                  const nextSource = event.target.value;
                  const nextDestinations = getRouteDestinations(nextSource);
                  setSource(nextSource);
                  setDestination(nextDestinations[0] ?? "");
                }}
                className="h-14 w-full rounded-xl border border-[#DDE3E0] px-4 outline-none transition focus:border-[#173F35] focus:ring-4 focus:ring-[#173F35]/10"
              >
                {SEARCH_CITIES.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-[#34413D]">Destination</span>
              <select
                name="destination"
                value={destination}
                onChange={(event) => setDestination(event.target.value)}
                disabled={allowedDestinations.length === 0}
                className="h-14 w-full rounded-xl border border-[#DDE3E0] px-4 outline-none transition focus:border-[#173F35] focus:ring-4 focus:ring-[#173F35]/10"
              >
                {allowedDestinations.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-[#34413D]">Date</span>
              <input name="rideDate" type="date" className="h-14 w-full rounded-xl border border-[#DDE3E0] px-4 outline-none transition focus:border-[#173F35] focus:ring-4 focus:ring-[#173F35]/10" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-[#34413D]">Departure time</span>
              <input name="departureTime" type="time" className="h-14 w-full rounded-xl border border-[#DDE3E0] px-4 outline-none transition focus:border-[#173F35] focus:ring-4 focus:ring-[#173F35]/10" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-[#34413D]">Available seats</span>
              <input name="availableSeats" type="number" min="1" max="8" placeholder="3" className="h-14 w-full rounded-xl border border-[#DDE3E0] px-4 outline-none transition placeholder:text-[#A6AFAC] focus:border-[#173F35] focus:ring-4 focus:ring-[#173F35]/10" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-[#34413D]">Price per seat (₹)</span>
              <input name="pricePerSeat" type="number" min="0" step="1" placeholder="450" className="h-14 w-full rounded-xl border border-[#DDE3E0] px-4 outline-none transition placeholder:text-[#A6AFAC] focus:border-[#173F35] focus:ring-4 focus:ring-[#173F35]/10" />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-2 block text-sm font-semibold text-[#34413D]">Vehicle name</span>
              <input name="vehicleName" type="text" placeholder="Honda City" className="h-14 w-full rounded-xl border border-[#DDE3E0] px-4 outline-none transition placeholder:text-[#A6AFAC] focus:border-[#173F35] focus:ring-4 focus:ring-[#173F35]/10" />
            </label>
          </div>

          {error ? (
            <p role="alert" className="mt-5 text-sm font-medium text-red-600">{error}</p>
          ) : null}

          {posted ? (
            <div role="status" className="mt-5 rounded-xl bg-[#E4F2EC] px-4 py-3 text-center text-sm font-semibold text-[#173F35]">
              Ride posted successfully
            </div>
          ) : (
            <button
              type="submit"
              disabled={loading}
              aria-busy={loading}
              className="mt-6 flex h-14 w-full items-center justify-center rounded-xl bg-[#173F35] text-base font-semibold text-white shadow-[0_12px_24px_rgba(23,63,53,0.20)] transition hover:bg-[#215447] disabled:cursor-wait disabled:opacity-70"
            >
              {loading ? "Posting..." : "Post ride"}
            </button>
          )}
        </form>
      </div>
    </main>
  );
}

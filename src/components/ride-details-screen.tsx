"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { requestSeat } from "@/lib/rides/actions";

export function RideDetailsScreen({
  rideId,
  ride,
  isSample = false,
}: {
  rideId: string;
  isSample?: boolean;
  ride: {
    driverName: string;
    rating: string;
    vehicleName: string;
    source: string;
    destination: string;
    rideDate: string;
    departureTime: string;
    availableSeats: number;
    pricePerSeat: number;
  };
}) {
  const router = useRouter();
  const [requested, setRequested] = useState(false);
  const [error, setError] = useState("");

  async function handleRequestSeat() {
    setError("");
    try {
      await requestSeat(rideId);
      setRequested(true);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to request a seat.",
      );
    }
  }

  return (
    <main className="min-h-dvh bg-[#F7F8FC] px-5 py-8 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-4xl">
        <header className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm font-semibold text-[#173F35]"
          >
            <span aria-hidden="true" className="text-xl">←</span>
            Back
          </button>
          <span className="text-sm font-medium text-[#89938F]">Ride #{rideId.slice(-6)}</span>
        </header>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_280px]">
          <div className="space-y-6">
            <article className="rounded-[1.5rem] border border-white/80 bg-white p-6 shadow-[0_16px_45px_rgba(32,45,71,0.08)]">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#6D7C77]">
                Route
              </p>
              <div className="mt-5 flex items-center gap-4">
                <div className="flex flex-col items-center">
                  <span className="h-3 w-3 rounded-full border-2 border-[#173F35] bg-white" />
                  <span className="h-12 w-px bg-[#CBD4D1]" />
                  <span className="h-3 w-3 rounded-full bg-[#173F35]" />
                </div>
                <div className="space-y-8">
                  <div>
                    <p className="text-xs text-[#89938F]">From</p>
                    <p className="mt-1 text-lg font-bold text-[#17221F]">{ride.source}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#89938F]">To</p>
                    <p className="mt-1 text-lg font-bold text-[#17221F]">{ride.destination}</p>
                  </div>
                </div>
              </div>
            </article>

            <article className="rounded-[1.5rem] border border-white/80 bg-white p-6 shadow-[0_16px_45px_rgba(32,45,71,0.08)]">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#6D7C77]">
                Ride information
              </p>
              <dl className="mt-5 grid grid-cols-2 gap-5 sm:grid-cols-3">
                <div>
                  <dt className="text-xs text-[#89938F]">Date</dt>
                  <dd className="mt-1 font-bold text-[#34413D]">{ride.rideDate}</dd>
                </div>
                <div>
                  <dt className="text-xs text-[#89938F]">Departure</dt>
                  <dd className="mt-1 font-bold text-[#34413D]">{ride.departureTime}</dd>
                </div>
                <div>
                  <dt className="text-xs text-[#89938F]">Vehicle</dt>
                  <dd className="mt-1 font-bold text-[#34413D]">{ride.vehicleName}</dd>
                </div>
              </dl>
            </article>

            <article className="rounded-[1.5rem] border border-white/80 bg-white p-6 shadow-[0_16px_45px_rgba(32,45,71,0.08)]">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#6D7C77]">
                Driver
              </p>
              <div className="mt-4 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E4F2EC] font-bold text-[#173F35]">
                  {ride.driverName.split(" ").map((part) => part[0]).join("")}
                </div>
                <div>
                  <p className="font-bold text-[#17221F]">{ride.driverName}</p>
                  <p className="mt-1 text-sm text-[#9A6324]">★ {ride.rating} rating</p>
                </div>
              </div>
            </article>
          </div>

          <aside className="h-fit rounded-[1.5rem] border border-white/80 bg-white p-6 shadow-[0_16px_45px_rgba(32,45,71,0.08)] lg:sticky lg:top-8">
            <p className="text-sm text-[#89938F]">Price per seat</p>
            <p className="mt-1 text-3xl font-bold text-[#17221F]">₹{ride.pricePerSeat}</p>

            <div className="mt-5 flex items-center justify-between rounded-xl bg-[#F4F7F6] px-4 py-3">
              <span className="text-sm text-[#66736F]">Seats available</span>
              <span className="font-bold text-[#173F35]">{ride.availableSeats}</span>
            </div>

            {isSample ? (
              <div role="status" className="mt-5 rounded-xl bg-[#FFF4E7] px-4 py-3 text-center text-sm font-medium text-[#9A6324]">
                Sample ride preview. Booking is unavailable.
              </div>
            ) : requested ? (
              <div role="status" className="mt-5 rounded-xl bg-[#E4F2EC] px-4 py-3 text-center text-sm font-semibold text-[#173F35]">
                Seat request sent
              </div>
            ) : (
              <button
                type="button"
                onClick={handleRequestSeat}
                className="mt-5 h-14 w-full rounded-xl bg-[#173F35] text-base font-semibold text-white shadow-[0_12px_24px_rgba(23,63,53,0.20)] transition hover:bg-[#215447] active:scale-[0.99]"
              >
                Request seat
              </button>
            )}
            {error ? (
              <p role="alert" className="mt-3 text-sm font-medium text-red-600">
                {error}
              </p>
            ) : null}
          </aside>
        </section>
      </div>
    </main>
  );
}

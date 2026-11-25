"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { acceptBooking, rejectBooking } from "@/lib/rides/actions";

type RequestStatus = "pending" | "accepted" | "rejected";

type MyRidesScreenProps = {
  postedRides: Array<{
    id: string;
    source: string;
    destination: string;
    rideDate: string;
    departureTime: string;
    vehicleName: string;
    filledSeats: number;
    totalSeats: number;
    requests: Array<{
      id: string;
      passengerName: string;
      seats: number;
      status: RequestStatus;
    }>;
  }>;
  passengerRides: Array<{
    id: string;
    source: string;
    destination: string;
    rideDate: string;
    departureTime: string;
    driverName: string;
    status: RequestStatus;
    driverMobile?: string;
  }>;
};

export function MyRidesScreen({
  postedRides,
  passengerRides,
}: MyRidesScreenProps) {
  const router = useRouter();
  const [view, setView] = useState<"driver" | "passenger">("driver");
  const [rides, setRides] = useState(postedRides);
  const [error, setError] = useState("");

  async function updateRequest(
    rideId: string,
    requestId: string,
    status: "accepted" | "rejected",
  ) {
    setError("");
    try {
      if (status === "accepted") await acceptBooking(requestId);
      else await rejectBooking(requestId);

      setRides((current) =>
        current.map((ride) =>
          ride.id === rideId
            ? {
                ...ride,
                requests: ride.requests.map((request) =>
                  request.id === requestId
                    ? { ...request, status }
                    : request,
                ),
                filledSeats:
                  status === "accepted"
                    ? ride.filledSeats +
                      (ride.requests.find((request) => request.id === requestId)
                        ?.seats ?? 0)
                    : ride.filledSeats,
              }
            : ride,
        ),
      );
    } catch (mutationError) {
      setError(
        mutationError instanceof Error
          ? mutationError.message
          : "Unable to update booking.",
      );
    }
  }

  return (
    <main className="min-h-dvh bg-[#F7F8FC] px-5 py-8 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-5xl">
        <header className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.push("/search")}
            className="flex items-center gap-2 text-sm font-semibold text-[#173F35]"
          >
            <span aria-hidden="true" className="text-xl">←</span>
            Search rides
          </button>
          <span className="text-lg font-bold text-[#17221F]">My rides</span>
        </header>

        <div className="mt-8 grid grid-cols-2 rounded-xl bg-[#EAEFEB] p-1">
          {(["driver", "passenger"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setView(option)}
              className={`h-11 rounded-lg text-sm font-semibold capitalize transition ${
                view === option
                  ? "bg-white text-[#173F35] shadow-sm"
                  : "text-[#74817C]"
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        {error ? (
          <p role="alert" className="mt-5 text-sm font-medium text-red-600">
            {error}
          </p>
        ) : null}

        {view === "driver" ? (
          <section className="mt-6 space-y-5">
            {rides.map((ride) => (
              <article
                key={ride.id}
                className="rounded-[1.5rem] border border-white/80 bg-white p-6 shadow-[0_16px_45px_rgba(32,45,71,0.08)]"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6D7C77]">
                      Posted ride
                    </p>
                    <h1 className="mt-2 text-xl font-bold text-[#17221F]">
                      {ride.source} <span className="text-[#96A19D]">→</span>{" "}
                      {ride.destination}
                    </h1>
                    <p className="mt-2 text-sm text-[#66736F]">
                      {ride.rideDate} · {ride.departureTime} · {ride.vehicleName}
                    </p>
                  </div>
                  <div className="rounded-xl bg-[#F4F7F6] px-4 py-3 text-center">
                    <p className="text-xs text-[#89938F]">Seats filled</p>
                    <p className="mt-1 text-lg font-bold text-[#173F35]">
                      {ride.filledSeats} / {ride.totalSeats}
                    </p>
                  </div>
                </div>

                <div className="mt-6 border-t border-[#EDF0EF] pt-5">
                  <h2 className="font-bold text-[#34413D]">Booking requests</h2>
                  {ride.requests.length === 0 ? (
                    <p className="mt-4 text-sm text-[#66736F]">
                      No booking requests yet.
                    </p>
                  ) : (
                    <div className="mt-4 space-y-3">
                      {ride.requests.map((request) => (
                        <div
                          key={request.id}
                          className="flex flex-col gap-3 rounded-xl border border-[#E7ECE9] p-4 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div>
                            <p className="font-semibold text-[#17221F]">
                              {request.passengerName}
                            </p>
                            <p className="mt-1 text-sm text-[#66736F]">
                              {request.seats}{" "}
                              {request.seats === 1 ? "seat" : "seats"}
                            </p>
                          </div>

                          {request.status === "pending" ? (
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  updateRequest(ride.id, request.id, "accepted")
                                }
                                className="h-10 rounded-lg bg-[#173F35] px-4 text-sm font-semibold text-white"
                              >
                                Accept
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  updateRequest(ride.id, request.id, "rejected")
                                }
                                className="h-10 rounded-lg border border-[#DDE3E0] px-4 text-sm font-semibold text-[#66736F]"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span
                              className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${
                                request.status === "accepted"
                                  ? "bg-[#E4F2EC] text-[#173F35]"
                                  : "bg-[#F1F2F2] text-[#78827E]"
                              }`}
                            >
                              {request.status}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </article>
            ))}
            {rides.length === 0 ? (
              <p className="rounded-[1.5rem] bg-white p-8 text-center text-[#66736F]">
                You have not posted any rides yet.
              </p>
            ) : null}
          </section>
        ) : (
          <section className="mt-6 space-y-5">
            {passengerRides.map((ride) => (
              <article
                key={ride.id}
                className="rounded-[1.5rem] border border-white/80 bg-white p-6 shadow-[0_16px_45px_rgba(32,45,71,0.08)]"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6D7C77]">
                      Requested ride
                    </p>
                    <h1 className="mt-2 text-xl font-bold text-[#17221F]">
                      {ride.source} <span className="text-[#96A19D]">→</span>{" "}
                      {ride.destination}
                    </h1>
                    <p className="mt-2 text-sm text-[#66736F]">
                      {ride.driverName} · {ride.rideDate} · {ride.departureTime}
                    </p>
                  </div>
                  <span
                    className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${
                      ride.status === "accepted"
                        ? "bg-[#E4F2EC] text-[#173F35]"
                        : ride.status === "rejected"
                          ? "bg-[#F1F2F2] text-[#78827E]"
                          : "bg-[#FFF4E7] text-[#9A6324]"
                    }`}
                  >
                    {ride.status}
                  </span>
                </div>

                {ride.status === "accepted" && ride.driverMobile ? (
                  <div className="mt-6 rounded-xl bg-[#F4F7F6] p-4">
                    <p className="text-xs text-[#89938F]">Driver mobile number</p>
                    <p className="mt-1 font-bold text-[#17221F]">
                      {ride.driverMobile}
                    </p>
                    <a
                      href={`https://wa.me/${ride.driverMobile.replace(/\D/g, "")}?text=${encodeURIComponent(`Hi ${ride.driverName}, I have a confirmed seat for our ride.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 flex h-12 items-center justify-center rounded-xl bg-[#25D366] text-sm font-bold text-white"
                    >
                      Chat on WhatsApp
                    </a>
                  </div>
                ) : null}
              </article>
            ))}
            {passengerRides.length === 0 ? (
              <p className="rounded-[1.5rem] bg-white p-8 text-center text-[#66736F]">
                You have not requested any rides yet.
              </p>
            ) : null}
          </section>
        )}
      </div>
    </main>
  );
}

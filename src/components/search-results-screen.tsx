"use client";

import { useRouter } from "next/navigation";

type RideResult = {
  id: string;
  isSample?: boolean;
  driverName: string;
  rating: string;
  vehicleName: string;
  departureTime: string;
  availableSeats: number;
  pricePerSeat: number;
};

export function SearchResultsScreen({
  source,
  destination,
  rideDate,
  rides,
}: {
  source: string;
  destination: string;
  rideDate: string;
  rides: RideResult[];
}) {
  const router = useRouter();

  const formattedDate = new Intl.DateTimeFormat("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(new Date(`${rideDate}T12:00:00`));

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
            New search
          </button>
          <button
            type="button"
            onClick={() => router.push("/rides/new")}
            className="rounded-xl border border-[#DDE3E0] bg-white px-4 py-3 text-sm font-semibold text-[#173F35] shadow-sm"
          >
            Offer a ride
          </button>
        </header>

        <section className="mt-8">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#6D7C77]">
            Search results
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#17221F] sm:text-4xl">
            {source} <span className="text-[#96A19D]">to</span> {destination}
          </h1>
          <p className="mt-2 text-sm text-[#66736F]">{formattedDate}</p>
        </section>

        <section className="mt-8 grid gap-5">
          {rides.map((ride) => (
            <article
              key={ride.id}
              className="rounded-[1.5rem] border border-white/80 bg-white p-5 shadow-[0_16px_45px_rgba(32,45,71,0.08)] sm:p-6"
            >
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#E4F2EC] text-base font-bold text-[#173F35]">
                    {ride.driverName.split(" ").map((part) => part[0]).join("")}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="truncate text-lg font-bold text-[#17221F]">
                        {ride.driverName}
                      </h2>
                      <span className="rounded-full bg-[#FFF4E7] px-2 py-1 text-xs font-bold text-[#9A6324]">
                        ★ {ride.rating}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-[#66736F]">{ride.vehicleName}</p>
                    {ride.isSample ? (
                      <p className="mt-1 text-xs font-medium text-[#9A6324]">
                        Sample ride
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 sm:min-w-[270px]">
                  <div>
                    <p className="text-xs text-[#89938F]">Departure</p>
                    <p className="mt-1 text-sm font-bold text-[#34413D]">
                      {ride.departureTime}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[#89938F]">Seats</p>
                    <p className="mt-1 text-sm font-bold text-[#34413D]">
                      {ride.availableSeats}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[#89938F]">Per seat</p>
                    <p className="mt-1 text-sm font-bold text-[#34413D]">
                      ₹{ride.pricePerSeat}
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  const params = new URLSearchParams({
                    from: source,
                    to: destination,
                    date: rideDate,
                  });
                  if (ride.isSample) params.set("demo", "1");
                  router.push(`/rides/${ride.id}?${params.toString()}`);
                }}
                className="mt-5 h-12 w-full rounded-xl border border-[#C9D4D0] text-sm font-semibold text-[#173F35] transition hover:border-[#173F35] hover:bg-[#F7FAF8]"
              >
                View details
              </button>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}

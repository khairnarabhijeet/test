import { Suspense } from "react";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { RideDetailsScreen } from "@/components/ride-details-screen";
import { createSupabaseServerClient } from "@/lib/supabase/server";

async function RideDetailsContent({
  params,
  searchParams,
}: {
  params: Promise<{ rideId: string }>;
  searchParams: Promise<{ demo?: string; from?: string; to?: string; date?: string }>;
}) {
  const { rideId } = await params;
  const search = await searchParams;

  if (search.demo === "1" && (rideId === "ride-1" || rideId === "ride-2")) {
    const isFirstSample = rideId === "ride-1";
    const rideDate =
      search.date && /^\d{4}-\d{2}-\d{2}$/.test(search.date)
        ? new Intl.DateTimeFormat("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }).format(new Date(`${search.date}T12:00:00`))
        : "Date not available";

    return (
      <RideDetailsScreen
        rideId={rideId}
        isSample
        ride={{
          driverName: isFirstSample ? "Aarav Sharma" : "Meera Patel",
          rating: isFirstSample ? "4.9" : "4.8",
          vehicleName: isFirstSample ? "Honda City" : "Hyundai i20",
          source: search.from ?? "Starting location",
          destination: search.to ?? "Destination",
          rideDate,
          departureTime: isFirstSample ? "07:30 AM" : "09:15 AM",
          availableSeats: isFirstSample ? 3 : 2,
          pricePerSeat: isFirstSample ? 450 : 380,
        }}
      />
    );
  }

  await connection();
  const supabase = await createSupabaseServerClient();
  const { data: ride } = await supabase
    .from("rides")
    .select(`
      source,
      destination,
      ride_date,
      departure_time,
      available_seats,
      price_per_seat,
      vehicle_name,
      users:users(name)
    `)
    .eq("id", rideId)
    .eq("status", "active")
    .single();

  if (!ride) notFound();

  return (
    <RideDetailsScreen
      rideId={rideId}
      ride={{
        driverName: ride.users?.[0]?.name ?? "Driver",
        rating: "4.9",
        vehicleName: ride.vehicle_name,
        source: ride.source,
        destination: ride.destination,
        rideDate: new Intl.DateTimeFormat("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }).format(new Date(`${ride.ride_date}T12:00:00`)),
        departureTime: ride.departure_time,
        availableSeats: ride.available_seats,
        pricePerSeat: ride.price_per_seat,
      }}
    />
  );
}

export default function RideDetailsPage({
  params,
  searchParams,
}: {
  params: Promise<{ rideId: string }>;
  searchParams: Promise<{ demo?: string; from?: string; to?: string; date?: string }>;
}) {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-dvh items-center justify-center bg-[#F7F8FC]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#C8D0CD] border-t-[#173F35]" />
        </main>
      }
    >
      <RideDetailsContent params={params} searchParams={searchParams} />
    </Suspense>
  );
}

import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { SearchResultsScreen } from "@/components/search-results-screen";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSupportedSearchRoute } from "@/lib/rides/supported-routes";

async function RidesContent({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; date?: string }>;
}) {
  await connection();
  const params = await searchParams;
  if (!params.from || !params.to || !params.date) {
    redirect("/search");
  }
  const route = getSupportedSearchRoute(params.from, params.to);
  if (!route) {
    redirect("/search?error=route");
  }

  const supabase = await createSupabaseServerClient();
  const { data: rides } = await supabase
    .from("rides")
    .select(`
      id,
      source,
      destination,
      ride_date,
      departure_time,
      available_seats,
      price_per_seat,
      vehicle_name,
      users:users(name)
    `)
    .eq("status", "active")
    .eq("ride_date", params.date)
    .ilike("source", route.source)
    .ilike("destination", route.destination)
    .gt("available_seats", 0)
    .order("departure_time");

  const fallbackRides = [
    {
      id: "ride-1",
      isSample: true,
      driverName: "Aarav Sharma",
      rating: "4.9",
      vehicleName: "Honda City",
      departureTime: "07:30 AM",
      availableSeats: 3,
      pricePerSeat: 450,
    },
    {
      id: "ride-2",
      isSample: true,
      driverName: "Meera Patel",
      rating: "4.8",
      vehicleName: "Hyundai i20",
      departureTime: "09:15 AM",
      availableSeats: 2,
      pricePerSeat: 380,
    },
  ];

  const liveRides =
    rides?.map((ride) => ({
      id: ride.id,
      driverName: ride.users?.[0]?.name ?? "Driver",
      rating: "4.9",
      vehicleName: ride.vehicle_name,
      departureTime: new Intl.DateTimeFormat("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }).format(new Date(`2026-01-01T${ride.departure_time}`)),
      availableSeats: ride.available_seats,
      pricePerSeat: ride.price_per_seat,
    })) ?? [];

  return (
    <SearchResultsScreen
      source={route.source}
      destination={route.destination}
      rideDate={params.date}
      rides={liveRides.length > 0 ? liveRides : fallbackRides}
    />
  );
}

export default function RidesPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; date?: string }>;
}) {
  return (
    <Suspense fallback={<main className="min-h-dvh bg-[#F7F8FC]" />}>
      <RidesContent searchParams={searchParams} />
    </Suspense>
  );
}

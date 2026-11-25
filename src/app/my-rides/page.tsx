import { Suspense } from "react";
import { redirect } from "next/navigation";
import { MyRidesScreen } from "@/components/my-rides-screen";
import { createSupabaseServerClient } from "@/lib/supabase/server";

async function MyRidesContent() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: ownedRides } = await supabase
    .from("rides")
    .select(`
      id,
      source,
      destination,
      ride_date,
      departure_time,
      vehicle_name,
      available_seats,
      status,
      bookings (
        id,
        requested_seats,
        status,
        users:users (name)
      )
    `)
    .eq("driver_id", user.id)
    .order("ride_date");

  const { data: passengerBookings } = await supabase
    .from("bookings")
    .select(`
      id,
      status,
      rides (
        id,
        source,
        destination,
        ride_date,
        departure_time,
        users:users (name, mobile_number)
      )
    `)
    .eq("passenger_id", user.id)
    .order("created_at");

  const postedRides =
    ownedRides?.map((ride) => ({
      id: ride.id,
      source: ride.source,
      destination: ride.destination,
      rideDate: new Intl.DateTimeFormat("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(new Date(`${ride.ride_date}T12:00:00`)),
      departureTime: ride.departure_time,
      vehicleName: ride.vehicle_name,
      filledSeats: Math.max(
        0,
        (ride.available_seats === null ? 0 : 0),
      ),
      totalSeats:
        (ride.available_seats ?? 0) +
        (ride.bookings ?? []).reduce(
          (sum, booking) =>
            booking.status === "accepted" ? sum + booking.requested_seats : sum,
          0,
        ),
      requests: (ride.bookings ?? []).map((booking) => ({
        id: booking.id,
        passengerName: booking.users?.[0]?.name ?? "Passenger",
        seats: booking.requested_seats,
        status: booking.status as "pending" | "accepted" | "rejected",
      })),
    })) ?? [];

  const passengerRides =
    passengerBookings?.map((booking) => {
      const ride = booking.rides?.[0];
      if (!ride) return null;
      const status = booking.status as "pending" | "accepted" | "rejected";
      const driver = ride.users?.[0];
      return {
        id: booking.id,
        source: ride.source,
        destination: ride.destination,
        rideDate: new Intl.DateTimeFormat("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }).format(new Date(`${ride.ride_date}T12:00:00`)),
        departureTime: ride.departure_time,
        driverName: driver?.name ?? "Driver",
        status,
        driverMobile: status === "accepted" ? driver?.mobile_number : undefined,
      };
    }).filter((ride): ride is NonNullable<typeof ride> => ride !== null) ?? [];

  return (
    <MyRidesScreen
      postedRides={postedRides.map((ride) => ({
        ...ride,
        filledSeats: ride.requests
          .filter((request) => request.status === "accepted")
          .reduce((sum, request) => sum + request.seats, 0),
      }))}
      passengerRides={passengerRides}
    />
  );
}

export default function MyRidesPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-dvh items-center justify-center bg-[#F7F8FC]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#C8D0CD] border-t-[#173F35]" />
        </main>
      }
    >
      <MyRidesContent />
    </Suspense>
  );
}

"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSupportedSearchRoute } from "@/lib/rides/supported-routes";

function requireUserId(user: { id: string } | null) {
  if (!user) {
    throw new Error("Please sign in first.");
  }
  return user.id;
}

export async function createRide(input: {
  source: string;
  destination: string;
  rideDate: string;
  departureTime: string;
  availableSeats: number;
  pricePerSeat: number;
  vehicleName: string;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const driverId = requireUserId(user);

  if (
    !input.rideDate ||
    !input.departureTime ||
    !input.vehicleName.trim() ||
    !Number.isInteger(input.availableSeats) ||
    input.availableSeats < 1 ||
    input.pricePerSeat < 0
  ) {
    throw new Error("Invalid ride details.");
  }

  const route = getSupportedSearchRoute(input.source, input.destination);
  if (!route) {
    throw new Error(
      "Ride routes are limited to Pune-Mumbai, Pune-Nashik, and Pune-Chhatrapati Sambhajinagar.",
    );
  }

  const { data, error } = await supabase
    .from("rides")
    .insert({
      driver_id: driverId,
      source: route.source,
      destination: route.destination,
      ride_date: input.rideDate,
      departure_time: input.departureTime,
      available_seats: input.availableSeats,
      price_per_seat: input.pricePerSeat,
      vehicle_name: input.vehicleName.trim(),
      status: "active",
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/rides");
  revalidatePath("/my-rides");
  return data.id as string;
}

export async function searchRides(input: {
  source: string;
  destination: string;
  rideDate: string;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  requireUserId(user);

  const route = getSupportedSearchRoute(input.source, input.destination);
  if (!route) {
    throw new Error(
      "Search is limited to Pune-Mumbai, Pune-Nashik, and Pune-Chhatrapati Sambhajinagar.",
    );
  }

  const { data, error } = await supabase
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
      driver:users(name)
    `)
    .eq("status", "active")
    .eq("ride_date", input.rideDate)
    .ilike("source", route.source)
    .ilike("destination", route.destination)
    .gt("available_seats", 0)
    .order("departure_time");

  if (error) throw new Error(error.message);
  return data;
}

export async function requestSeat(rideId: string, requestedSeats = 1) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const passengerId = requireUserId(user);

  if (!Number.isInteger(requestedSeats) || requestedSeats < 1) {
    throw new Error("Requested seats must be a positive integer.");
  }

  const { data: ride } = await supabase
    .from("rides")
    .select("driver_id, available_seats, status")
    .eq("id", rideId)
    .single();

  if (!ride) throw new Error("Ride not found.");
  if (ride.driver_id === passengerId) {
    throw new Error("You cannot request a seat on your own ride.");
  }
  if (ride.status !== "active" || ride.available_seats < requestedSeats) {
    throw new Error("Not enough seats are available.");
  }

  const { error } = await supabase.from("bookings").insert({
    ride_id: rideId,
    passenger_id: passengerId,
    requested_seats: requestedSeats,
    status: "pending",
  });

  if (error) throw new Error(error.message);

  revalidatePath("/my-rides");
  revalidatePath(`/rides/${rideId}`);
}

export async function acceptBooking(bookingId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("accept_booking", {
    request_id: bookingId,
  });
  if (error) throw new Error(error.message);
  if (!data) throw new Error("The booking could not be accepted.");

  revalidatePath("/my-rides");
  revalidatePath("/rides");
}

export async function rejectBooking(bookingId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("reject_booking", {
    request_id: bookingId,
  });
  if (error) throw new Error(error.message);
  if (!data) throw new Error("The booking could not be rejected.");

  revalidatePath("/my-rides");
}

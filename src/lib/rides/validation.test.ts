import { describe, expect, it } from "vitest";

function validateRide(input: {
  source: string;
  destination: string;
  rideDate: string;
  departureTime: string;
  availableSeats: number;
  pricePerSeat: number;
  vehicleName: string;
}) {
  return Boolean(
    input.source.trim() &&
      input.destination.trim() &&
      input.rideDate &&
      input.departureTime &&
      input.vehicleName.trim() &&
      Number.isInteger(input.availableSeats) &&
      input.availableSeats >= 1 &&
      Number.isFinite(input.pricePerSeat) &&
      input.pricePerSeat >= 0,
  );
}

describe("ride validation", () => {
  it("accepts a valid ride listing", () => {
    expect(
      validateRide({
        source: "Pune",
        destination: "Mumbai",
        rideDate: "2026-11-24",
        departureTime: "07:30",
        availableSeats: 3,
        pricePerSeat: 450,
        vehicleName: "Honda City",
      }),
    ).toBe(true);
  });

  it("rejects missing route or invalid seats", () => {
    expect(
      validateRide({
        source: "",
        destination: "Mumbai",
        rideDate: "2026-11-24",
        departureTime: "07:30",
        availableSeats: 0,
        pricePerSeat: 450,
        vehicleName: "Honda City",
      }),
    ).toBe(false);
  });
});

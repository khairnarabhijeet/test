import { describe, expect, it } from "vitest";
import {
  getRouteDestinations,
  getSupportedSearchRoute,
} from "./supported-routes";

describe("supported search routes", () => {
  it("allows all requested routes in both directions", () => {
    expect(getSupportedSearchRoute("Pune", "Mumbai")).not.toBeNull();
    expect(getSupportedSearchRoute("Mumbai", "Pune")).not.toBeNull();
    expect(getSupportedSearchRoute("Pune", "Nashik")).not.toBeNull();
    expect(getSupportedSearchRoute("Nashik", "Pune")).not.toBeNull();
    expect(
      getSupportedSearchRoute("Pune", "Chhatrapati Sambhajinagar"),
    ).not.toBeNull();
    expect(
      getSupportedSearchRoute("Chhatrapati Sambhajinagar", "Pune"),
    ).not.toBeNull();
  });

  it("rejects routes outside the supported pairs", () => {
    expect(getSupportedSearchRoute("Mumbai", "Nashik")).toBeNull();
    expect(getSupportedSearchRoute("Pune", "Delhi")).toBeNull();
  });

  it("offers only connected destinations for the selected source", () => {
    expect(getRouteDestinations("Pune")).toEqual([
      "Mumbai",
      "Nashik",
      "Chhatrapati Sambhajinagar",
    ]);
    expect(getRouteDestinations("Mumbai")).toEqual(["Pune"]);
    expect(getRouteDestinations("Delhi")).toEqual([]);
  });
});

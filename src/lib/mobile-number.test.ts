import { describe, expect, it } from "vitest";
import { isValidMobileNumber } from "./mobile-number";

describe("mobile number validation", () => {
  it("accepts local and international numbers with 10 to 15 digits", () => {
    expect(isValidMobileNumber("98765 43210")).toBe(true);
    expect(isValidMobileNumber("+91 98765 43210")).toBe(true);
  });

  it("rejects numbers outside the supported digit range", () => {
    expect(isValidMobileNumber("123456789")).toBe(false);
    expect(isValidMobileNumber("+1234567890123456")).toBe(false);
  });
});

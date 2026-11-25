export function isValidMobileNumber(value: string) {
  const digitCount = value.replace(/\D/g, "").length;
  return digitCount >= 10 && digitCount <= 15;
}

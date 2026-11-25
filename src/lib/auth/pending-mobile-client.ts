async function updatePendingMobileNumber(method: "POST" | "DELETE", mobileNumber?: string) {
  const response = await fetch("/api/auth/pending-mobile", {
    method,
    headers: method === "POST" ? { "Content-Type": "application/json" } : undefined,
    body: method === "POST" ? JSON.stringify({ mobileNumber }) : undefined,
  });

  if (!response.ok) {
    const result = (await response.json()) as { error?: string };
    throw new Error(result.error ?? "Unable to update the pending mobile number.");
  }
}

export function storePendingMobileNumber(mobileNumber: string) {
  return updatePendingMobileNumber("POST", mobileNumber);
}

export function clearPendingMobileNumber() {
  return updatePendingMobileNumber("DELETE");
}

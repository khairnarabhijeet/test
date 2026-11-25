import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isValidMobileNumber } from "@/lib/mobile-number";
import { PENDING_MOBILE_COOKIE } from "@/lib/auth/pending-mobile";

export async function POST(request: Request) {
  const requestOrigin = new URL(request.url).origin;
  if (request.headers.get("origin") !== requestOrigin) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  let body: { mobileNumber?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (
    typeof body.mobileNumber !== "string" ||
    !isValidMobileNumber(body.mobileNumber)
  ) {
    return NextResponse.json(
      { error: "Enter a valid mobile number with 10 to 15 digits." },
      { status: 400 },
    );
  }

  const cookieStore = await cookies();
  cookieStore.set(PENDING_MOBILE_COOKIE, body.mobileNumber.trim(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 10 * 60,
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const requestOrigin = new URL(request.url).origin;
  if (request.headers.get("origin") !== requestOrigin) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  const cookieStore = await cookies();
  cookieStore.delete(PENDING_MOBILE_COOKIE);
  return NextResponse.json({ ok: true });
}

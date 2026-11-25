"use client";

import { FormEvent, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { isValidMobileNumber } from "@/lib/mobile-number";
import {
  clearPendingMobileNumber,
  storePendingMobileNumber,
} from "@/lib/auth/pending-mobile-client";

export function LoginScreen() {
  const searchParams = useSearchParams();
  const [mobileNumber, setMobileNumber] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const callbackError =
    searchParams.get("error") === "profile_lookup"
      ? "We couldn't check your profile. Please try signing in again."
      : searchParams.has("error")
        ? "Google sign-in failed. Please try again."
        : "";

  async function signInWithGoogle(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!isValidMobileNumber(mobileNumber)) {
      setError("Enter a valid mobile number with 10 to 15 digits.");
      return;
    }

    if (!hasSupabaseConfig()) {
      setError(
        "Supabase is not configured. Add the project URL and publishable key (or legacy anon key) to .env.local, then restart the app.",
      );
      return;
    }

    setLoading(true);

    try {
      await storePendingMobileNumber(mobileNumber);
      const supabase = createSupabaseBrowserClient();
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (authError) {
        await clearPendingMobileNumber();
        setError(
          authError.message.toLowerCase().includes("provider")
            ? "Google sign-in is not enabled for this Supabase project. Enable Google under Authentication > Sign In / Providers."
            : authError.message,
        );
        setLoading(false);
      }
    } catch {
      setError("Unable to start Google sign-in. Check the Supabase setup and try again.");
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-[#F7F8FC] px-5 py-10">
      <div className="absolute left-[-6rem] top-[-7rem] h-64 w-64 rounded-full bg-[#E4F2EC]" />
      <div className="absolute bottom-[-8rem] right-[-7rem] h-72 w-72 rounded-full bg-[#FFEAD9]" />

      <section className="relative z-10 w-full max-w-md rounded-[2rem] border border-white/80 bg-white px-7 py-10 shadow-[0_24px_70px_rgba(32,45,71,0.12)] sm:px-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#173F35] shadow-[0_12px_24px_rgba(23,63,53,0.22)]">
          <svg aria-hidden="true" viewBox="0 0 48 48" className="h-9 w-9" fill="none">
            <path d="M24 9v30M18 15l6-6 6 6M16 33l8-8 8 8" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="24" cy="24" r="18" stroke="#FFFFFF" strokeWidth="2" />
          </svg>
        </div>

        <div className="mt-7 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-[#17221F]">RideShare</h1>
          <p className="mt-3 text-base leading-7 text-[#66736F]">
            Share the journey.
            <br />
            Go together.
          </p>
        </div>

        <form className="mt-8" onSubmit={signInWithGoogle}>
          <label className="block">
            <span className="mb-2 block text-left text-sm font-semibold text-[#34413D]">
              Mobile number
            </span>
            <input
              type="tel"
              value={mobileNumber}
              onChange={(event) => setMobileNumber(event.target.value)}
              placeholder="+91 98765 43210"
              inputMode="tel"
              autoComplete="tel"
              aria-invalid={Boolean(error)}
              className="h-14 w-full rounded-xl border border-[#DDE3E0] bg-white px-4 text-[#17221F] outline-none transition placeholder:text-[#A6AFAC] focus:border-[#173F35] focus:ring-4 focus:ring-[#173F35]/10"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            aria-busy={loading}
            className="mt-5 flex h-14 w-full items-center justify-center gap-3 rounded-xl border border-[#DDE3E0] bg-white px-5 text-base font-semibold text-[#26312E] shadow-[0_5px_14px_rgba(38,49,46,0.06)] transition duration-150 hover:border-[#BBC7C2] hover:bg-[#FBFCFB] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#173F35]/15 active:scale-[0.99] disabled:cursor-wait disabled:border-[#E8ECEA] disabled:bg-[#F7F9F8] disabled:text-[#8A9691]"
          >
            {loading ? (
              <span
                aria-hidden="true"
                className="h-5 w-5 animate-spin rounded-full border-2 border-[#AAB5B0] border-t-[#173F35]"
              />
            ) : (
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
                <path fill="#4285F4" d="M21.35 12.22c0-.75-.07-1.48-.2-2.18H12v4.13h5.25a4.49 4.49 0 0 1-1.95 2.95v3.04h3.16c1.85-1.7 2.89-4.21 2.89-7.94Z" />
                <path fill="#34A853" d="M12 21.75c2.63 0 4.84-.87 6.46-2.59l-3.16-3.04c-.87.59-1.99.94-3.3.94a5.74 5.74 0 0 1-5.4-3.97H3.34v3.14A9.8 9.8 0 0 0 12 21.75Z" />
                <path fill="#FBBC05" d="M6.6 13.09a5.9 5.9 0 0 1 0-3.69V6.26H3.34a9.75 9.75 0 0 0 0 8.97l3.26-2.14Z" />
                <path fill="#EA4335" d="M12 5.44c1.43 0 2.72.49 3.73 1.46l2.79-2.79A9.5 9.5 0 0 0 12 2.25a9.8 9.8 0 0 0-8.66 5.01l3.26 2.14A5.74 5.74 0 0 1 12 5.44Z" />
              </svg>
            )}
            {loading ? "Connecting..." : "Continue with Google"}
          </button>
        </form>

        {error || callbackError ? (
          <p role="alert" className="mt-4 text-center text-sm text-red-600">
            {error || callbackError}
          </p>
        ) : null}
      </section>
    </main>
  );
}

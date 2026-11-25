"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { isValidMobileNumber } from "@/lib/mobile-number";
import { clearPendingMobileNumber } from "@/lib/auth/pending-mobile-client";

type CompleteProfileScreenProps = {
  initialName: string;
  email: string;
  initialMobileNumber: string;
};

export function CompleteProfileScreen({
  initialName,
  email,
  initialMobileNumber,
}: CompleteProfileScreenProps) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [mobileNumber, setMobileNumber] = useState(initialMobileNumber);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (!isValidMobileNumber(mobileNumber)) {
      setError("Enter a valid mobile number with 10 to 15 digits.");
      return;
    }

    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Your session expired. Please sign in again.");
      setLoading(false);
      return;
    }

    const { error: saveError } = await supabase.from("users").upsert(
      {
        id: user.id,
        name: name.trim(),
        email,
        mobile_number: mobileNumber.trim(),
      },
      { onConflict: "id" },
    );

    if (saveError) {
      setError(saveError.message);
      setLoading(false);
      return;
    }

    await clearPendingMobileNumber();
    router.push("/search");
  }

  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-[#F7F8FC] px-5 py-10">
      <div className="absolute left-[-6rem] top-[-7rem] h-64 w-64 rounded-full bg-[#E4F2EC]" />
      <div className="absolute bottom-[-8rem] right-[-7rem] h-72 w-72 rounded-full bg-[#FFEAD9]" />

      <section className="relative z-10 w-full max-w-md rounded-[2rem] border border-white/80 bg-white px-7 py-9 shadow-[0_24px_70px_rgba(32,45,71,0.12)] sm:px-10 md:max-w-2xl">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#6D7C77]">
            One last step
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#17221F]">
            Complete profile
          </h1>
          <p className="mt-3 text-sm leading-6 text-[#66736F]">
            Add your mobile number so riders and drivers can connect on WhatsApp.
          </p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div className="grid gap-5 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-[#34413D]">
                Name
              </span>
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                autoComplete="name"
                className="h-14 w-full rounded-xl border border-[#DDE3E0] bg-white px-4 text-[#17221F] outline-none transition focus:border-[#173F35] focus:ring-4 focus:ring-[#173F35]/10"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-[#34413D]">
                Mobile number
              </span>
              <input
                type="tel"
                value={mobileNumber}
                onChange={(event) => setMobileNumber(event.target.value)}
                placeholder="+91 98765 43210"
                inputMode="tel"
                autoComplete="tel"
                className="h-14 w-full rounded-xl border border-[#DDE3E0] bg-white px-4 text-[#17221F] outline-none transition placeholder:text-[#A6AFAC] focus:border-[#173F35] focus:ring-4 focus:ring-[#173F35]/10"
              />
            </label>
          </div>

          {error ? (
            <p role="alert" className="text-sm font-medium text-red-600">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            aria-busy={loading}
            className="flex h-14 w-full items-center justify-center rounded-xl bg-[#173F35] px-5 text-base font-semibold text-white shadow-[0_12px_24px_rgba(23,63,53,0.20)] transition hover:bg-[#215447] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#173F35]/20 active:scale-[0.99] disabled:cursor-wait disabled:opacity-70"
          >
            {loading ? "Saving..." : "Save & Continue"}
          </button>
        </form>
      </section>
    </main>
  );
}

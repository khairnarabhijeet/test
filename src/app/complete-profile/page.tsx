import { Suspense } from "react";
import { redirect } from "next/navigation";
import { CompleteProfileScreen } from "@/components/complete-profile-screen";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { PENDING_MOBILE_COOKIE } from "@/lib/auth/pending-mobile";

async function CompleteProfileContent() {
  const supabase = await createSupabaseServerClient();
  const cookieStore = await cookies();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  return (
    <CompleteProfileScreen
      initialName={
        typeof user.user_metadata.full_name === "string"
          ? user.user_metadata.full_name
          : typeof user.user_metadata.name === "string"
            ? user.user_metadata.name
            : ""
      }
      email={user.email ?? ""}
      initialMobileNumber={
        cookieStore.get(PENDING_MOBILE_COOKIE)?.value ?? ""
      }
    />
  );
}

export default function CompleteProfilePage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-dvh items-center justify-center bg-[#F7F8FC]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#C8D0CD] border-t-[#173F35]" />
        </main>
      }
    >
      <CompleteProfileContent />
    </Suspense>
  );
}

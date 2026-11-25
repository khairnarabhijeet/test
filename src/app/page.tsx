import { Suspense } from "react";
import { LoginScreen } from "@/components/login-screen";

export default function Home() {
  return (
    <Suspense
      fallback={<main className="min-h-dvh bg-[#F7F8FC]" />}
    >
      <LoginScreen />
    </Suspense>
  );
}

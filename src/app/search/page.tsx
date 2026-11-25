import { Suspense } from "react";
import { SearchRideScreen } from "@/components/search-ride-screen";

export default function SearchPage() {
  return (
    <Suspense fallback={<main className="min-h-dvh bg-[#F7F8FC]" />}>
      <SearchRideScreen />
    </Suspense>
  );
}

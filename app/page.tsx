"use client";

import dynamic from "next/dynamic";

// Dynamically import wallet hook to prevent SSR issues
const WalletStatus = dynamic(
  () => import("@/components/WalletStatus").then((mod) => ({ default: mod.WalletStatus })),
  { 
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }
);

export default function Home() {
  return (
    <div className="min-h-screen relative z-10">
      <WalletStatus />
    </div>
  );
}

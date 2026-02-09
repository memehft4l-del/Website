"use client";

import Leaderboard from "@/components/Leaderboard";
import dynamic from "next/dynamic";

// Dynamically import Navigation to prevent SSR issues
const Navigation = dynamic(
  () => import("@/components/Navigation").then((mod) => ({ default: mod.Navigation })),
  { ssr: false }
);

export default function LeaderboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navigation />
      <div className="container mx-auto px-4 py-4 sm:py-6 md:py-8">
        <Leaderboard />
      </div>
    </div>
  );
}



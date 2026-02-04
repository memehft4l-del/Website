"use client";

import Leaderboard from "@/components/Leaderboard";
import { Navigation } from "@/components/Navigation";

export default function LeaderboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navigation activeTab="overview" onTabChange={() => {}} />
      <div className="container mx-auto px-4 py-8">
        <Leaderboard />
      </div>
    </div>
  );
}



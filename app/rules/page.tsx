"use client";

import dynamic from "next/dynamic";
import { TournamentRules } from "@/components/TournamentRules";
import { motion } from "framer-motion";

// Dynamically import Navigation to prevent SSR issues
const Navigation = dynamic(
  () => import("@/components/Navigation").then((mod) => ({ default: mod.Navigation })),
  { ssr: false }
);

export default function RulesPage() {
  return (
    <main className="min-h-screen bg-slate-900 relative z-10">
      <Navigation />
      <div className="container mx-auto px-4 py-4 sm:py-6 md:py-8 max-w-4xl">
        {/* Tournament Rules */}
        <TournamentRules />
      </div>
    </main>
  );
}


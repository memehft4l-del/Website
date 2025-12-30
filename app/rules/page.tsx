"use client";

import dynamic from "next/dynamic";
import { TournamentRules } from "@/components/TournamentRules";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function RulesPage() {
  return (
    <main className="min-h-screen bg-slate-900 relative z-10">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </motion.div>

        {/* Tournament Rules */}
        <TournamentRules />
      </div>
    </main>
  );
}


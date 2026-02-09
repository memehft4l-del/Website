"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";
import { useSound } from "@/lib/useSound";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";

// Dynamically import Navigation to prevent SSR issues
const Navigation = dynamic(
  () => import("@/components/Navigation").then((mod) => ({ default: mod.Navigation })),
  { ssr: false }
);

// Dynamically import Overview to prevent SSR issues
const Overview = dynamic(
  () => import("@/components/Overview").then((mod) => ({ default: mod.Overview })),
  { 
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Loading overview...</div>
      </div>
    )
  }
);

// Dynamically import Dashboard to prevent SSR issues
const Dashboard = dynamic(
  () => import("@/components/Dashboard").then((mod) => ({ default: mod.Dashboard })),
  { 
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Loading dashboard...</div>
      </div>
    )
  }
);

// Dynamically import TournamentOverview to prevent SSR issues
const TournamentOverview = dynamic(
  () => import("@/components/TournamentOverview").then((mod) => ({ default: mod.TournamentOverview })),
  { 
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Loading tournaments...</div>
      </div>
    )
  }
);

// Dynamically import TGETournament to prevent SSR issues
const TGETournament = dynamic(
  () => import("@/components/TGETournament").then((mod) => ({ default: mod.TGETournament })),
  { 
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Loading TGE tournament...</div>
      </div>
    )
  }
);

export function WalletStatus() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "dashboard" | "tournaments" | "tge">("overview");
  
  // Hooks must be called unconditionally
  const wallet = useWallet();
  const connected = wallet?.connected || false;
  const { playSuccess } = useSound();

  useEffect(() => {
    // Set mounted immediately
    setMounted(true);
    
    // Check for tab parameter in URL
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab") as "overview" | "dashboard" | "tournaments" | "tge" | null;
      if (tabParam && ["overview", "dashboard", "tournaments", "tge"].includes(tabParam)) {
        setActiveTab(tabParam);
      }
    }
  }, []);

  // Play success sound when wallet connects
  useEffect(() => {
    if (connected && mounted && playSuccess) {
      try {
        playSuccess();
      } catch (error) {
        // Silently fail if sound can't play
        console.warn("Could not play sound:", error);
      }
      // Auto-switch to dashboard when wallet connects
      setActiveTab("dashboard");
    }
  }, [connected, mounted]);

  // If wallet disconnects, go back to overview
  useEffect(() => {
    if (!connected && mounted) {
      setActiveTab("overview");
    }
  }, [connected, mounted]);

  if (!mounted) {
    return (
      <div className="bg-[#0a0a0f] min-h-screen flex items-center justify-center relative z-10">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen relative z-10">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        >
          {activeTab === "overview" ? (
            <Overview />
          ) : activeTab === "dashboard" ? (
            connected ? (
              <Dashboard />
            ) : (
              <div className="container mx-auto px-4 py-16 text-center">
                <p className="text-slate-400 mb-4">Please connect your wallet to access the dashboard.</p>
                <button
                  onClick={() => setActiveTab("overview")}
                  className="text-purple-400 hover:text-purple-300 underline"
                >
                  Go to Overview
                </button>
              </div>
            )
          ) : activeTab === "tournaments" ? (
            <TournamentOverview />
          ) : (
            <TGETournament />
          )}
        </motion.div>
      </AnimatePresence>
    </main>
  );
}


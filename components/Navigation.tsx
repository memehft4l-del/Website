"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { Home, LayoutDashboard, Trophy, Users, Rocket, BookOpen } from "lucide-react";
import { DynamicWalletButton } from "./DynamicWalletButton";
import { MobileMenu } from "./MobileMenu";
import Link from "next/link";
import { motion } from "framer-motion";

interface NavigationProps {
  activeTab: "overview" | "dashboard" | "tournaments" | "tge";
  onTabChange: (tab: "overview" | "dashboard" | "tournaments" | "tge") => void;
}

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const wallet = useWallet();
  const connected = wallet?.connected || false;

  return (
    <nav className="sticky top-0 z-50 glass border-b border-white/10 backdrop-blur-xl">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between h-14 md:h-16">
          {/* Logo/Brand */}
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
              className="hidden sm:block"
            >
              <Trophy className="w-5 h-5 md:w-6 md:h-6 text-game-gold drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]" />
            </motion.div>
            <span className="text-lg md:text-xl font-bold gradient-text-gold">$ELIXIR</span>
          </div>

          {/* Mobile Menu */}
          <MobileMenu activeTab={activeTab} onTabChange={onTabChange} connected={connected} />

          {/* Desktop Navigation Tabs */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => onTabChange("overview")}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
                ${
                  activeTab === "overview"
                    ? "bg-purple-600 text-white"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }
              `}
            >
              <Home className="w-4 h-4" />
              Overview
            </button>
            {connected && (
              <button
                onClick={() => onTabChange("dashboard")}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
                  ${
                    activeTab === "dashboard"
                      ? "bg-purple-600 text-white"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }
                `}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </button>
            )}
            <button
              onClick={() => onTabChange("tournaments")}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
                ${
                  activeTab === "tournaments"
                    ? "bg-purple-600 text-white"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }
              `}
            >
              <Users className="w-4 h-4" />
              Tournaments
            </button>
            <button
              onClick={() => onTabChange("tge")}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
                ${
                  activeTab === "tge"
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }
              `}
            >
              <Rocket className="w-4 h-4" />
              TGE
            </button>
            <Link
              href="/rules"
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all text-slate-400 hover:text-white hover:bg-white/5"
            >
              <BookOpen className="w-4 h-4" />
              Rules
            </Link>
          </div>

          {/* Wallet Button - Desktop */}
          <div className="hidden md:block">
            <DynamicWalletButton className="!bg-gradient-to-r !from-purple-600 !to-yellow-600 hover:!from-purple-700 hover:!to-yellow-700 !rounded-lg !px-4 !py-2 md:!px-6 md:!py-3 !font-semibold !text-sm md:!text-base !transition-all !border !border-white/10" />
          </div>
        </div>
      </div>
    </nav>
  );
}


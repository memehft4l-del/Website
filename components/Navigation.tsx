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
    <nav className="sticky top-0 z-50 glass border-b border-white/10 backdrop-blur-xl transition-all duration-300 bg-slate-900/80">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo/Brand */}
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
              className="hidden sm:block"
            >
              <Trophy className="w-5 h-5 md:w-6 md:h-6 text-game-gold drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]" />
            </motion.div>
            <span className="text-xl md:text-2xl font-bold gradient-text-gold">$ELIXIR</span>
          </div>

          {/* Mobile Menu */}
          <MobileMenu activeTab={activeTab} onTabChange={onTabChange} connected={connected} />

          {/* Desktop Navigation Tabs */}
          <div className="hidden md:flex items-center gap-3">
            <motion.button
              onClick={() => onTabChange("overview")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
                className={`
                flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all duration-200
                ${
                  activeTab === "overview"
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                    : "text-slate-400 hover:text-white hover:bg-white/10"
                }
              `}
            >
              <Home className="w-4 h-4" />
              Overview
            </motion.button>
            {connected && (
              <motion.button
                onClick={() => onTabChange("dashboard")}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`
                  flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all duration-200
                  ${
                    activeTab === "dashboard"
                      ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                      : "text-slate-400 hover:text-white hover:bg-white/10"
                  }
                `}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </motion.button>
            )}
            <motion.button
              onClick={() => onTabChange("tournaments")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`
                flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all duration-200
                ${
                  activeTab === "tournaments"
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                    : "text-slate-400 hover:text-white hover:bg-white/10"
                }
              `}
            >
              <Users className="w-4 h-4" />
              Tournaments
            </motion.button>
            <motion.button
              onClick={() => onTabChange("tge")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`
                flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all duration-200
                ${
                  activeTab === "tge"
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-pink-600/30"
                    : "text-slate-400 hover:text-white hover:bg-white/10"
                }
              `}
            >
              <Rocket className="w-4 h-4" />
              TGE
            </motion.button>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href="/rules"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 text-slate-400 hover:text-white hover:bg-white/10"
              >
                <BookOpen className="w-4 h-4" />
                Rules
              </Link>
            </motion.div>
          </div>

          {/* Wallet Button - Desktop */}
          <div className="hidden md:block">
            <DynamicWalletButton className="!bg-gradient-to-r !from-purple-600 !to-pink-600 hover:!from-purple-700 hover:!to-pink-700 !rounded-xl !px-6 !py-3 !font-semibold !text-base !transition-all !shadow-lg !shadow-purple-600/30" />
          </div>
        </div>
      </div>
    </nav>
  );
}


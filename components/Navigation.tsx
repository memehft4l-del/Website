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
    <nav className="sticky top-0 z-50 glass border-b border-purple-500/20 backdrop-blur-xl transition-all duration-300 bg-[#0a0a0f]/90">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 md:h-20">
          {/* Logo/Brand - Enhanced */}
          <motion.div 
            className="flex items-center gap-3 cursor-pointer"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <motion.div
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
              className="hidden sm:block"
            >
              <Trophy className="w-6 h-6 md:w-7 md:h-7 text-game-gold drop-shadow-[0_0_15px_rgba(255,215,0,0.8)] filter brightness-110" />
            </motion.div>
            <span className="text-2xl md:text-3xl font-bold gradient-text-gold tracking-tight drop-shadow-[0_0_20px_rgba(255,215,0,0.6)]">
              $ELIXIR
            </span>
          </motion.div>

          {/* Mobile Menu */}
          <MobileMenu activeTab={activeTab} onTabChange={onTabChange} connected={connected} />

          {/* Desktop Navigation Tabs */}
          <div className="hidden md:flex items-center gap-2">
            <motion.button
              onClick={() => onTabChange("overview")}
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98, y: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className={`
                flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all duration-200
                ${
                  activeTab === "overview"
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-600/40 border border-purple-400/30 backdrop-blur-sm"
                    : "text-slate-300 hover:text-white hover:bg-white/10 hover:backdrop-blur-sm border border-transparent hover:border-white/10"
                }
              `}
            >
              <Home className="w-4 h-4" />
              Overview
            </motion.button>
            {connected && (
              <motion.button
                onClick={() => onTabChange("dashboard")}
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98, y: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className={`
                  flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all duration-200
                  ${
                    activeTab === "dashboard"
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-600/40 border border-purple-400/30 backdrop-blur-sm"
                      : "text-slate-300 hover:text-white hover:bg-white/10 hover:backdrop-blur-sm border border-transparent hover:border-white/10"
                  }
                `}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </motion.button>
            )}
            <motion.button
              onClick={() => onTabChange("tournaments")}
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98, y: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className={`
                flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all duration-200
                ${
                  activeTab === "tournaments"
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-600/40 border border-purple-400/30 backdrop-blur-sm"
                    : "text-slate-300 hover:text-white hover:bg-white/10 hover:backdrop-blur-sm border border-transparent hover:border-white/10"
                }
              `}
            >
              <Users className="w-4 h-4" />
              Tournaments
            </motion.button>
            <motion.button
              onClick={() => onTabChange("tge")}
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98, y: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className={`
                flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all duration-200
                ${
                  activeTab === "tge"
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-pink-600/40 border border-pink-400/30 backdrop-blur-sm"
                    : "text-slate-300 hover:text-white hover:bg-white/10 hover:backdrop-blur-sm border border-transparent hover:border-white/10"
                }
              `}
            >
              <Rocket className="w-4 h-4" />
              TGE
            </motion.button>
            <motion.div
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98, y: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <Link
                href="/rules"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 text-slate-300 hover:text-white hover:bg-white/10 hover:backdrop-blur-sm border border-transparent hover:border-white/10"
              >
                <BookOpen className="w-4 h-4" />
                Rules
              </Link>
            </motion.div>
          </div>

          {/* Wallet Button - Desktop */}
          <div className="hidden md:block">
            <DynamicWalletButton className="!bg-gradient-to-r !from-purple-600 !to-pink-600 hover:!from-purple-700 hover:!to-pink-700 !rounded-xl !px-6 !py-3 !font-semibold !text-base !transition-all !shadow-lg !shadow-purple-600/40 !border !border-purple-400/30" />
          </div>
        </div>
      </div>
    </nav>
  );
}


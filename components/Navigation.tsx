"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { Home, LayoutDashboard, Trophy, Users, Rocket, BookOpen, BarChart3 } from "lucide-react";
import { DynamicWalletButton } from "./DynamicWalletButton";
import { MobileMenu } from "./MobileMenu";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter, usePathname } from "next/navigation";

interface NavigationProps {
  activeTab?: "overview" | "dashboard" | "tournaments" | "tge";
  onTabChange?: (tab: "overview" | "dashboard" | "tournaments" | "tge") => void;
}

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const wallet = useWallet();
  const connected = wallet?.connected || false;
  const router = useRouter();
  const pathname = usePathname();
  
  // Determine if we're on a standalone page
  const isStandalonePage = pathname !== "/";
  
  const handleTabChange = (tab: "overview" | "dashboard" | "tournaments" | "tge") => {
    if (isStandalonePage) {
      // If on standalone page, navigate to home with tab
      router.push(`/?tab=${tab}`);
    } else if (onTabChange) {
      // If on main page, use the provided handler
      onTabChange(tab);
    }
  };

  return (
    <nav className="sticky top-0 z-50 glass border-b border-white/10 backdrop-blur-xl transition-all duration-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 md:h-20">
          {/* Logo/Brand - Enhanced */}
          <Link href="/">
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
              <span className="text-xl sm:text-2xl md:text-3xl font-display font-bold gradient-text-gold tracking-tight drop-shadow-[0_0_20px_rgba(255,215,0,0.6)]">
                $ELIXIR
              </span>
            </motion.div>
          </Link>

          {/* Mobile Menu */}
          <MobileMenu activeTab={activeTab || "overview"} onTabChange={handleTabChange} connected={connected} />

          {/* Desktop Navigation Tabs */}
          <div className="hidden md:flex items-center gap-1.5">
            <motion.button
              onClick={() => handleTabChange("overview")}
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98, y: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className={`
                flex items-center gap-1.5 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200
                ${
                  activeTab === "overview" || (!activeTab && pathname === "/")
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-600/40 border border-purple-400/30 backdrop-blur-sm"
                    : "text-slate-300 hover:text-white hover:bg-white/5 hover:backdrop-blur-sm border border-transparent hover:border-white/5"
                }
              `}
            >
              <Home className="w-4 h-4" />
              <span className="hidden lg:inline">Overview</span>
            </motion.button>
            {connected && (
              <motion.button
                onClick={() => handleTabChange("dashboard")}
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98, y: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className={`
                  flex items-center gap-1.5 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200
                  ${
                    activeTab === "dashboard"
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-600/40 border border-purple-400/30 backdrop-blur-sm"
                      : "text-slate-300 hover:text-white hover:bg-white/5 hover:backdrop-blur-sm border border-transparent hover:border-white/5"
                  }
                `}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden lg:inline">Dashboard</span>
              </motion.button>
            )}
            <motion.button
              onClick={() => handleTabChange("tournaments")}
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98, y: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className={`
                flex items-center gap-1.5 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200
                ${
                  activeTab === "tournaments"
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-600/40 border border-purple-400/30 backdrop-blur-sm"
                    : "text-slate-300 hover:text-white hover:bg-white/5 hover:backdrop-blur-sm border border-transparent hover:border-white/5"
                }
              `}
            >
              <Users className="w-4 h-4" />
              <span className="hidden lg:inline">Tournaments</span>
            </motion.button>
            <motion.button
              onClick={() => handleTabChange("tge")}
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98, y: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className={`
                flex items-center gap-1.5 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200
                ${
                  activeTab === "tge"
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-pink-600/40 border border-pink-400/30 backdrop-blur-sm"
                    : "text-slate-300 hover:text-white hover:bg-white/5 hover:backdrop-blur-sm border border-transparent hover:border-white/5"
                }
              `}
            >
              <Rocket className="w-4 h-4" />
              <span className="hidden lg:inline">TGE</span>
            </motion.button>
            <motion.div
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98, y: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <Link
                href="/rules"
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 text-slate-300 hover:text-white hover:bg-white/5 hover:backdrop-blur-sm border border-transparent hover:border-white/5"
              >
                <BookOpen className="w-4 h-4" />
                <span className="hidden lg:inline">Rules</span>
              </Link>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98, y: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <Link
                href="/leaderboard"
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 text-slate-300 hover:text-white hover:bg-white/5 hover:backdrop-blur-sm border border-transparent hover:border-white/5"
              >
                <BarChart3 className="w-4 h-4" />
                <span className="hidden lg:inline">Leaderboard</span>
              </Link>
            </motion.div>
          </div>

          {/* Right Side: Arena Button + Wallet */}
          <div className="hidden md:flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="relative"
            >
              <Link
                href="/arena"
                className="btn-premium relative flex items-center gap-2.5 px-6 py-3 bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 text-white rounded-lg font-bold text-sm shadow-2xl shadow-green-500/60 border border-green-300/60 overflow-hidden group"
              >
                {/* Animated background glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-green-400/50 via-emerald-400/50 to-green-400/50 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300"></div>
                
                {/* Content */}
                <Trophy className="w-5 h-5 relative z-10 drop-shadow-lg group-hover:rotate-12 transition-transform duration-300 float-animation" />
                <span className="relative z-10 tracking-wide font-display">Go to Arena</span>
                
                {/* Pulsing indicator */}
                <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-yellow-400 rounded-full animate-pulse shadow-lg shadow-yellow-400/70 z-10 ring-2 ring-yellow-300/50"></span>
              </Link>
            </motion.div>
            <DynamicWalletButton className="!bg-gradient-to-r !from-purple-600 !to-pink-600 hover:!from-purple-700 hover:!to-pink-700 !rounded-lg !px-4 !py-2.5 !font-semibold !text-sm !transition-all !shadow-lg !shadow-purple-600/40 !border !border-purple-400/30" />
          </div>
        </div>
      </div>
    </nav>
  );
}


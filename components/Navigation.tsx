"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { Home, LayoutDashboard, Trophy, Users, Rocket, BookOpen, BarChart3 } from "lucide-react";
import { DynamicWalletButton } from "./DynamicWalletButton";
import { DisconnectWalletButton } from "./DisconnectWalletButton";
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
    <nav className="sticky top-0 z-40 glass border-b border-white/10 backdrop-blur-xl transition-all duration-300 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-18 gap-4">
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
              <span className="text-lg sm:text-xl md:text-2xl font-display font-bold gradient-text-gold tracking-tight drop-shadow-[0_0_20px_rgba(255,215,0,0.6)]">
                $ELIXIR
              </span>
            </motion.div>
          </Link>

          {/* Mobile Menu */}
          <MobileMenu activeTab={activeTab || "overview"} onTabChange={handleTabChange} connected={connected} />

          {/* Desktop Navigation Tabs */}
          <div className="hidden md:flex items-center gap-2 flex-1 justify-center max-w-4xl mx-4">
            <motion.button
              onClick={() => handleTabChange("overview")}
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98, y: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-xs transition-all duration-200 whitespace-nowrap
                ${
                  activeTab === "overview" || (!activeTab && pathname === "/")
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-600/40 border border-purple-400/30 backdrop-blur-sm"
                    : "text-slate-300 hover:text-white hover:bg-white/5 hover:backdrop-blur-sm border border-transparent hover:border-white/5"
                }
              `}
            >
              <Home className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="hidden xl:inline text-xs">Overview</span>
            </motion.button>
            {connected && (
              <motion.button
                onClick={() => handleTabChange("dashboard")}
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98, y: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className={`
                  flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-xs transition-all duration-200 whitespace-nowrap
                  ${
                    activeTab === "dashboard"
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-600/40 border border-purple-400/30 backdrop-blur-sm"
                      : "text-slate-300 hover:text-white hover:bg-white/5 hover:backdrop-blur-sm border border-transparent hover:border-white/5"
                  }
                `}
              >
                <LayoutDashboard className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="hidden xl:inline text-xs">Dashboard</span>
              </motion.button>
            )}
            <motion.button
              onClick={() => handleTabChange("tournaments")}
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98, y: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-xs transition-all duration-200 whitespace-nowrap
                ${
                  activeTab === "tournaments"
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-600/40 border border-purple-400/30 backdrop-blur-sm"
                    : "text-slate-300 hover:text-white hover:bg-white/5 hover:backdrop-blur-sm border border-transparent hover:border-white/5"
                }
              `}
            >
              <Users className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="hidden xl:inline text-xs">Tournaments</span>
            </motion.button>
            <motion.button
              onClick={() => handleTabChange("tge")}
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98, y: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-xs transition-all duration-200 whitespace-nowrap
                ${
                  activeTab === "tge"
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-pink-600/40 border border-pink-400/30 backdrop-blur-sm"
                    : "text-slate-300 hover:text-white hover:bg-white/5 hover:backdrop-blur-sm border border-transparent hover:border-white/5"
                }
              `}
            >
              <Rocket className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="hidden xl:inline text-xs">TGE</span>
            </motion.button>
            <motion.div
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98, y: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <Link
                href="/rules"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-xs transition-all duration-200 text-slate-300 hover:text-white hover:bg-white/5 hover:backdrop-blur-sm border border-transparent hover:border-white/5 whitespace-nowrap"
              >
                <BookOpen className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="hidden xl:inline text-xs">Rules</span>
              </Link>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98, y: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <Link
                href="/leaderboard"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-xs transition-all duration-200 text-slate-300 hover:text-white hover:bg-white/5 hover:backdrop-blur-sm border border-transparent hover:border-white/5 whitespace-nowrap"
              >
                <BarChart3 className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="hidden xl:inline text-xs">Leaderboard</span>
              </Link>
            </motion.div>
          </div>

          {/* Right Side: Arena Button + Wallet */}
          <div className="hidden md:flex items-center gap-2.5 flex-shrink-0">
            <motion.div
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="relative"
            >
              <Link
                href="/arena"
                className="btn-premium relative flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 text-white rounded-lg font-display font-semibold text-xs shadow-xl shadow-green-500/50 border border-green-300/50 overflow-hidden group whitespace-nowrap"
              >
                {/* Animated background glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-green-400/50 via-emerald-400/50 to-green-400/50 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300"></div>
                
                {/* Content */}
                <Trophy className="w-4 h-4 relative z-10 drop-shadow-lg group-hover:rotate-12 transition-transform duration-300 flex-shrink-0" />
                <span className="relative z-10 tracking-wide">Arena</span>
                
                {/* Pulsing indicator */}
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-yellow-400 rounded-full animate-pulse shadow-lg shadow-yellow-400/70 z-10 ring-1 ring-yellow-300/50"></span>
              </Link>
            </motion.div>
            {connected && <DisconnectWalletButton />}
            <DynamicWalletButton className="!bg-gradient-to-r !from-purple-600 !to-pink-600 hover:!from-purple-700 hover:!to-pink-700 !rounded-lg !px-3 !py-2 !font-semibold !text-xs !transition-all !shadow-lg !shadow-purple-600/40 !border !border-purple-400/30" />
          </div>
        </div>
      </div>
    </nav>
  );
}


"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { Home, LayoutDashboard, Trophy, Users, Rocket, BookOpen } from "lucide-react";
import { DynamicWalletButton } from "./DynamicWalletButton";
import Link from "next/link";

interface NavigationProps {
  activeTab: "overview" | "dashboard" | "tournaments" | "tge";
  onTabChange: (tab: "overview" | "dashboard" | "tournaments" | "tge") => void;
}

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const wallet = useWallet();
  const connected = wallet?.connected || false;

  return (
    <nav className="sticky top-0 z-50 glass border-b border-white/10 backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-game-gold" />
            <span className="text-xl font-bold text-white">$ELIXIR</span>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2">
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

          {/* Wallet Button */}
          <div>
            <DynamicWalletButton className="!bg-gradient-to-r !from-purple-600 !to-yellow-600 hover:!from-purple-700 hover:!to-yellow-700 !rounded-lg !px-6 !py-3 !font-semibold !transition-all !border !border-white/10" />
          </div>
        </div>
      </div>
    </nav>
  );
}


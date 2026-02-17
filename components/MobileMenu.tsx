"use client";

import { useState } from "react";
import { X, Home, LayoutDashboard, Users, Rocket, BookOpen, Trophy, BarChart3 } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface MobileMenuProps {
  activeTab: "overview" | "dashboard" | "tournaments" | "tge";
  onTabChange: (tab: "overview" | "dashboard" | "tournaments" | "tge") => void;
  connected: boolean;
}

export function MobileMenu({ activeTab, onTabChange, connected }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { id: "overview", label: "Overview", icon: Home },
    ...(connected ? [{ id: "dashboard", label: "Dashboard", icon: LayoutDashboard }] : []),
    { id: "tournaments", label: "Tournaments", icon: Users },
    { id: "tge", label: "TGE", icon: Rocket },
  ];

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden glass rounded-lg p-3 hover:bg-white/10 transition-colors touch-manipulation relative z-50"
        aria-label="Toggle menu"
        type="button"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <div className="flex flex-col gap-1.5">
            <div className="w-6 h-0.5 bg-white rounded"></div>
            <div className="w-6 h-0.5 bg-white rounded"></div>
            <div className="w-6 h-0.5 bg-white rounded"></div>
          </div>
        )}
      </button>

      {/* Mobile Menu Overlay */}
      <AnimatePresence mode="wait">
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] md:hidden"
              style={{ willChange: "opacity" }}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.2, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              className="fixed top-0 right-0 h-full w-full sm:w-96 glass border-l border-white/10 z-[70] md:hidden flex flex-col"
              style={{ willChange: "transform" }}
            >
              <div className="flex-1 overflow-y-auto">
                <div className="p-4 sm:p-6 pt-20 pb-6 flex flex-col min-h-full">
                  <div className="flex items-center justify-between mb-8 flex-shrink-0">
                    <div className="flex flex-col leading-tight">
                      <span className="text-xs sm:text-sm font-semibold text-white/80">Elixir Pump</span>
                      <span className="text-xl sm:text-2xl font-bold gradient-text-gold">$ELIXIR</span>
                    </div>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="glass rounded-lg p-2.5 sm:p-3 hover:bg-white/10 transition-colors touch-manipulation flex-shrink-0"
                      aria-label="Close menu"
                    >
                      <X className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </button>
                  </div>

                  <nav className="space-y-3 flex-1">
                    {menuItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            onTabChange(item.id as any);
                            setIsOpen(false);
                          }}
                          className={`
                            w-full flex items-center gap-3 px-4 py-4 rounded-xl font-semibold text-base transition-all touch-manipulation min-h-[56px] active:scale-[0.98]
                            ${
                              isActive
                                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-600/40 border border-purple-400/30"
                                : "text-slate-300 bg-white/5 hover:text-white hover:bg-white/10 active:bg-white/15 border border-transparent"
                            }
                          `}
                        >
                          <Icon className="w-5 h-5 flex-shrink-0" />
                          <span className="flex-1 text-left">{item.label}</span>
                        </button>
                      );
                    })}
                    <Link
                      href="/rules"
                      onClick={() => setIsOpen(false)}
                      className="w-full flex items-center gap-3 px-4 py-4 rounded-xl font-semibold text-base transition-all text-slate-300 bg-white/5 hover:text-white hover:bg-white/10 active:bg-white/15 active:scale-[0.98] touch-manipulation min-h-[56px] border border-transparent"
                    >
                      <BookOpen className="w-5 h-5 flex-shrink-0" />
                      <span className="flex-1 text-left">Rules</span>
                    </Link>
                    <Link
                      href="/leaderboard"
                      onClick={() => setIsOpen(false)}
                      className="w-full flex items-center gap-3 px-4 py-4 rounded-xl font-semibold text-base transition-all text-slate-300 bg-white/5 hover:text-white hover:bg-white/10 active:bg-white/15 active:scale-[0.98] touch-manipulation min-h-[56px] border border-transparent"
                    >
                      <BarChart3 className="w-5 h-5 flex-shrink-0" />
                      <span className="flex-1 text-left">Leaderboard</span>
                    </Link>
                    <Link
                      href="/arena"
                      onClick={() => setIsOpen(false)}
                      className="w-full flex items-center gap-3 px-4 py-4 rounded-xl font-bold text-base transition-all bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 text-white shadow-xl shadow-green-500/50 border border-green-300/50 active:scale-[0.98] touch-manipulation min-h-[56px] relative overflow-hidden group mt-2"
                    >
                      {/* Content */}
                      <Trophy className="w-5 h-5 flex-shrink-0 relative z-10" />
                      <span className="flex-1 text-left relative z-10 tracking-wide">Go to Arena</span>
                      
                      {/* Pulsing indicator */}
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse shadow-lg shadow-yellow-400/70 z-10 ring-2 ring-yellow-300/50"></span>
                    </Link>
                  </nav>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

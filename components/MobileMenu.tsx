"use client";

import { useState } from "react";
import { X, Home, LayoutDashboard, Users, Rocket, BookOpen } from "lucide-react";
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
        className="md:hidden glass rounded-lg p-3 hover:bg-white/10 transition-colors touch-manipulation"
        aria-label="Toggle menu"
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
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
              style={{ willChange: "opacity" }}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.2, ease: "easeOut" }}
              className="fixed top-0 right-0 h-screen w-screen sm:w-96 glass border-l border-white/10 z-50 md:hidden overflow-y-auto"
              style={{ willChange: "transform" }}
            >
              <div className="p-4 sm:p-6 pt-12 sm:pt-8 pb-20 min-h-screen flex flex-col">
                <div className="flex items-center justify-between mb-6 sm:mb-8 flex-shrink-0">
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

                <nav className="space-y-2.5 sm:space-y-3 pb-8 flex-1">
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
                          w-full flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3.5 sm:py-4 rounded-xl font-semibold text-sm sm:text-base transition-all touch-manipulation min-h-[56px]
                          ${
                            isActive
                              ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20"
                              : "text-slate-300 hover:text-white hover:bg-white/10 active:bg-white/5"
                          }
                        `}
                      >
                        <Icon className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                        <span className="flex-1 text-left">{item.label}</span>
                      </button>
                    );
                  })}
                  <Link
                    href="/rules"
                    onClick={() => setIsOpen(false)}
                    className="w-full flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3.5 sm:py-4 rounded-xl font-semibold text-sm sm:text-base transition-all text-slate-300 hover:text-white hover:bg-white/10 active:bg-white/5 touch-manipulation min-h-[56px]"
                  >
                    <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                    <span className="flex-1 text-left">Rules</span>
                  </Link>
                </nav>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}


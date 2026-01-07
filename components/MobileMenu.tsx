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
        className="md:hidden glass rounded-lg p-2 hover:bg-white/10 transition-colors"
        aria-label="Toggle menu"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <div className="flex flex-col gap-1.5">
            <div className="w-5 h-0.5 bg-white"></div>
            <div className="w-5 h-0.5 bg-white"></div>
            <div className="w-5 h-0.5 bg-white"></div>
          </div>
        )}
      </button>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-80 max-w-[85vw] glass border-l border-white/10 z-50 md:hidden overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-8">
                  <span className="text-xl font-bold gradient-text-gold">$ELIXIR</span>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="glass rounded-lg p-2 hover:bg-white/10"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>

                <nav className="space-y-2">
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
                          w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all
                          ${
                            isActive
                              ? "bg-purple-600 text-white"
                              : "text-slate-400 hover:text-white hover:bg-white/5"
                          }
                        `}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                  <Link
                    href="/rules"
                    onClick={() => setIsOpen(false)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all text-slate-400 hover:text-white hover:bg-white/5"
                  >
                    <BookOpen className="w-5 h-5" />
                    <span>Rules</span>
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


"use client";

import { useState, useEffect } from "react";
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

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    }
  }, [isOpen]);

  const menuItems = [
    { id: "overview", label: "Overview", icon: Home },
    ...(connected ? [{ id: "dashboard", label: "Dashboard", icon: LayoutDashboard }] : []),
    { id: "tournaments", label: "Tournaments", icon: Users },
    { id: "tge", label: "TGE", icon: Rocket },
  ];

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleItemClick = (id: string) => {
    onTabChange(id as any);
    setIsOpen(false);
  };

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={handleToggle}
        className="md:hidden relative z-[100] flex-shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center p-2.5 rounded-lg bg-slate-800/80 backdrop-blur-sm border border-white/10 hover:bg-slate-700/80 active:bg-slate-600/80 transition-colors"
        aria-label="Toggle menu"
        aria-expanded={isOpen}
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

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={handleClose}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[90] md:hidden"
            />
            
            {/* Menu Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3, ease: "easeOut" }}
              className="fixed top-0 right-0 bottom-0 w-[85vw] max-w-sm z-[100] md:hidden bg-slate-900/98 backdrop-blur-xl border-l border-white/20 shadow-2xl flex flex-col"
              style={{ height: '100vh', maxHeight: '100vh' }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-white/10 flex-shrink-0 bg-slate-900/95">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-white/80 font-body">Elixir Pump</span>
                  <span className="text-xl font-bold gradient-text-gold font-display">$ELIXIR</span>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2.5 rounded-lg hover:bg-white/10 active:bg-white/20 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                  aria-label="Close menu"
                  type="button"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Menu Items - Scrollable */}
              <div className="flex-1 overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
                <nav className="p-4 space-y-2">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleItemClick(item.id)}
                        type="button"
                        className={`
                          w-full flex items-center gap-3 px-4 py-4 rounded-xl font-semibold text-base min-h-[56px] transition-all
                          ${
                            isActive
                              ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-600/40 border border-purple-400/30"
                              : "text-slate-300 bg-white/5 hover:text-white hover:bg-white/10 active:bg-white/15 border border-transparent"
                          }
                        `}
                      >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        <span className="flex-1 text-left font-body">{item.label}</span>
                      </button>
                    );
                  })}
                  
                  <Link
                    href="/rules"
                    onClick={handleClose}
                    className="w-full flex items-center gap-3 px-4 py-4 rounded-xl font-semibold text-base transition-all text-slate-300 bg-white/5 hover:text-white hover:bg-white/10 active:bg-white/15 min-h-[56px] border border-transparent"
                  >
                    <BookOpen className="w-5 h-5 flex-shrink-0" />
                    <span className="flex-1 text-left font-body">Rules</span>
                  </Link>
                  
                  <Link
                    href="/leaderboard"
                    onClick={handleClose}
                    className="w-full flex items-center gap-3 px-4 py-4 rounded-xl font-semibold text-base transition-all text-slate-300 bg-white/5 hover:text-white hover:bg-white/10 active:bg-white/15 min-h-[56px] border border-transparent"
                  >
                    <BarChart3 className="w-5 h-5 flex-shrink-0" />
                    <span className="flex-1 text-left font-body">Leaderboard</span>
                  </Link>
                  
                  <Link
                    href="/arena"
                    onClick={handleClose}
                    className="w-full flex items-center gap-3 px-4 py-4 rounded-xl font-bold text-base transition-all bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 text-white shadow-xl shadow-green-500/50 border border-green-300/50 min-h-[56px] relative overflow-hidden group mt-2"
                  >
                    <Trophy className="w-5 h-5 flex-shrink-0 relative z-10" />
                    <span className="flex-1 text-left relative z-10 tracking-wide font-display">Go to Arena</span>
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse shadow-lg shadow-yellow-400/70 z-10 ring-2 ring-yellow-300/50"></span>
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

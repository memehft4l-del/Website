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
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [isOpen]);

  const menuItems = [
    { id: "overview", label: "Overview", icon: Home },
    ...(connected ? [{ id: "dashboard", label: "Dashboard", icon: LayoutDashboard }] : []),
    { id: "tournaments", label: "Tournaments", icon: Users },
    { id: "tge", label: "TGE", icon: Rocket },
  ];

  const handleToggle = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
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
        onTouchEnd={handleToggle}
        className="md:hidden glass rounded-lg p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-white/10 active:bg-white/20 transition-colors relative z-[100] flex-shrink-0"
        aria-label="Toggle menu"
        aria-expanded={isOpen}
        type="button"
        style={{ 
          WebkitTapHighlightColor: 'transparent',
          touchAction: 'manipulation',
          WebkitTouchCallout: 'none',
          userSelect: 'none'
        }}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white pointer-events-none" />
        ) : (
          <div className="flex flex-col gap-1.5 pointer-events-none">
            <div className="w-6 h-0.5 bg-white rounded"></div>
            <div className="w-6 h-0.5 bg-white rounded"></div>
            <div className="w-6 h-0.5 bg-white rounded"></div>
          </div>
        )}
      </button>

      {/* Mobile Menu Overlay */}
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
              onTouchStart={handleClose}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[90] md:hidden"
              style={{ 
                WebkitTapHighlightColor: 'transparent',
                touchAction: 'manipulation'
              }}
            />
            
            {/* Menu Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              onClick={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              className="fixed top-0 right-0 h-full w-full max-w-[85vw] sm:max-w-sm glass border-l border-white/10 z-[100] md:hidden flex flex-col shadow-2xl"
              style={{ 
                maxHeight: '100vh',
                WebkitTapHighlightColor: 'transparent',
                touchAction: 'pan-y'
              }}
            >
              {/* Fixed Header */}
              <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/10 bg-slate-900/95 backdrop-blur-xl flex-shrink-0 min-h-[64px]">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-white/80 font-body">Elixir Pump</span>
                  <span className="text-xl font-bold gradient-text-gold font-display">$ELIXIR</span>
                </div>
                <button
                  onClick={handleClose}
                  onTouchEnd={handleClose}
                  className="glass rounded-lg p-2.5 hover:bg-white/10 active:bg-white/20 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                  aria-label="Close menu"
                  type="button"
                  style={{ 
                    WebkitTapHighlightColor: 'transparent',
                    touchAction: 'manipulation',
                    WebkitTouchCallout: 'none'
                  }}
                >
                  <X className="w-5 h-5 text-white pointer-events-none" />
                </button>
              </div>

              {/* Scrollable Menu Content */}
              <div 
                className="flex-1 overflow-y-auto overscroll-contain"
                style={{ 
                  WebkitOverflowScrolling: 'touch',
                  overflowY: 'auto',
                  minHeight: 0
                }}
              >
                <nav className="p-4 sm:p-5 space-y-3 pb-6">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleItemClick(item.id);
                        }}
                        onTouchEnd={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleItemClick(item.id);
                        }}
                        type="button"
                        className={`
                          w-full flex items-center gap-3 px-4 py-4 rounded-xl font-semibold text-base transition-all min-h-[56px] active:scale-[0.97]
                          ${
                            isActive
                              ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-600/40 border border-purple-400/30"
                              : "text-slate-300 bg-white/5 hover:text-white hover:bg-white/10 active:bg-white/15 border border-transparent"
                          }
                        `}
                        style={{ 
                          WebkitTapHighlightColor: 'transparent',
                          touchAction: 'manipulation',
                          WebkitTouchCallout: 'none',
                          userSelect: 'none'
                        }}
                      >
                        <Icon className="w-5 h-5 flex-shrink-0 pointer-events-none" />
                        <span className="flex-1 text-left font-body">{item.label}</span>
                      </button>
                    );
                  })}
                  
                  <Link
                    href="/rules"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClose();
                    }}
                    onTouchEnd={(e) => {
                      e.stopPropagation();
                      handleClose();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-4 rounded-xl font-semibold text-base transition-all text-slate-300 bg-white/5 hover:text-white hover:bg-white/10 active:bg-white/15 active:scale-[0.97] min-h-[56px] border border-transparent"
                    style={{ 
                      WebkitTapHighlightColor: 'transparent',
                      touchAction: 'manipulation',
                      WebkitTouchCallout: 'none',
                      userSelect: 'none'
                    }}
                  >
                    <BookOpen className="w-5 h-5 flex-shrink-0 pointer-events-none" />
                    <span className="flex-1 text-left font-body">Rules</span>
                  </Link>
                  
                  <Link
                    href="/leaderboard"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClose();
                    }}
                    onTouchEnd={(e) => {
                      e.stopPropagation();
                      handleClose();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-4 rounded-xl font-semibold text-base transition-all text-slate-300 bg-white/5 hover:text-white hover:bg-white/10 active:bg-white/15 active:scale-[0.97] min-h-[56px] border border-transparent"
                    style={{ 
                      WebkitTapHighlightColor: 'transparent',
                      touchAction: 'manipulation',
                      WebkitTouchCallout: 'none',
                      userSelect: 'none'
                    }}
                  >
                    <BarChart3 className="w-5 h-5 flex-shrink-0 pointer-events-none" />
                    <span className="flex-1 text-left font-body">Leaderboard</span>
                  </Link>
                  
                  <Link
                    href="/arena"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClose();
                    }}
                    onTouchEnd={(e) => {
                      e.stopPropagation();
                      handleClose();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-4 rounded-xl font-bold text-base transition-all bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 text-white shadow-xl shadow-green-500/50 border border-green-300/50 active:scale-[0.97] min-h-[56px] relative overflow-hidden group mt-2"
                    style={{ 
                      WebkitTapHighlightColor: 'transparent',
                      touchAction: 'manipulation',
                      WebkitTouchCallout: 'none',
                      userSelect: 'none'
                    }}
                  >
                    <Trophy className="w-5 h-5 flex-shrink-0 relative z-10 pointer-events-none" />
                    <span className="flex-1 text-left relative z-10 tracking-wide font-display">Go to Arena</span>
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse shadow-lg shadow-yellow-400/70 z-10 ring-2 ring-yellow-300/50 pointer-events-none"></span>
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

"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface ElixirBarProps {
  current: number;
  max: number;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

const MAX_TOKENS = 15_000_000; // 15 million max

export function ElixirBar({ current, max = MAX_TOKENS, showLabel = true, size = "md" }: ElixirBarProps) {
  const [animatedValue, setAnimatedValue] = useState(0);
  const percentage = Math.min((current / max) * 100, 100);
  const elixirLevel = Math.min(Math.floor((current / max) * 10), 10);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedValue(percentage);
    }, 100);
    return () => clearTimeout(timer);
  }, [percentage]);

  const sizeClasses = {
    sm: "h-3 text-xs",
    md: "h-4 text-sm",
    lg: "h-6 text-base",
  };

  const heightClass = sizeClasses[size];

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-slate-300 font-semibold text-sm">
            Elixir Level: {elixirLevel}/10
          </span>
          <span className="text-slate-400 text-xs">
            {new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(current)} / {new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(max)}
          </span>
        </div>
      )}
      
      {/* Elixir Bar Container */}
      <div className={`relative ${heightClass} rounded-full overflow-hidden bg-slate-800/50 border-2 border-purple-500/30 shadow-inner`}>
        {/* Animated Background Gradient */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 opacity-80"
          style={{
            backgroundSize: "200% 100%",
          }}
          animate={{
            backgroundPosition: ["0% 0%", "100% 0%", "0% 0%"],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        
        {/* Elixir Fill */}
        <motion.div
          className={`absolute inset-y-0 left-0 ${heightClass} rounded-full`}
          style={{
            width: `${animatedValue}%`,
            background: "linear-gradient(180deg, rgba(255,0,255,0.9) 0%, rgba(139,92,246,0.9) 50%, rgba(168,85,247,0.9) 100%)",
            boxShadow: `
              inset 0 2px 4px rgba(255,255,255,0.3),
              0 0 20px rgba(255,0,255,0.5),
              0 0 40px rgba(139,92,246,0.3)
            `,
          }}
          initial={{ width: 0 }}
          animate={{ width: `${animatedValue}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          {/* Bubbles Effect */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-white/40 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  bottom: `${Math.random() * 20}%`,
                }}
                animate={{
                  y: [-10, -30, -10],
                  opacity: [0.4, 0.8, 0.4],
                  scale: [0.8, 1.2, 0.8],
                }}
                transition={{
                  duration: 2 + Math.random(),
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>
        </motion.div>

        {/* Shine Effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          style={{
            width: "30%",
            transform: "skewX(-20deg)",
          }}
          animate={{
            x: ["-100%", "400%"],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 3,
            ease: "easeInOut",
          }}
        />

        {/* Border Glow */}
        <div className="absolute inset-0 rounded-full border-2 border-purple-400/50 pointer-events-none" />
      </div>

      {/* Elixir Level Indicator */}
      {elixirLevel >= 10 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-2 text-center"
        >
          <span className="text-game-gold font-bold text-sm animate-pulse">
            ⚡ MAX ELIXIR LEVEL REACHED! ⚡
          </span>
        </motion.div>
      )}
    </div>
  );
}



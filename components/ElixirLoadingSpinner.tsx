"use client";

import { motion } from "framer-motion";

interface ElixirLoadingSpinnerProps {
  progress?: number; // 0-100
  showLabel?: boolean;
}

export function ElixirLoadingSpinner({
  progress = 0,
  showLabel = true,
}: ElixirLoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-64 h-8 bg-slate-800 rounded-full border-2 border-purple-500/50 overflow-hidden shadow-elixir-glow">
        {/* Elixir liquid fill */}
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 rounded-full"
          initial={{ width: "0%" }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          style={{
            backgroundImage:
              "linear-gradient(90deg, #9333ea 0%, #ec4899 50%, #9333ea 100%)",
            boxShadow: "inset 0 0 20px rgba(255, 0, 255, 0.5)",
          }}
        >
          {/* Bubbles effect */}
          <div className="absolute inset-0 opacity-30">
            <motion.div
              className="absolute w-2 h-2 bg-white rounded-full"
              style={{ top: "20%", left: "10%" }}
              animate={{
                y: [0, -10, 0],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="absolute w-1.5 h-1.5 bg-white rounded-full"
              style={{ top: "60%", left: "30%" }}
              animate={{
                y: [0, -8, 0],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5,
              }}
            />
            <motion.div
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{ top: "40%", left: "50%" }}
              animate={{
                y: [0, -6, 0],
                opacity: [0.3, 0.4, 0.3],
              }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }}
            />
          </div>
        </motion.div>

        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-400/20 to-transparent animate-pulse" />

        {/* Border glow */}
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-full opacity-50 blur-sm -z-10" />
      </div>

      {showLabel && (
        <div className="text-purple-300 font-bold text-sm">
          Elixir: {Math.round(progress)}/10
        </div>
      )}
    </div>
  );
}



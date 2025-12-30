"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import { useSound } from "@/lib/useSound";

interface GameButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "gold";
  className?: string;
  disabled?: boolean;
  playSound?: boolean;
}

export function GameButton({
  children,
  onClick,
  variant = "primary",
  className = "",
  disabled = false,
  playSound = true,
}: GameButtonProps) {
  const { playClick } = useSound();

  const variantStyles = {
    primary: "bg-blue-500 hover:bg-blue-600 text-white",
    secondary: "bg-purple-600 hover:bg-purple-700 text-white",
    gold: "bg-gradient-to-b from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black font-bold",
  };

  const handleClick = () => {
    if (playSound && !disabled) {
      playClick();
    }
    onClick?.();
  };

  return (
    <motion.button
      onClick={handleClick}
      disabled={disabled}
      className={`
        ${variantStyles[variant]}
        ${className}
        relative px-6 py-3 rounded-lg font-bold text-lg
        border-b-4 border-black/30
        shadow-game-button
        transition-all duration-150
        disabled:opacity-50 disabled:cursor-not-allowed
        active:shadow-game-button-pressed active:translate-y-1
      `}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95, y: 2 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <span className="relative z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
        {children}
      </span>
    </motion.button>
  );
}


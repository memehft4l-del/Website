"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { LogOut } from "lucide-react";
import { motion } from "framer-motion";

interface DisconnectWalletButtonProps {
  className?: string;
  variant?: "desktop" | "mobile";
}

export function DisconnectWalletButton({ className = "", variant = "desktop" }: DisconnectWalletButtonProps) {
  const { disconnect, connected } = useWallet();

  if (!connected) {
    return null;
  }

  const handleDisconnect = async () => {
    try {
      await disconnect();
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
    }
  };

  if (variant === "mobile") {
    return (
      <button
        onClick={handleDisconnect}
        className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl font-semibold text-base transition-all text-red-300 bg-red-500/10 hover:text-red-200 hover:bg-red-500/20 active:bg-red-500/30 min-h-[56px] border border-red-500/30 ${className}`}
        type="button"
      >
        <LogOut className="w-5 h-5 flex-shrink-0" />
        <span className="flex-1 text-left font-body">Disconnect Wallet</span>
      </button>
    );
  }

  return (
    <motion.button
      onClick={handleDisconnect}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg font-semibold text-xs transition-all text-red-300 bg-red-500/10 hover:text-red-200 hover:bg-red-500/20 border border-red-500/30 shadow-lg ${className}`}
      type="button"
      title="Disconnect Wallet"
    >
      <LogOut className="w-4 h-4" />
      <span className="hidden sm:inline">Disconnect</span>
    </motion.button>
  );
}


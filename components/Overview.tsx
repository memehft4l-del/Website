"use client";

import { Trophy, Coins, Shield, Crown } from "lucide-react";
import { motion } from "framer-motion";
import { TiltCard } from "@/components/TiltCard";
import { TIER_THRESHOLDS, PRIZE_POOL } from "@/lib/constants";
import { DynamicWalletButton } from "@/components/DynamicWalletButton";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { AboutSection } from "@/components/AboutSection";
import { useWallet } from "@solana/wallet-adapter-react";

export function Overview() {
  const { connected } = useWallet();

  return (
    <>
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 10 }}
            className="mb-8"
          >
            <div className="relative inline-block mb-6">
              <motion.div
                animate={{ 
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.05, 1]
                }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity, 
                  repeatDelay: 2 
                }}
                className="relative"
              >
                <div className="absolute inset-0 blur-xl bg-game-gold/30 rounded-full animate-pulse"></div>
                <Trophy className="w-20 h-20 mx-auto text-game-gold relative z-10 drop-shadow-[0_0_20px_rgba(255,215,0,0.5)]" />
              </motion.div>
            </div>
            <h1 className="text-6xl md:text-7xl font-bold mb-4 relative">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400 bg-clip-text text-transparent">
                $ELIXIR
              </span>
            </h1>
            <p className="text-2xl md:text-3xl text-slate-300 mb-3 font-semibold">
              Token-Gated Tournament
            </p>
            <p className="text-lg md:text-xl text-slate-400 mb-8">
              Hold $ELIXIR tokens to unlock exclusive tournament access
            </p>
          </motion.div>

          {/* Connect Wallet Section */}
          {!connected && (
            <TiltCard intensity={6}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="glass rounded-2xl p-8 mb-12"
              >
                <div className="flex flex-col items-center gap-6">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  >
                    <Shield className="w-14 h-14 text-purple-400" />
                  </motion.div>
                  <h2 className="text-3xl font-bold text-white">
                    Connect Your Wallet
                  </h2>
                  <p className="text-slate-400 max-w-md">
                    Connect your Solana wallet to check your $ELIXIR balance and
                    unlock tournament access
                  </p>
                  <motion.div
                    className="mt-4"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <DynamicWalletButton className="!bg-gradient-to-r !from-purple-600 !to-yellow-600 hover:!from-purple-700 hover:!to-yellow-700 !rounded-lg !px-8 !py-4 !font-semibold !text-lg !transition-all !border !border-white/10" />
                  </motion.div>
                </div>
              </motion.div>
            </TiltCard>
          )}

          {/* Prize Pool Display */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-gold rounded-2xl p-8 mb-12 gold-glow-box"
          >
            <div className="flex items-center justify-center gap-4 mb-4">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <Coins className="w-10 h-10 text-game-gold" />
              </motion.div>
              <h3 className="text-4xl font-bold text-white">Prize Pool</h3>
            </div>
            <motion.p
              className="text-5xl md:text-6xl font-bold text-game-gold gold-glow"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <AnimatedCounter value={PRIZE_POOL} />
            </motion.p>
            <p className="text-slate-400 mt-2 font-medium">Funded by 85% of transaction fees</p>
            <p className="text-slate-500 text-sm mt-1">Accumulated from token launch and trading activity</p>
          </motion.div>

          {/* Tier Information */}
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            {/* Minnow Tier */}
            <TiltCard intensity={4}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="glass rounded-xl p-6"
              >
                <div className="text-slate-400 text-sm font-semibold mb-2">
                  MINNOW
                </div>
                <div className="text-white text-xl font-bold mb-2">
                  &lt; 500K Tokens
                </div>
                <div className="text-slate-500 text-sm">Access Denied</div>
              </motion.div>
            </TiltCard>

            {/* Squire Tier */}
            <TiltCard intensity={4}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="glass-silver rounded-xl p-6"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-5 h-5 text-slate-400" />
                  <div className="text-slate-400 text-sm font-semibold">
                    SQUIRE
                  </div>
                </div>
                <div className="text-white text-xl font-bold mb-2">
                  500K - 2.5M Tokens
                </div>
                <div className="text-slate-400 text-sm">
                  Unlock: Squire Arena
                </div>
              </motion.div>
            </TiltCard>

            {/* Whale Tier */}
            <TiltCard intensity={4}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="glass-gold rounded-xl p-6 gold-glow-box"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="w-5 h-5 text-game-gold" />
                  <div className="text-game-gold text-sm font-semibold">
                    WHALE
                  </div>
                </div>
                <div className="text-white text-xl font-bold mb-2">
                  &gt; 2.5M Tokens
                </div>
                <div className="text-game-gold text-sm">
                  Unlock: Whale War + Squire Arena
                </div>
              </motion.div>
            </TiltCard>
          </div>
        </motion.div>
      </div>

      {/* About Section */}
      <AboutSection />
    </>
  );
}


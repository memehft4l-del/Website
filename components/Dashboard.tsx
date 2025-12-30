"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useTokenBalance } from "@/lib/useTokenBalance";
import { TOURNAMENT_CONFIG, TIER_THRESHOLDS } from "@/lib/constants";
import {
  Lock,
  Unlock,
  Crown,
  Shield,
  Calendar,
  AlertCircle,
  Info,
} from "lucide-react";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { TiltCard } from "./TiltCard";
import { ElixirLoadingSpinner } from "./ElixirLoadingSpinner";
import { useSound } from "@/lib/useSound";
import { DynamicWalletButton } from "./DynamicWalletButton";
import { TournamentCountdown } from "./TournamentCountdown";
import { TournamentSignupForm } from "./TournamentSignupForm";
import Link from "next/link";
import { BookOpen, ArrowLeft } from "lucide-react";

export function Dashboard() {
  const { publicKey } = useWallet();
  const { balance, tier, isLoading, error } = useTokenBalance(
    publicKey?.toBase58()
  );
  const { playUnlock } = useSound();

  // Play unlock sound when tier changes
  useEffect(() => {
    if (tier && tier !== "MINNOW") {
      playUnlock();
    }
  }, [tier, playUnlock]);

  const formatBalance = (bal: number) => {
    return new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 0,
    }).format(bal);
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "WHALE":
        return "text-game-gold border-game-gold";
      case "SQUIRE":
        return "text-slate-400 border-slate-400";
      default:
        return "text-slate-600 border-slate-600";
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case "WHALE":
        return <Crown className="w-7 h-7 text-game-gold" />;
      case "SQUIRE":
        return <Shield className="w-7 h-7 text-slate-400" />;
      default:
        return <Lock className="w-7 h-7 text-slate-600" />;
    }
  };

  const getNextTierThreshold = () => {
    if (tier === "MINNOW") return TIER_THRESHOLDS.SQUIRE;
    if (tier === "SQUIRE") return TIER_THRESHOLDS.WHALE;
    return null;
  };

  const getProgressPercentage = () => {
    const nextThreshold = getNextTierThreshold();
    if (!nextThreshold) return 100;
    if (tier === "MINNOW") {
      return Math.min((balance / TIER_THRESHOLDS.SQUIRE) * 100, 100);
    }
    if (tier === "SQUIRE") {
      const progress =
        ((balance - TIER_THRESHOLDS.SQUIRE) /
          (TIER_THRESHOLDS.WHALE - TIER_THRESHOLDS.SQUIRE)) *
        100;
      return Math.min(progress, 100);
    }
    return 100;
  };

  const tokensNeeded = () => {
    const nextThreshold = getNextTierThreshold();
    if (!nextThreshold) return 0;
    return Math.max(0, nextThreshold - balance);
  };

  const getElixirProgress = () => {
    const progress = getProgressPercentage();
    return (progress / 100) * 10;
  };

  return (
    <div className="min-h-screen relative z-10 bg-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            Tournament Dashboard
          </h1>
          <DynamicWalletButton className="!bg-gradient-to-r !from-purple-600 !to-yellow-600 hover:!from-purple-700 hover:!to-yellow-700 !rounded-lg !px-6 !py-3 !font-semibold !transition-all !border !border-white/10" />
        </motion.div>

        {/* Live Arena Status Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="glass-gold rounded-2xl p-6 md:p-8 mb-8 gold-glow-box"
        >
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-6 h-6 text-game-gold" />
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              Live Arena Status
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <div className="text-slate-400 text-sm mb-2 font-medium">Current $ELIXIR Balance</div>
              <div className="text-3xl font-bold text-white mb-4">
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-slate-400">Loading...</span>
                  </div>
                ) : error ? (
                  <span className="text-red-400">Error: {error}</span>
                ) : (
                  formatBalance(balance)
                )}
              </div>
            </div>
            <div>
              <div className="text-slate-400 text-sm mb-2 font-medium">Tier Qualification Status</div>
              <div
                className={`flex items-center gap-3 text-3xl font-bold mb-4 ${getTierColor(
                  tier
                )}`}
              >
                {getTierIcon(tier)}
                <span>{tier}</span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-slate-400 text-sm font-medium">
                {tier === "WHALE" 
                  ? "Maximum Tier Achieved" 
                  : `Progress to ${tier === "MINNOW" ? "Squire" : "Whale"} Tier`}
              </span>
              <span className="text-slate-400 text-sm font-medium">
                {tier === "WHALE" 
                  ? "All Arenas Unlocked" 
                  : tokensNeeded() > 0
                  ? `Buy ${formatBalance(tokensNeeded())} more tokens`
                  : "Unlocked!"}
              </span>
            </div>
            <ElixirLoadingSpinner
              progress={tier === "WHALE" ? 10 : getElixirProgress()}
              showLabel={false}
            />
          </div>

          {/* Next Tournament Countdown */}
          <div className="pt-6 border-t border-white/10">
            <TournamentCountdown />
          </div>
        </motion.div>

        {/* Tournament Rules */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-8"
        >
          <Link
            href="/rules"
            className="glass rounded-lg p-4 border border-purple-500/20 bg-purple-500/5 hover:bg-purple-500/10 transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-purple-400" />
              <div>
                <h3 className="text-lg font-semibold text-white">Tournament Rules & Format</h3>
                <p className="text-sm text-slate-400">View detailed tournament rules and format</p>
              </div>
            </div>
            <ArrowLeft className="w-5 h-5 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all rotate-180" />
          </Link>
        </motion.div>

        {/* Tournament Cards - Only show the highest tier tournament user qualifies for */}
        <div className={tier === "WHALE" ? "max-w-2xl mx-auto" : tier === "SQUIRE" ? "max-w-2xl mx-auto" : "grid md:grid-cols-2 gap-6"}>
          {/* Squire Arena Card - Only show if user is SQUIRE tier (not WHALE) */}
          {tier === "SQUIRE" && (
            <TiltCard intensity={8}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-silver rounded-2xl p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Shield className="w-6 h-6 text-slate-400" />
                    Squire Arena
                  </h3>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500 }}
                  >
                    <Unlock className="w-6 h-6 text-green-400" />
                  </motion.div>
                </div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-4"
                >
                  <div className="glass rounded-lg p-4 border border-white/5">
                    <div className="text-slate-400 text-sm mb-1 font-medium">
                      Tournament Tag
                    </div>
                    <div className="text-white font-mono text-xl font-bold">
                      {TOURNAMENT_CONFIG.squireArena.tag}
                    </div>
                  </div>
                  <div className="glass rounded-lg p-4 border border-white/5">
                    <div className="text-slate-400 text-sm mb-1 font-medium">Password</div>
                    <div className="text-white font-mono text-xl font-bold">
                      {TOURNAMENT_CONFIG.squireArena.password}
                    </div>
                  </div>
                  <div className="glass rounded-lg p-4 border border-green-500/20 bg-green-500/5">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-green-400 text-xs font-semibold mb-1">Eligible to Compete</div>
                        <div className="text-slate-300 text-xs">
                          Maintain at least {formatBalance(TIER_THRESHOLDS.SQUIRE)} tokens during the tournament to receive prizes.
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </TiltCard>
          )}

          {/* Whale War Card - Only show if user is WHALE tier */}
          {tier === "WHALE" && (
            <TiltCard intensity={8}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-gold rounded-2xl p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Crown className="w-6 h-6 text-game-gold" />
                    Whale War
                  </h3>
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 500 }}
                  >
                    <Unlock className="w-6 h-6 text-green-400" />
                  </motion.div>
                </div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-4"
                >
                  <div className="glass rounded-lg p-4 border border-white/5">
                    <div className="text-slate-400 text-sm mb-1 font-medium">
                      Tournament Tag
                    </div>
                    <div className="text-game-gold font-mono text-xl font-bold">
                      {TOURNAMENT_CONFIG.whaleWar.tag}
                    </div>
                  </div>
                  <div className="glass rounded-lg p-4 border border-white/5">
                    <div className="text-slate-400 text-sm mb-1 font-medium">Password</div>
                    <div className="text-game-gold font-mono text-xl font-bold">
                      {TOURNAMENT_CONFIG.whaleWar.password}
                    </div>
                  </div>
                  <div className="glass rounded-lg p-4 border border-green-500/20 bg-green-500/5">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-green-400 text-xs font-semibold mb-1">Eligible to Compete</div>
                        <div className="text-slate-300 text-xs">
                          Maintain at least {formatBalance(TIER_THRESHOLDS.WHALE)} tokens during the tournament to receive prizes.
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </TiltCard>
          )}

          {/* Show both cards locked if user is MINNOW tier */}
          {tier === "MINNOW" && (
            <>
              <TiltCard intensity={8}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="glass-silver rounded-2xl p-6 opacity-60"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                      <Shield className="w-6 h-6 text-slate-400" />
                      Squire Arena
                    </h3>
                    <Lock className="w-6 h-6 text-slate-600" />
                  </div>
                  <div className="text-center py-8">
                    <Lock className="w-16 h-16 mx-auto text-slate-700 mb-4" />
                    <p className="text-slate-400 mb-2 font-semibold">Access Denied</p>
                    <p className="text-slate-500 text-sm">
                      Hold at least {formatBalance(TIER_THRESHOLDS.SQUIRE)} tokens
                      to unlock
                    </p>
                  </div>
                </motion.div>
              </TiltCard>

              <TiltCard intensity={8}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="glass-gold rounded-2xl p-6 opacity-60"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                      <Crown className="w-6 h-6 text-game-gold" />
                      Whale War
                    </h3>
                    <Lock className="w-6 h-6 text-slate-600" />
                  </div>
                  <div className="text-center py-8">
                    <Lock className="w-16 h-16 mx-auto text-slate-700 mb-4" />
                    <p className="text-slate-400 mb-2 font-semibold">Access Denied</p>
                    <p className="text-slate-500 text-sm">
                      Hold at least {formatBalance(TIER_THRESHOLDS.WHALE)} tokens
                      to unlock
                    </p>
                  </div>
                </motion.div>
              </TiltCard>
            </>
          )}
        </div>

        {/* Tournament Signup Form - Only show for the highest tier user qualifies for */}
        {tier === "SQUIRE" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 max-w-2xl mx-auto"
          >
            <TournamentSignupForm tier="SQUIRE" />
          </motion.div>
        )}

        {tier === "WHALE" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 max-w-2xl mx-auto"
          >
            <TournamentSignupForm tier="WHALE" />
          </motion.div>
        )}
      </div>
    </div>
  );
}

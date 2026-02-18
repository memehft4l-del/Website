"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useTokenBalance } from "@/lib/useTokenBalance";
import { TOURNAMENT_CONFIG, TIER_THRESHOLDS, MAX_ELIXIR_TOKENS } from "@/lib/constants";
import {
  Lock,
  Unlock,
  Shield,
  AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { TiltCard } from "./TiltCard";
import { ElixirBar } from "./ElixirBar";
import { useSound } from "@/lib/useSound";
import { DynamicWalletButton } from "./DynamicWalletButton";
import { TournamentCountdown } from "./TournamentCountdown";
import { TournamentSignupForm } from "./TournamentSignupForm";
import { ScrollReveal } from "./ScrollReveal";

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
      case "TOURNAMENT":
        return "text-purple-400 border-purple-400";
      default:
        return "text-slate-600 border-slate-600";
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case "TOURNAMENT":
        return <Shield className="w-7 h-7 text-purple-400" />;
      default:
        return <Lock className="w-7 h-7 text-slate-600" />;
    }
  };

  const getNextTierThreshold = () => {
    if (tier === "MINNOW") return TIER_THRESHOLDS.TOURNAMENT;
    return null;
  };

  const getProgressPercentage = () => {
    const nextThreshold = getNextTierThreshold();
    if (!nextThreshold) return 100;
    if (tier === "MINNOW") {
      return Math.min((balance / TIER_THRESHOLDS.TOURNAMENT) * 100, 100);
    }
    return 100;
  };

  const tokensNeeded = () => {
    const nextThreshold = getNextTierThreshold();
    if (!nextThreshold) return 0;
    return Math.max(0, nextThreshold - balance);
  };

  const connected = !!publicKey;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen relative z-10 bg-slate-900"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
        {/* Header */}
        <ScrollReveal>
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-white mb-3 sm:mb-4 text-balance">
              Tournament Dashboard
            </h1>
            <p className="text-xl text-slate-400 mb-6 font-body">Track your balance, tier, and tournament access</p>
            <div className="flex justify-center">
              <DynamicWalletButton className="!bg-gradient-to-r !from-purple-600 !to-pink-600 hover:!from-purple-700 hover:!to-pink-700 !rounded-xl !px-6 !py-3 !font-semibold !text-base !transition-all !shadow-lg !shadow-purple-600/30" />
            </div>
          </div>
        </ScrollReveal>

        {/* Live Arena Status Card */}
        <ScrollReveal delay={0.2}>
          <div className="glass rounded-3xl p-8 sm:p-12 md:p-16 border border-white/10 card-modern max-w-4xl mx-auto mb-12">
            <div className="text-center">
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-white mb-3 sm:mb-4 text-balance">
                Live Tournament Status
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-slate-400 mb-6 font-body">
                Your current $ELIXIR balance and tournament access tier.
              </p>

              {/* Elixir Bar */}
              <ElixirBar current={balance} max={MAX_ELIXIR_TOKENS} showLabel={true} size="lg" />

              {/* Tier Info */}
              <div className="mt-8 flex flex-col items-center">
                <div className={`flex items-center gap-3 px-6 py-3 rounded-full border-2 ${getTierColor(tier)} bg-white/5 backdrop-blur-sm shadow-lg`}>
                  {getTierIcon(tier)}
                  <span className="text-xl font-display font-bold">{tier} Tier</span>
                </div>
                {tier !== "TOURNAMENT" && (
                  <p className="text-slate-400 text-sm mt-4 font-body">
                    Hold {formatBalance(tokensNeeded())} more $ELIXIR to reach{" "}
                    <span className="font-semibold text-white">Tournament Tier</span>
                  </p>
                )}
                {tier === "TOURNAMENT" && (
                  <p className="text-green-400 text-sm mt-4 font-body font-semibold">
                    ✓ Tournament Access Unlocked
                  </p>
                )}
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Tournament Countdown */}
        {connected && (
          <ScrollReveal delay={0.3}>
            <div className="max-w-2xl mx-auto mb-12">
              <TournamentCountdown />
            </div>
          </ScrollReveal>
        )}

        {/* Tournament Card & Signup - All in One Section */}
        {connected && (
          <ScrollReveal delay={0.4}>
            <div className="max-w-3xl mx-auto">
              <div className="glass rounded-3xl p-6 sm:p-8 border border-purple-500/20 card-modern">
                {tier === "TOURNAMENT" ? (
                  <>
                    {/* Tournament Details */}
                    <div className="mb-6 pb-6 border-b border-white/10">
                      <div className="flex items-center gap-3 mb-4">
                        <Shield className="w-7 h-7 text-purple-400" />
                        <h3 className="text-2xl font-display font-bold text-white">Tournament</h3>
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 500 }}
                        >
                          <Unlock className="w-6 h-6 text-green-400" />
                        </motion.div>
                      </div>
                      <p className="text-slate-400 mb-6 font-body">
                        Compete for prizes. Requires {formatBalance(TIER_THRESHOLDS.TOURNAMENT)}+ $ELIXIR tokens.
                      </p>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="glass rounded-lg p-4 border border-white/5">
                          <div className="text-slate-400 text-sm mb-1 font-medium font-body">Tournament Tag</div>
                          <div className="text-white font-mono text-xl font-bold font-display">
                            {TOURNAMENT_CONFIG.tournament.tag}
                          </div>
                        </div>
                        <div className="glass rounded-lg p-4 border border-white/5">
                          <div className="text-slate-400 text-sm mb-1 font-medium font-body">Password</div>
                          <div className="text-white font-mono text-xl font-bold font-display">
                            {TOURNAMENT_CONFIG.tournament.password}
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
                        <p className="text-purple-200 text-sm leading-relaxed font-body">
                          Maintain at least {formatBalance(TIER_THRESHOLDS.TOURNAMENT)} tokens during the tournament to receive prizes.
                        </p>
                      </div>
                    </div>

                    {/* Signup Form */}
                    <div>
                      <TournamentSignupForm tier="TOURNAMENT" />
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <Lock className="w-16 h-16 mx-auto text-slate-700 mb-4" />
                    <h3 className="text-2xl font-display font-bold text-white mb-2">Tournament Locked</h3>
                    <p className="text-slate-400 mb-4 font-body">
                      Hold at least {formatBalance(TIER_THRESHOLDS.TOURNAMENT)} $ELIXIR tokens to unlock tournament access.
                    </p>
                    <p className="text-slate-500 text-sm font-body">
                      You need {formatBalance(tokensNeeded())} more tokens to unlock.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </ScrollReveal>
        )}

        {/* Not Connected */}
        {!connected && (
          <ScrollReveal delay={0.4}>
            <div className="relative overflow-hidden bg-gradient-to-br from-slate-900/90 via-purple-900/20 to-slate-900/90 backdrop-blur-xl rounded-3xl p-12 text-center mb-8 max-w-2xl mx-auto border border-purple-500/20 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-transparent to-pink-600/10"></div>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"></div>
              <div className="relative z-10">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                  className="inline-block mb-6"
                >
                  <Shield className="w-20 h-20 text-purple-400 drop-shadow-[0_0_30px_rgba(139,92,246,0.8)]" />
                </motion.div>
                <h2 className="text-3xl md:text-4xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-pink-200 mb-4">
                  Connect Your Wallet
                </h2>
                <p className="text-slate-300 font-body text-lg mb-8 leading-relaxed">
                  Connect your Solana wallet to view your $ELIXIR balance and unlock tournament access.
                </p>
                <DynamicWalletButton className="!bg-gradient-to-r !from-purple-600 !to-pink-600 hover:!from-purple-700 hover:!to-pink-700 !rounded-xl !px-8 !py-4 !font-bold !text-lg !transition-all !shadow-lg !shadow-purple-600/40 !border !border-purple-400/30" />
              </div>
            </div>
          </ScrollReveal>
        )}
      </div>
    </motion.div>
  );
}

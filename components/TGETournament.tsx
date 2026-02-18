"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useTokenBalance } from "@/lib/useTokenBalance";
import { useTournamentConfig } from "@/lib/useTournamentConfig";
import { TIER_THRESHOLDS } from "@/lib/constants";
import {
  Lock,
  Unlock,
  Rocket,
  Calendar,
  AlertCircle,
  Info,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import { TiltCard } from "./TiltCard";
import { TournamentCountdown } from "./TournamentCountdown";
import { TournamentSignupForm } from "./TournamentSignupForm";
import Link from "next/link";
import { BookOpen, ArrowLeft } from "lucide-react";

const TGE_THRESHOLD = 500_000; // 500k tokens for TGE tournament

export function TGETournament() {
  const { publicKey } = useWallet();
  const { balance, tier, isLoading, error } = useTokenBalance(
    publicKey?.toBase58()
  );
  const { configs, isLoading: configLoading } = useTournamentConfig();
  
  // Fallback config if Supabase fails
  const fallbackTGE = { tournament_tag: "#TGE2024", tournament_password: "TGEPass789!" };
  const tgeConfig = configs["TGE"] || configs.TGE || fallbackTGE;

  const formatBalance = (bal: number) => {
    return new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 0,
    }).format(bal);
  };

  const isEligible = balance >= TGE_THRESHOLD;

  if (!publicKey) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="glass rounded-2xl p-8 max-w-md mx-auto">
          <Lock className="w-16 h-16 mx-auto text-slate-600 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
          <p className="text-slate-400">
            Please connect your Solana wallet to access the TGE Tournament.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading || configLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* TGE Tournament Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-8 mb-8 border border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-pink-500/10"
      >
        <div className="flex items-center gap-4 mb-6">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            <Rocket className="w-12 h-12 text-purple-400" />
          </motion.div>
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-4xl lg:text-5xl font-bold text-white mb-2">TGE Tournament</h1>
            <p className="text-slate-300">Token Generation Event - Special Launch Tournament</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="glass rounded-lg p-4 border border-white/5">
            <div className="text-slate-400 text-sm mb-1 font-medium">Required Tokens</div>
            <div className="text-3xl font-bold text-white">{formatBalance(TGE_THRESHOLD)}</div>
            <div className="text-xs text-slate-500 mt-1">Lower threshold for TGE participants</div>
          </div>
          <div className="glass rounded-lg p-4 border border-white/5">
            <div className="text-slate-400 text-sm mb-1 font-medium">Your Balance</div>
            <div className={`text-3xl font-bold ${isEligible ? "text-green-400" : "text-red-400"}`}>
              {isLoading ? "..." : formatBalance(balance)}
            </div>
            <div className={`text-xs mt-1 ${isEligible ? "text-green-400" : "text-red-400"}`}>
              {isEligible ? "✓ Eligible" : "✗ Not Eligible"}
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-white/10">
          <TournamentCountdown />
        </div>
      </motion.div>

      {/* Eligibility Info */}
      {!isEligible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-6 mb-8 border border-yellow-500/20 bg-yellow-500/5"
        >
          <div className="flex items-start gap-3">
            <Info className="w-6 h-6 text-yellow-400 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-bold text-white mb-2">TGE Tournament Eligibility</h3>
              <p className="text-slate-300 text-sm leading-relaxed mb-2">
                You need at least {formatBalance(TGE_THRESHOLD)} $ELIXIR tokens to participate in the TGE Tournament. 
                This is a special launch event with a lower threshold than regular tournaments.
              </p>
              <p className="text-slate-400 text-xs">
                Current balance: {formatBalance(balance)} tokens
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tournament Rules Link */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
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

      {/* TGE Tournament Card */}
      <TiltCard intensity={8}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`
            glass rounded-2xl p-6 border-2
            ${
              isEligible
                ? "border-purple-500/40 bg-gradient-to-br from-purple-500/10 to-pink-500/10"
                : "border-slate-600/40 opacity-60"
            }
            transition-all duration-300
          `}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-bold text-white flex items-center gap-2">
              <Rocket className="w-6 h-6 text-purple-400" />
              TGE Tournament
            </h3>
            {isEligible ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500 }}
              >
                <Unlock className="w-6 h-6 text-green-400" />
              </motion.div>
            ) : (
              <Lock className="w-6 h-6 text-slate-600" />
            )}
          </div>

          {isEligible && tgeConfig ? (
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
                  {tgeConfig.tournament_tag}
                </div>
              </div>
              <div className="glass rounded-lg p-4 border border-white/5">
                <div className="text-slate-400 text-sm mb-1 font-medium">Password</div>
                <div className="text-white font-mono text-xl font-bold">
                  {tgeConfig.tournament_password}
                </div>
              </div>
              <div className="glass rounded-lg p-4 border border-green-500/20 bg-green-500/5">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-green-400 text-xs font-semibold mb-1">Eligible to Compete</div>
                    <div className="text-slate-300 text-xs">
                      Maintain at least {formatBalance(TGE_THRESHOLD)} tokens during the tournament to receive prizes.
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="text-center py-8">
              <Lock className="w-16 h-16 mx-auto text-slate-700 mb-4" />
              <p className="text-slate-400 mb-2 font-semibold">Access Denied</p>
              <p className="text-slate-500 text-sm">
                Hold at least {formatBalance(TGE_THRESHOLD)} tokens to unlock
              </p>
            </div>
          )}
        </motion.div>
      </TiltCard>

      {/* Tournament Signup Form - Only for eligible users */}
      {isEligible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12 max-w-2xl mx-auto"
        >
          <div className="text-center mb-6">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2">
              Ready to Compete?
            </h2>
            <p className="text-slate-400">
              Sign up early! Your Clash Royale tag will be visible in the Tournaments Monitor.
            </p>
          </div>
          <TournamentSignupForm tier="TOURNAMENT" />
        </motion.div>
      )}
    </div>
  );
}


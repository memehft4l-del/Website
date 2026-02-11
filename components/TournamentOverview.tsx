"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { motion } from "framer-motion";
import { Trophy, Calendar, Users, Award, Clock, Info, ArrowRight } from "lucide-react";
import { TournamentRules } from "./TournamentRules";
import { TournamentCountdown } from "./TournamentCountdown";
import { TournamentSignupForm } from "./TournamentSignupForm";
import { useTokenBalance } from "@/lib/useTokenBalance";
import { TIER_THRESHOLDS } from "@/lib/constants";
import Link from "next/link";

export function TournamentOverview() {
  const { publicKey, connected } = useWallet();
  const { balance, tier, isLoading } = useTokenBalance(publicKey?.toBase58());

  const formatBalance = (bal: number) => {
    return new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 0,
    }).format(bal);
  };

  const getTierForSignup = () => {
    if (!tier) return null;
    if (tier === "WHALE") return "WHALE";
    if (tier === "DAILY") return "DAILY";
    return null;
  };

  const eligibleTier = getTierForSignup();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-block mb-4">
            <Trophy className="w-16 h-16 text-game-gold drop-shadow-[0_0_30px_rgba(255,215,0,0.8)]" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-pink-200 mb-4">
            Clash Royale Tournaments
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Compete in daily tournaments, climb the leaderboard, and win SOL prizes!
          </p>
        </motion.div>

        {/* Tournament Countdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <TournamentCountdown />
        </motion.div>

        {/* Quick Info Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative overflow-hidden bg-gradient-to-br from-slate-900/90 via-purple-900/20 to-slate-900/90 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20 shadow-xl"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-purple-600/20 rounded-lg border border-purple-500/30">
                <Calendar className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-lg font-bold text-white">Schedule</h3>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              Daily tournaments every day at 3PM UTC (1-hour prep) + 4-hour tournament (4PM-8PM UTC)
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="relative overflow-hidden bg-gradient-to-br from-slate-900/90 via-purple-900/20 to-slate-900/90 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20 shadow-xl"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-yellow-600/20 rounded-lg border border-yellow-500/30">
                <Award className="w-5 h-5 text-yellow-400" />
              </div>
              <h3 className="text-lg font-bold text-white">Prizes</h3>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              <span className="font-semibold text-white">1st: 75%</span> • <span className="font-semibold text-white">2nd: 20%</span> • <span className="font-semibold text-white">3rd: 5%</span> of prize pool
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="relative overflow-hidden bg-gradient-to-br from-slate-900/90 via-purple-900/20 to-slate-900/90 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20 shadow-xl"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-red-600/20 rounded-lg border border-red-500/30">
                <Users className="w-5 h-5 text-red-400" />
              </div>
              <h3 className="text-lg font-bold text-white">Format</h3>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              <span className="font-semibold text-white">3 losses</span> eliminate you. Game modes announced before each tournament.
            </p>
          </motion.div>
        </div>

        {/* Tournament Rules */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-12"
        >
          <TournamentRules />
        </motion.div>

        {/* Signup Section */}
        {connected && eligibleTier && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="relative overflow-hidden bg-gradient-to-br from-slate-900/90 via-purple-900/20 to-slate-900/90 backdrop-blur-xl rounded-3xl p-8 border border-purple-500/20 shadow-2xl mb-8"
          >
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl -mr-48 -mt-48"></div>
            <div className="relative z-10">
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-white mb-2">
                  Ready to Compete?
                </h2>
                <p className="text-slate-400">
                  Sign up for the tournament! Your Clash Royale tag will be visible in the Tournament Dashboard.
                </p>
              </div>
              <TournamentSignupForm tier={eligibleTier} />
            </div>
          </motion.div>
        )}

        {/* Not Connected or Not Eligible */}
        {(!connected || !eligibleTier) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="relative overflow-hidden bg-gradient-to-br from-slate-900/90 via-purple-900/20 to-slate-900/90 backdrop-blur-xl rounded-3xl p-8 border border-purple-500/20 shadow-2xl mb-8"
          >
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl -mr-48 -mt-48"></div>
            <div className="relative z-10 text-center">
              {!connected ? (
                <>
                  <Info className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Connect Your Wallet
                  </h3>
                  <p className="text-slate-300 mb-6">
                    Connect your wallet to see if you're eligible to participate in tournaments.
                  </p>
                </>
              ) : (
                <>
                  <Info className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Token Requirement
                  </h3>
                  <p className="text-slate-300 mb-4">
                    You need to hold at least <span className="font-semibold text-yellow-400">{formatBalance(TIER_THRESHOLDS.DAILY)} tokens</span> to participate in tournaments.
                  </p>
                  <p className="text-slate-400 text-sm">
                    Current balance: {isLoading ? "Loading..." : formatBalance(balance || 0)} tokens
                  </p>
                </>
              )}
            </div>
          </motion.div>
        )}

        {/* Link to Tournament Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="text-center"
        >
          <Link
            href="/arena"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-green-600/30 border border-green-400/30"
          >
            <Trophy className="w-5 h-5" />
            View Tournament Dashboard
            <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-slate-400 text-sm mt-4">
            See all tournament signups and participants in the Arena
          </p>
        </motion.div>
      </div>
    </div>
  );
}


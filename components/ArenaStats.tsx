"use client";

import { useState, useEffect } from "react";
import { Copy, Check, Users, Gift, Share2, Trophy, Swords, TrendingUp, Award } from "lucide-react";
import { motion } from "framer-motion";
import { useWallet } from "@solana/wallet-adapter-react";
import { getOrCreateReferralCode, registerReferral, getUserStats } from "@/lib/points";

interface ArenaStatsProps {
  userStats: {
    points: number;
    gamesWon: number;
    gamesLost: number;
    tournamentPoints: number;
    tournamentWins: number;
    tournamentLosses: number;
    referralCode: string | null;
    referredBy: string | null;
    referralPoints: number;
    totalReferrals: number;
    winStreak: number;
    bestWinStreak: number;
  } | null;
  onStatsUpdate?: () => void;
}

export function ArenaStats({ userStats, onStatsUpdate }: ArenaStatsProps) {
  const { publicKey, connected } = useWallet();
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [referralInput, setReferralInput] = useState("");
  const [showReferralInput, setShowReferralInput] = useState(false);

  useEffect(() => {
    if (connected && publicKey && userStats?.referralCode) {
      setReferralCode(userStats.referralCode);
    } else if (connected && publicKey && !referralCode) {
      loadReferralCode();
    }
  }, [connected, publicKey, userStats]);

  // Check for referral code in URL
  useEffect(() => {
    if (typeof window !== "undefined" && connected && publicKey && !referralInput && !userStats?.referredBy) {
      const urlParams = new URLSearchParams(window.location.search);
      const refCode = urlParams.get("ref");
      if (refCode) {
        setReferralInput(refCode);
        setShowReferralInput(true);
      }
    }
  }, [connected, publicKey, referralInput, userStats]);

  const loadReferralCode = async () => {
    if (!publicKey) return;
    try {
      const code = await getOrCreateReferralCode(publicKey.toBase58());
      setReferralCode(code);
    } catch (error) {
      console.error("Error loading referral code:", error);
    }
  };

  const copyReferralLink = async () => {
    if (!referralCode || typeof window === "undefined") return;
    const referralLink = `${window.location.origin}?ref=${referralCode}`;
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const copyReferralCode = async () => {
    if (!referralCode) return;
    try {
      await navigator.clipboard.writeText(referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const handleRegisterReferral = async () => {
    if (!publicKey || !referralInput.trim()) return;
    setLoading(true);
    try {
      const result = await registerReferral(publicKey.toBase58(), referralInput.trim().toUpperCase());
      if (result.success) {
        alert("Referral code registered! You've earned 50 bonus points!");
        setReferralInput("");
        setShowReferralInput(false);
        if (onStatsUpdate) onStatsUpdate();
      } else {
        alert(result.error || "Failed to register referral code");
      }
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!connected || !userStats) {
    return null;
  }

  const winRate = userStats.gamesWon + userStats.gamesLost > 0
    ? Math.round((userStats.gamesWon / (userStats.gamesWon + userStats.gamesLost)) * 100)
    : 0;

  const referralLink = referralCode && typeof window !== "undefined" ? `${window.location.origin}?ref=${referralCode}` : "";

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {/* Total Points */}
        <div className="relative overflow-hidden bg-gradient-to-br from-purple-600/20 via-purple-500/10 to-transparent border border-purple-500/30 rounded-2xl p-5 backdrop-blur-sm hover:border-purple-500/50 transition-all">
          <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full -mr-10 -mt-10 blur-xl"></div>
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-4 h-4 text-purple-400" />
              <div className="text-purple-300 text-xs font-medium uppercase tracking-wide">Total Points</div>
            </div>
            <div className="text-white font-bold text-3xl mb-1">{userStats.points.toLocaleString()}</div>
            <div className="text-purple-400/60 text-xs">
              {userStats.points - userStats.tournamentPoints} from 1v1s • {userStats.tournamentPoints} from tournaments
            </div>
          </div>
        </div>

        {/* 1v1 Record */}
        <div className="relative overflow-hidden bg-gradient-to-br from-green-600/20 via-green-500/10 to-transparent border border-green-500/30 rounded-2xl p-5 backdrop-blur-sm hover:border-green-500/50 transition-all">
          <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full -mr-10 -mt-10 blur-xl"></div>
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <Swords className="w-4 h-4 text-green-400" />
              <div className="text-green-300 text-xs font-medium uppercase tracking-wide">1v1 Record</div>
            </div>
            <div className="text-white font-bold text-3xl mb-1">{userStats.gamesWon}W - {userStats.gamesLost}L</div>
            <div className="text-green-400/60 text-xs">
              {winRate}% win rate
            </div>
          </div>
        </div>

        {/* Win Streak */}
        {userStats.winStreak > 0 && (
          <div className="relative overflow-hidden bg-gradient-to-br from-yellow-600/20 via-yellow-500/10 to-transparent border border-yellow-500/30 rounded-2xl p-5 backdrop-blur-sm hover:border-yellow-500/50 transition-all">
            <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-500/10 rounded-full -mr-10 -mt-10 blur-xl"></div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <div className="text-yellow-400 text-lg">🔥</div>
                <div className="text-yellow-300 text-xs font-medium uppercase tracking-wide">Win Streak</div>
              </div>
              <div className="text-white font-bold text-3xl mb-1">{userStats.winStreak}</div>
              <div className="text-yellow-400/60 text-xs">
                Best: {userStats.bestWinStreak}
              </div>
            </div>
          </div>
        )}

        {/* Referrals */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-600/20 via-blue-500/10 to-transparent border border-blue-500/30 rounded-2xl p-5 backdrop-blur-sm hover:border-blue-500/50 transition-all">
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -mr-10 -mt-10 blur-xl"></div>
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-blue-400" />
              <div className="text-blue-300 text-xs font-medium uppercase tracking-wide">Referrals</div>
            </div>
            <div className="text-white font-bold text-3xl mb-1">{userStats.totalReferrals}</div>
            <div className="text-blue-400/60 text-xs">
              {userStats.referralPoints.toLocaleString()} points earned
            </div>
          </div>
        </div>
      </motion.div>

      {/* Referral Code Section */}
      {referralCode && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-gradient-to-br from-slate-900/90 via-purple-900/20 to-slate-900/90 backdrop-blur-xl rounded-3xl p-6 border border-purple-500/20 shadow-2xl"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-600/20 rounded-xl border border-purple-500/30">
                  <Share2 className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Your Referral Code</h3>
                  <p className="text-slate-400 text-xs">Earn 10% of your referrals' points</p>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              {/* Referral Code */}
              <div className="space-y-2">
                <label className="text-xs text-slate-400 font-medium">Referral Code</label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl font-mono text-white text-base font-bold">
                    {referralCode}
                  </div>
                  <motion.button
                    onClick={copyReferralCode}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-semibold transition-all flex items-center gap-2 shadow-lg shadow-purple-600/30 border border-purple-400/30"
                    title="Copy code"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </motion.button>
                </div>
              </div>

              {/* Referral Link */}
              <div className="space-y-2">
                <label className="text-xs text-slate-400 font-medium">Referral Link</label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl font-mono text-white text-xs truncate">
                    {referralLink}
                  </div>
                  <motion.button
                    onClick={copyReferralLink}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-semibold transition-all flex items-center gap-2 shadow-lg shadow-green-600/30 border border-green-400/30"
                    title="Copy link"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </motion.button>
                </div>
              </div>
            </div>

            <div className="p-3 bg-blue-600/10 border border-blue-500/20 rounded-xl">
              <p className="text-blue-300 text-xs font-semibold mb-1">How it works:</p>
              <ul className="text-blue-200/80 text-xs space-y-1">
                <li>• Share your code or link with friends</li>
                <li>• When they sign up and play, you earn 10% of their points</li>
                <li>• They get 50 bonus points for using your code</li>
                <li>• Points accumulate automatically as they play</li>
              </ul>
            </div>
          </div>
        </motion.div>
      )}

      {/* Register Referral Code */}
      {!userStats.referredBy && (showReferralInput || referralInput) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-gradient-to-br from-slate-900/90 via-green-900/20 to-slate-900/90 backdrop-blur-xl rounded-3xl p-6 border border-green-500/20 shadow-2xl"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-green-600/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-600/20 rounded-xl border border-green-500/30">
                <Gift className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Enter Referral Code</h3>
                <p className="text-slate-400 text-xs">Get 50 bonus points when you sign up with a code</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="text"
                value={referralInput}
                onChange={(e) => setReferralInput(e.target.value.toUpperCase())}
                placeholder="Enter referral code"
                className="flex-1 px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all backdrop-blur-sm font-mono"
              />
              <motion.button
                onClick={handleRegisterReferral}
                disabled={loading || !referralInput.trim()}
                whileHover={{ scale: loading || !referralInput.trim() ? 1 : 1.05 }}
                whileTap={{ scale: loading || !referralInput.trim() ? 1 : 0.95 }}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-green-600/30 border border-green-400/30"
              >
                {loading ? "Registering..." : "Register"}
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Points Rewards Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-br from-slate-900/90 via-purple-900/20 to-slate-900/90 backdrop-blur-xl rounded-3xl p-8 border border-purple-500/20 shadow-2xl"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl -mr-48 -mt-48"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-600/20 rounded-xl border border-purple-500/30">
              <Award className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">Points Rewards</h3>
              <p className="text-slate-400 text-sm">Your points unlock exclusive rewards</p>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-purple-600/10 border border-purple-500/20 rounded-xl">
              <div className="text-purple-300 font-semibold mb-2 text-sm">💰 Fee Distribution</div>
              <p className="text-slate-300 text-xs leading-relaxed">
                Points holders receive a share of platform fees generated from wagers and tournaments
              </p>
            </div>
            <div className="p-4 bg-purple-600/10 border border-purple-500/20 rounded-xl">
              <div className="text-purple-300 font-semibold mb-2 text-sm">🔄 Token Buybacks</div>
              <p className="text-slate-300 text-xs leading-relaxed">
                A portion of fees are used to buy back tokens, distributed proportionally to points holders
              </p>
            </div>
            <div className="p-4 bg-purple-600/10 border border-purple-500/20 rounded-xl">
              <div className="text-purple-300 font-semibold mb-2 text-sm">🎁 Secret Rewards</div>
              <p className="text-slate-300 text-xs leading-relaxed">
                Additional exclusive rewards and benefits for top points holders (details coming soon)
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}


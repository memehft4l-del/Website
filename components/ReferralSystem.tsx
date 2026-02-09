"use client";

import { useState, useEffect } from "react";
import { Copy, Check, Users, Gift, Share2 } from "lucide-react";
import { motion } from "framer-motion";
import { useWallet } from "@solana/wallet-adapter-react";
import { getOrCreateReferralCode, registerReferral, getUserStats } from "@/lib/points";
import { supabase } from "@/lib/supabase";

export function ReferralSystem() {
  const { publicKey, connected } = useWallet();
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [referralInput, setReferralInput] = useState("");
  const [referralStats, setReferralStats] = useState<{
    totalReferrals: number;
    referralPoints: number;
  } | null>(null);

  useEffect(() => {
    if (connected && publicKey) {
      loadReferralCode();
      loadReferralStats();
    }
  }, [connected, publicKey]);

  const loadReferralCode = async () => {
    if (!publicKey) return;
    try {
      const code = await getOrCreateReferralCode(publicKey.toBase58());
      setReferralCode(code);
    } catch (error) {
      console.error("Error loading referral code:", error);
    }
  };

  const loadReferralStats = async () => {
    if (!publicKey) return;
    try {
      const stats = await getUserStats(publicKey.toBase58());
      if (stats) {
        setReferralStats({
          totalReferrals: stats.totalReferrals,
          referralPoints: stats.referralPoints,
        });
      }
    } catch (error) {
      console.error("Error loading referral stats:", error);
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

  const handleRegisterReferral = async () => {
    if (!publicKey || !referralInput.trim()) return;
    setLoading(true);
    try {
      const result = await registerReferral(publicKey.toBase58(), referralInput.trim().toUpperCase());
      if (result.success) {
        alert("Referral code registered! You've earned 50 bonus points!");
        setReferralInput("");
        loadReferralStats();
      } else {
        alert(result.error || "Failed to register referral code");
      }
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Check for referral code in URL on mount
  useEffect(() => {
    if (typeof window !== "undefined" && connected && publicKey && !referralInput) {
      const urlParams = new URLSearchParams(window.location.search);
      const refCode = urlParams.get("ref");
      if (refCode) {
        setReferralInput(refCode);
      }
    }
  }, [connected, publicKey, referralInput]);

  if (!connected) {
    return null;
  }

  const referralLink = referralCode && typeof window !== "undefined" ? `${window.location.origin}?ref=${referralCode}` : "";

  return (
    <div className="space-y-6">
      {/* Referral Stats */}
      {referralStats && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 gap-4"
        >
          <div className="relative overflow-hidden bg-gradient-to-br from-purple-600/20 via-purple-500/10 to-transparent border border-purple-500/30 rounded-2xl p-5 backdrop-blur-sm">
            <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full -mr-10 -mt-10 blur-xl"></div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-purple-400" />
                <div className="text-purple-300 text-xs font-medium uppercase tracking-wide">Referrals</div>
              </div>
              <div className="text-white font-bold text-2xl">{referralStats.totalReferrals}</div>
            </div>
          </div>

          <div className="relative overflow-hidden bg-gradient-to-br from-green-600/20 via-green-500/10 to-transparent border border-green-500/30 rounded-2xl p-5 backdrop-blur-sm">
            <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full -mr-10 -mt-10 blur-xl"></div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <Gift className="w-4 h-4 text-green-400" />
                <div className="text-green-300 text-xs font-medium uppercase tracking-wide">Referral Points</div>
              </div>
              <div className="text-white font-bold text-2xl">{referralStats.referralPoints.toLocaleString()}</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Your Referral Code */}
      {referralCode && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-gradient-to-br from-slate-900/90 via-slate-800/50 to-slate-900/90 backdrop-blur-xl rounded-3xl p-6 border border-white/10 shadow-2xl"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-600/20 rounded-xl border border-purple-500/30">
                <Share2 className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Your Referral Code</h3>
                <p className="text-slate-400 text-sm">Earn 10% of your referrals' points</p>
              </div>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl font-mono text-white text-lg font-bold">
                {referralCode}
              </div>
              <motion.button
                onClick={copyReferralLink}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-semibold transition-all flex items-center gap-2 shadow-lg shadow-purple-600/30 border border-purple-400/30"
              >
                {copied ? (
                  <>
                    <Check className="w-5 h-5" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    Copy Link
                  </>
                )}
              </motion.button>
            </div>

            <div className="p-4 bg-blue-600/10 border border-blue-500/20 rounded-xl">
              <p className="text-blue-300 text-sm font-semibold mb-1">How it works:</p>
              <ul className="text-blue-200/80 text-xs space-y-1">
                <li>• Share your referral link with friends</li>
                <li>• When they sign up and play, you earn 10% of their points</li>
                <li>• They also get 50 bonus points for using your code</li>
                <li>• Points accumulate automatically as they play</li>
              </ul>
            </div>
          </div>
        </motion.div>
      )}

      {/* Register Referral Code */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-br from-slate-900/90 via-slate-800/50 to-slate-900/90 backdrop-blur-xl rounded-3xl p-6 border border-white/10 shadow-2xl"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-600/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-600/20 rounded-xl border border-green-500/30">
              <Gift className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Enter Referral Code</h3>
              <p className="text-slate-400 text-sm">Get 50 bonus points when you sign up with a code</p>
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
    </div>
  );
}


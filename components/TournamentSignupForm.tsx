"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Loader2, Trophy, Info, Smartphone, User, Copy } from "lucide-react";
import { supabase, TournamentSignup } from "@/lib/supabase";
import { useWallet } from "@solana/wallet-adapter-react";
import { getPlayerStats, PlayerStats } from "@/lib/clashRoyale/getPlayerStats";
import { TOURNAMENT_CONFIG, TIER_THRESHOLDS } from "@/lib/constants";

interface TournamentSignupFormProps {
  tier: "TOURNAMENT";
  onSignupSuccess?: () => void;
}

export function TournamentSignupForm({ tier, onSignupSuccess }: TournamentSignupFormProps) {
  const { publicKey } = useWallet();
  const [username, setUsername] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [showTournamentDetails, setShowTournamentDetails] = useState(false);

  // Fetch player stats when tag is entered
  useEffect(() => {
    const fetchStats = async () => {
      const trimmedTag = username.trim();
      if (!trimmedTag || trimmedTag.length < 3) {
        setPlayerStats(null);
        setStatsError(null);
        setShowTournamentDetails(false);
        return;
      }

      // Debounce: wait 800ms after user stops typing
      const timeoutId = setTimeout(async () => {
        setLoadingStats(true);
        setStatsError(null);
        try {
          const stats = await getPlayerStats(trimmedTag);
          setPlayerStats(stats);
          setShowTournamentDetails(true); // Show tournament details only after valid tag is verified
        } catch (error: any) {
          setPlayerStats(null);
          setStatsError(error.message);
          setShowTournamentDetails(false);
        } finally {
          setLoadingStats(false);
        }
      }, 800);

      return () => clearTimeout(timeoutId);
    };

    fetchStats();
  }, [username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!publicKey) {
      setStatus("error");
      setErrorMessage("Wallet not connected");
      return;
    }

    if (!username.trim()) {
      setStatus("error");
      setErrorMessage("Please enter your Clash Royale player tag");
      return;
    }

    if (!playerStats) {
      setStatus("error");
      setErrorMessage("Please verify your player tag first");
      return;
    }

    setIsSubmitting(true);
    setStatus("idle");
    setErrorMessage("");

    try {
      const signupData: Omit<TournamentSignup, "id" | "created_at"> = {
        wallet_address: publicKey.toBase58(),
        clash_royale_username: username.trim(),
        tier: tier,
      };

      const { data, error } = await supabase
        .from("tournament_signups")
        .insert([signupData])
        .select()
        .single();

      if (error) {
        // Check if it's a duplicate entry error
        if (error.code === "23505" || error.message.includes("duplicate")) {
          setStatus("error");
          setErrorMessage("You have already signed up for this tournament");
        } else {
          throw error;
        }
      } else {
        setStatus("success");
        setUsername("");
        setPlayerStats(null);
        setShowTournamentDetails(false);
        onSignupSuccess?.();
        
        // Reset success message after 3 seconds
        setTimeout(() => {
          setStatus("idle");
        }, 3000);
      }
    } catch (error: any) {
      console.error("Error signing up for tournament:", error);
      setStatus("error");
      setErrorMessage(error.message || "Failed to sign up. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatBalance = (bal: number) => {
    return new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 0,
    }).format(bal);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-xl p-6 border border-purple-500/20"
    >
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-white mb-2">
          Tournament Signup
        </h3>
        <p className="text-slate-400 text-sm">
          Enter your Clash Royale player tag first to see tournament details and sign up.
        </p>
      </div>

      {/* Step 1: Player Tag Input */}
      <div className="mb-6">
        <label htmlFor="username" className="block text-sm font-medium text-slate-300 mb-2">
          Step 1: Enter Your Clash Royale Player Tag
        </label>
        
        {/* Easy Instructions */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-3">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-blue-300 font-semibold text-sm mb-2">How to Find Your Player Tag:</h4>
              <ol className="space-y-2 text-xs text-blue-200">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-blue-400">1.</span>
                  <span>Open Clash Royale on your device</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-blue-400">2.</span>
                  <span>Tap your <strong>Profile</strong> icon (top left corner)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-blue-400">3.</span>
                  <span>Look for your <strong>Player Tag</strong> (starts with #)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-blue-400">4.</span>
                  <span>Tap the <strong>Copy</strong> button next to your tag</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-blue-400">5.</span>
                  <span>Paste it in the field below</span>
                </li>
              </ol>
            </div>
          </div>
        </div>

        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="#ABC123XYZ"
          className="input-premium w-full px-4 py-3 rounded-lg text-white placeholder-slate-500 text-base"
          disabled={isSubmitting || status === "success"}
          required
        />

        {/* Player Stats Display */}
        {loadingStats && (
          <div className="mt-3 p-3 bg-slate-800/50 rounded-lg border border-purple-500/20">
            <div className="flex items-center gap-2 text-purple-300 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              Verifying player tag...
            </div>
          </div>
        )}

        {statsError && (
          <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-red-400 text-sm">{statsError}</p>
          </div>
        )}

        {playerStats && !loadingStats && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-lg"
          >
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <h4 className="text-white font-semibold">{playerStats.name}</h4>
              <span className="text-slate-400 text-xs">{playerStats.tag}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-900/50 rounded p-2">
                <div className="text-slate-400 text-xs mb-1">Trophies</div>
                <div className="text-white font-bold text-lg">{playerStats.trophies.toLocaleString()}</div>
              </div>
              <div className="bg-slate-900/50 rounded p-2">
                <div className="text-slate-400 text-xs mb-1">Level</div>
                <div className="text-white font-bold text-lg">{playerStats.level}</div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Step 2: Tournament Details (Only shown after valid tag) */}
      {showTournamentDetails && playerStats && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.3 }}
          className="mb-6 p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg"
        >
          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-game-gold" />
            Step 2: Tournament Details
          </h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-sm">Tournament Tag:</span>
              <div className="flex items-center gap-2">
                <code className="text-white font-mono text-sm bg-slate-900/50 px-2 py-1 rounded">
                  {TOURNAMENT_CONFIG.tournament.tag}
                </code>
                <button
                  onClick={() => navigator.clipboard.writeText(TOURNAMENT_CONFIG.tournament.tag)}
                  className="p-1 hover:bg-white/10 rounded transition-colors"
                  title="Copy tag"
                >
                  <Copy className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-sm">Password:</span>
              <div className="flex items-center gap-2">
                <code className="text-white font-mono text-sm bg-slate-900/50 px-2 py-1 rounded">
                  {TOURNAMENT_CONFIG.tournament.password}
                </code>
                <button
                  onClick={() => navigator.clipboard.writeText(TOURNAMENT_CONFIG.tournament.password)}
                  className="p-1 hover:bg-white/10 rounded transition-colors"
                  title="Copy password"
                >
                  <Copy className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            </div>
            <div className="pt-2 border-t border-purple-500/20">
              <p className="text-xs text-purple-200">
                <strong>Important:</strong> Maintain at least {formatBalance(TIER_THRESHOLDS.TOURNAMENT)} $ELIXIR tokens during the tournament to receive prizes.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Error/Success Messages */}
      {status === "error" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-2 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm mb-4"
        >
          <XCircle className="w-4 h-4" />
          <span>{errorMessage}</span>
        </motion.div>
      )}

      {status === "success" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-2 p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400 text-sm mb-4"
        >
          <CheckCircle className="w-4 h-4" />
          <span>Successfully signed up for the tournament!</span>
        </motion.div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        onClick={handleSubmit}
        disabled={isSubmitting || status === "success" || !playerStats}
        className={`
          btn-premium w-full px-4 py-3 rounded-lg font-display font-semibold transition-all
          ${
            isSubmitting || status === "success" || !playerStats
              ? "bg-slate-700 text-slate-400 cursor-not-allowed"
              : "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-600/40 border border-purple-400/30 hover:shadow-purple-600/60"
          }
        `}
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Submitting...
          </span>
        ) : status === "success" ? (
          "Signed Up!"
        ) : !playerStats ? (
          "Enter Player Tag First"
        ) : (
          "Sign Up for Tournament"
        )}
      </button>

      <p className="text-xs text-slate-500 mt-4 text-center">
        Your wallet address ({publicKey?.toBase58().slice(0, 8)}...) will be linked to your signup.
      </p>
    </motion.div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Loader2, Trophy, TrendingUp, Users, Award } from "lucide-react";
import { supabase, TournamentSignup } from "@/lib/supabase";
import { useWallet } from "@solana/wallet-adapter-react";
import { getPlayerStats, PlayerStats } from "@/lib/clashRoyale/getPlayerStats";

interface TournamentSignupFormProps {
  tier: "DAILY" | "WHALE" | "TGE";
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

  // Fetch player stats when tag is entered
  useEffect(() => {
    const fetchStats = async () => {
      const trimmedTag = username.trim();
      if (!trimmedTag || trimmedTag.length < 3) {
        setPlayerStats(null);
        setStatsError(null);
        return;
      }

      // Debounce: wait 800ms after user stops typing
      const timeoutId = setTimeout(async () => {
        setLoadingStats(true);
        setStatsError(null);
        try {
          const stats = await getPlayerStats(trimmedTag);
          setPlayerStats(stats);
        } catch (error: any) {
          setPlayerStats(null);
          setStatsError(error.message);
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
      setErrorMessage("Please enter your Clash Royale username");
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-xl p-6 border border-purple-500/20"
    >
      <div className="mb-4">
        <h3 className="text-xl font-bold text-white mb-2">
          Sign Up for Tournament
        </h3>
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3 mb-4">
          <p className="text-sm text-purple-200">
            <span className="font-semibold text-white">✨ Early Signups Open!</span> You can sign up now with your Clash Royale tag. 
            Tournament details will be available closer to the event. Your signup will be visible in the Tournaments Monitor.
          </p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-slate-300 mb-2">
            Clash Royale Player Tag
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="#ABC123XYZ (your player tag)"
            className="input-premium w-full px-4 py-2 rounded-lg text-white placeholder-slate-500"
            disabled={isSubmitting || status === "success"}
            required
          />
          <p className="text-xs text-slate-500 mt-1">
            Find your player tag in-game: Profile → Copy Player Tag
          </p>

          {/* Player Stats Display */}
          {loadingStats && (
            <div className="mt-3 p-3 bg-slate-800/50 rounded-lg border border-purple-500/20">
              <div className="flex items-center gap-2 text-purple-300 text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading player stats...
              </div>
            </div>
          )}

          {statsError && (
            <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-xs">{statsError}</p>
            </div>
          )}

          {playerStats && !loadingStats && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg"
            >
              <div className="flex items-center gap-2 mb-3">
                <Trophy className="w-5 h-5 text-game-gold" />
                <h4 className="text-white font-semibold">{playerStats.name}</h4>
                <span className="text-slate-400 text-xs">{playerStats.tag}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-900/50 rounded p-2">
                  <div className="text-slate-400 text-xs mb-1">Trophies</div>
                  <div className="text-white font-bold text-lg">{playerStats.trophies.toLocaleString()}</div>
                  {playerStats.bestTrophies > playerStats.trophies && (
                    <div className="text-yellow-400 text-xs">Best: {playerStats.bestTrophies.toLocaleString()}</div>
                  )}
                </div>
                <div className="bg-slate-900/50 rounded p-2">
                  <div className="text-slate-400 text-xs mb-1">Level</div>
                  <div className="text-white font-bold text-lg">{playerStats.level}</div>
                </div>
                <div className="bg-slate-900/50 rounded p-2">
                  <div className="text-slate-400 text-xs mb-1">Wins</div>
                  <div className="text-green-400 font-bold">{playerStats.wins.toLocaleString()}</div>
                </div>
                <div className="bg-slate-900/50 rounded p-2">
                  <div className="text-slate-400 text-xs mb-1">Losses</div>
                  <div className="text-red-400 font-bold">{playerStats.losses.toLocaleString()}</div>
                </div>
                {playerStats.battleCount > 0 && (
                  <div className="bg-slate-900/50 rounded p-2 col-span-2">
                    <div className="text-slate-400 text-xs mb-1">Total Battles</div>
                    <div className="text-white font-semibold">{playerStats.battleCount.toLocaleString()}</div>
                    {playerStats.wins + playerStats.losses > 0 && (
                      <div className="text-slate-400 text-xs mt-1">
                        Win Rate: {Math.round((playerStats.wins / (playerStats.wins + playerStats.losses)) * 100)}%
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>

        {status === "error" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm"
          >
            <XCircle className="w-4 h-4" />
            <span>{errorMessage}</span>
          </motion.div>
        )}

        {status === "success" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400 text-sm"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Successfully signed up for the tournament!</span>
          </motion.div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || status === "success"}
          className={`
            btn-premium w-full px-4 py-3 rounded-lg font-display font-semibold
            ${
              isSubmitting || status === "success"
                ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                : "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-600/40 border border-purple-400/30"
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
          ) : (
            "Sign Up for Tournament"
          )}
        </button>
      </form>

      <p className="text-xs text-slate-500 mt-4">
        Your wallet address ({publicKey?.toBase58().slice(0, 8)}...) will be linked to your signup.
      </p>
    </motion.div>
  );
}


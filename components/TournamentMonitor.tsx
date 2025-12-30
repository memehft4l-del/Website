"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, Trophy, TrendingUp, Shield, Crown, ExternalLink, Loader2, AlertCircle } from "lucide-react";
import { supabase, TournamentSignup } from "@/lib/supabase";
import { TIER_THRESHOLDS } from "@/lib/constants";

export function TournamentMonitor() {
  const [signups, setSignups] = useState<TournamentSignup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSignups();
  }, []);

  const loadSignups = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from("tournament_signups")
        .select("*")
        .order("created_at", { ascending: false });

      if (supabaseError) {
        throw supabaseError;
      }

      if (data) {
        setSignups(data);
      }
    } catch (err: any) {
      console.error("Error loading signups:", err);
      setError(err.message || "Failed to load tournament signups");
    } finally {
      setIsLoading(false);
    }
  };

  // Format player tag for RoyaleAPI URL
  const formatPlayerTagForURL = (tag: string): string => {
    // Remove # and ensure uppercase
    return tag.replace(/#/g, "").toUpperCase();
  };

  // Get RoyaleAPI URL for a player
  const getRoyaleAPIUrl = (playerTag: string): string => {
    const formattedTag = formatPlayerTagForURL(playerTag);
    return `https://royaleapi.com/player/${formattedTag}`;
  };

  const formatBalance = (bal: number) => {
    return new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 0,
    }).format(bal);
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case "WHALE":
        return <Crown className="w-5 h-5 text-game-gold" />;
      case "SQUIRE":
        return <Shield className="w-5 h-5 text-slate-400" />;
      default:
        return null;
    }
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

  // Calculate tournament statistics
  const totalSignups = signups.length;
  const squireCount = signups.filter((s) => s.tier === "SQUIRE").length;
  const whaleCount = signups.filter((s) => s.tier === "WHALE").length;

  return (
    <div className="space-y-6">
      {/* Tournament Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <Trophy className="w-8 h-8 text-game-gold" />
          <h2 className="text-3xl font-bold text-white">Tournament Overview</h2>
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          <div className="glass rounded-lg p-4 border border-white/5">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-purple-400" />
              <div className="text-slate-400 text-sm font-medium">Total Signups</div>
            </div>
            <div className="text-3xl font-bold text-white">{totalSignups}</div>
          </div>

          <div className="glass rounded-lg p-4 border border-white/5">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-slate-400" />
              <div className="text-slate-400 text-sm font-medium">Squire Arena</div>
            </div>
            <div className="text-3xl font-bold text-white">{squireCount}</div>
          </div>

          <div className="glass rounded-lg p-4 border border-white/5">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-5 h-5 text-game-gold" />
              <div className="text-slate-400 text-sm font-medium">Whale War</div>
            </div>
            <div className="text-3xl font-bold text-white">{whaleCount}</div>
          </div>

          <div className="glass rounded-lg p-4 border border-white/5">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <div className="text-slate-400 text-sm font-medium">Total Players</div>
            </div>
            <div className="text-3xl font-bold text-white">{totalSignups}</div>
          </div>
        </div>
      </motion.div>

      {/* Signups List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass rounded-2xl p-6"
      >
        <h3 className="text-2xl font-bold text-white mb-6">Registered Players</h3>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
            <span className="ml-3 text-slate-400">Loading signups...</span>
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        ) : signups.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No signups yet. Be the first to register!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {signups.map((signup, index) => (
              <motion.div
                key={signup.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glass rounded-lg p-4 border border-white/5 hover:border-purple-500/30 transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  {/* Player Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className={`flex items-center gap-2 px-3 py-1 rounded-lg border ${getTierColor(
                          signup.tier
                        )}`}
                      >
                        {getTierIcon(signup.tier)}
                        <span className="text-sm font-semibold">{signup.tier}</span>
                      </div>
                      <h4 className="text-lg font-bold text-white">
                        {signup.clash_royale_username}
                      </h4>
                    </div>
                    <p className="text-xs text-slate-500 font-mono">
                      {signup.wallet_address.slice(0, 8)}...{signup.wallet_address.slice(-6)}
                    </p>
                  </div>

                  {/* Player Stats Link */}
                  <div className="flex items-center">
                    <a
                      href={getRoyaleAPIUrl(signup.clash_royale_username)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all text-sm"
                    >
                      <span>View Stats</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}


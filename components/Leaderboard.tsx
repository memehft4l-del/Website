"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { Trophy, Medal, Award, TrendingUp, User } from "lucide-react";

interface LeaderboardEntry {
  wallet_address: string;
  cr_tag: string | null;
  total_points: number;
  games_won: number;
  games_lost: number;
  win_rate: number;
  total_winnings: number;
  win_streak: number;
  best_win_streak: number;
}

export default function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<"all" | "week" | "month">("all");

  useEffect(() => {
    fetchLeaderboard();
    
    // Subscribe to Realtime updates
    const channel = supabase
      .channel("leaderboard-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_profiles",
        },
        () => {
          fetchLeaderboard();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [timeframe]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("leaderboard")
        .select("*")
        .order("total_points", { ascending: false })
        .limit(100);

      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="text-yellow-400" size={24} />;
    if (rank === 2) return <Medal className="text-gray-300" size={24} />;
    if (rank === 3) return <Award className="text-orange-400" size={24} />;
    return <span className="text-purple-300 font-bold">#{rank}</span>;
  };

  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-3xl font-bold text-white flex items-center gap-2">
            <Trophy className="text-yellow-400" />
            Leaderboard
          </h2>
          <div className="flex gap-2">
            {(["all", "week", "month"] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                  timeframe === tf
                    ? "bg-purple-600 text-white"
                    : "bg-white/10 text-purple-300 hover:bg-white/20"
                }`}
              >
                {tf.charAt(0).toUpperCase() + tf.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-20 text-purple-300">
          <Trophy size={48} className="mx-auto mb-4 opacity-50" />
          <p>No players yet. Be the first to compete!</p>
        </div>
      ) : (
        <div className="bg-white/10 backdrop-blur-md rounded-lg border border-purple-500/30 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-purple-900/50">
                <tr>
                  <th className="px-6 py-4 text-left text-purple-300 font-medium">Rank</th>
                  <th className="px-6 py-4 text-left text-purple-300 font-medium">Player</th>
                  <th className="px-6 py-4 text-left text-purple-300 font-medium">Points</th>
                  <th className="px-6 py-4 text-left text-purple-300 font-medium">W/L</th>
                  <th className="px-6 py-4 text-left text-purple-300 font-medium">Win Rate</th>
                  <th className="px-6 py-4 text-left text-purple-300 font-medium">Streak</th>
                  <th className="px-6 py-4 text-left text-purple-300 font-medium">Winnings</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, index) => (
                  <motion.tr
                    key={entry.wallet_address}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`border-t border-purple-500/20 hover:bg-white/5 transition-colors ${
                      index < 3 ? "bg-gradient-to-r from-purple-900/30 to-transparent" : ""
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getRankIcon(index + 1)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                          <User className="text-white" size={20} />
                        </div>
                        <div>
                          <div className="text-white font-medium">
                            {entry.cr_tag || `${entry.wallet_address.slice(0, 8)}...`}
                          </div>
                          <div className="text-purple-300 text-xs font-mono">
                            {entry.wallet_address.slice(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="text-green-400" size={18} />
                        <span className="text-white font-bold text-lg">{entry.total_points.toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-white">
                        <span className="text-green-400 font-semibold">{entry.games_won}</span>
                        <span className="text-purple-300 mx-1">/</span>
                        <span className="text-red-400 font-semibold">{entry.games_lost}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-purple-900/50 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all"
                            style={{ width: `${entry.win_rate}%` }}
                          />
                        </div>
                        <span className="text-white font-medium text-sm w-12 text-right">
                          {entry.win_rate.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-semibold">{entry.win_streak}</span>
                        {entry.win_streak === entry.best_win_streak && (
                          <span className="text-yellow-400 text-xs">🔥</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-green-400 font-semibold">
                        {entry.total_winnings.toFixed(2)} SOL
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}



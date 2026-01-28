"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { useWallet } from "@solana/wallet-adapter-react";
import { supabase } from "@/lib/supabase";
import { Trophy, Users, Clock, CheckCircle, XCircle, Loader2, Coins, X, AlertCircle, TestTube, Wallet, Info, Gamepad2, Share2, Copy as CopyIcon } from "lucide-react";
import { Connection, PublicKey, SystemProgram, Transaction, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { RPC_ENDPOINT, getAvailableWagerAmounts, DEFAULT_WAGER_AMOUNT, ADMIN_WALLET_ADDRESS, STUCK_MATCH_TIMEOUT, getSolscanUrl, IS_PRODUCTION } from "@/lib/constants";
import { updateUserProfile, getUserProfile } from "@/lib/wagers";
import { getUserStats } from "@/lib/points";
import { getPlayerStats, PlayerStats } from "@/lib/clashRoyale/getPlayerStats";

interface Wager {
  id: number;
  creator_id: string;
  opponent_id: string | null;
  amount: number;
  status: "PENDING" | "ACTIVE" | "COMPLETED" | "DISPUTED" | "CANCELLED";
  winner_id: string | null;
  escrow_address: string | null;
  transaction_signature: string | null;
  deposit_signature: string | null;
  payout_signature: string | null;
  refund_signature: string | null;
  created_at: string;
  activated_at: string | null;
  completed_at: string | null;
  tournament_tag?: string | null;
  tournament_password?: string | null;
}

interface UserProfile {
  wallet_address: string;
  cr_tag: string | null;
}

export default function ArenaPage() {
  const wallet = useWallet();
  const { publicKey, connected, signTransaction } = wallet;
  const [wagers, setWagers] = useState<Wager[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimingWagerId, setClaimingWagerId] = useState<number | null>(null);
  const [selectedAmount, setSelectedAmount] = useState<number>(DEFAULT_WAGER_AMOUNT);
  const [creatingWager, setCreatingWager] = useState(false);
  const [joiningWagerId, setJoiningWagerId] = useState<number | null>(null);
  const [playerTag, setPlayerTag] = useState<string>("");
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [userStats, setUserStats] = useState<{ points: number; gamesWon: number; gamesLost: number; winStreak: number } | null>(null);
  const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);
  const [loadingPlayerStats, setLoadingPlayerStats] = useState(false);
  const [playerStatsError, setPlayerStatsError] = useState<string | null>(null);
  const statsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Get available wager amounts based on environment
  const availableAmounts = getAvailableWagerAmounts();
  const isDevnet = !process.env.NEXT_PUBLIC_SOLANA_NETWORK || process.env.NEXT_PUBLIC_SOLANA_NETWORK === "devnet";
  
  // Set default amount
  useEffect(() => {
    if (availableAmounts.length > 0) {
      setSelectedAmount(availableAmounts[0]);
    }
  }, [availableAmounts]);

  // Fetch user profile and stats when wallet connects
  useEffect(() => {
    if (publicKey) {
      fetchUserProfile();
      fetchUserStats();
    } else {
      setUserProfile(null);
      setPlayerTag("");
      setUserStats(null);
      setPlayerStats(null);
    }
  }, [publicKey]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (statsTimeoutRef.current) {
        clearTimeout(statsTimeoutRef.current);
      }
    };
  }, []);

  const fetchUserStats = async () => {
    if (!publicKey) return;
    
    try {
      const stats = await getUserStats(publicKey.toBase58());
      if (stats) {
        setUserStats({
          points: stats.points,
          gamesWon: stats.gamesWon,
          gamesLost: stats.gamesLost,
          winStreak: stats.winStreak,
        });
      }
    } catch (error) {
      console.error("Error fetching user stats:", error);
    }
  };

  // Fetch wagers on mount
  useEffect(() => {
    fetchWagers();

    // Subscribe to Realtime updates
    const channel = supabase
      .channel("wagers-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "wagers",
        },
        (payload) => {
          console.log("Wager update received:", payload);
          fetchWagers(); // Refresh wagers on any change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchUserProfile = async () => {
    if (!publicKey) return;
    
    try {
      setLoadingProfile(true);
      const { data, error } = await getUserProfile(publicKey.toBase58());
      if (error && error.code !== 'PGRST116') { // PGRST116 = not found, which is ok
        console.error("Error fetching user profile:", error);
      } else if (data) {
        setUserProfile(data);
        setPlayerTag(data.cr_tag || "");
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    } finally {
      setLoadingProfile(false);
    }
  };

  const fetchWagers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("wagers")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      setWagers(data || []);
    } catch (error) {
      console.error("Error fetching wagers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimFunds = async (wagerId: number) => {
    if (!publicKey) {
      alert("Please connect your wallet");
      return;
    }

    try {
      setClaimingWagerId(wagerId);
      
      // Find the wager
      const wager = wagers.find((w) => w.id === wagerId);
      if (!wager || wager.winner_id !== publicKey.toBase58()) {
        alert("You are not the winner of this wager");
        return;
      }

      // Call Supabase Edge Function to claim funds
      // This would trigger the escrow release logic
      const { data, error } = await supabase.functions.invoke("claim-funds", {
        body: { wager_id: wagerId },
      });

      if (error) throw error;

      alert("Funds claimed successfully!");
      fetchWagers(); // Refresh
    } catch (error: any) {
      console.error("Error claiming funds:", error);
      alert(`Failed to claim funds: ${error.message}`);
    } finally {
      setClaimingWagerId(null);
    }
  };

  const handleVerifyMatch = async (wagerId: number) => {
    try {
      const { data, error } = await supabase.functions.invoke("verify-match", {
        body: { wager_id: wagerId },
      });

      if (error) throw error;

      if (data.success) {
        if (data.winner_id) {
          alert(`Match verified! Winner: ${data.winner_tag}\nScore: ${data.creator_wins}-${data.opponent_wins}`);
        } else {
          alert(data.message || "Match verification in progress. No winner yet.");
        }
        fetchWagers(); // Refresh
      }
    } catch (error: any) {
      console.error("Error verifying match:", error);
      alert(`Failed to verify match: ${error.message}`);
    }
  };

  const handleCancelWager = async (wagerId: number) => {
    if (!confirm("Are you sure you want to cancel this wager? Both players will be refunded.")) {
      return;
    }

    try {
      // Update wager status to CANCELLED and mark refunds needed
      const { error } = await supabase
        .from("wagers")
        .update({
          status: "CANCELLED",
          payout_status: "REFUNDED", // Mark as needing refund
          updated_at: new Date().toISOString(),
        })
        .eq("id", wagerId);

      if (error) throw error;

      alert("Wager cancelled successfully. Refunds will be processed by admin.");
      fetchWagers(); // Refresh
    } catch (error: any) {
      console.error("Error cancelling wager:", error);
      alert(`Failed to cancel wager: ${error.message}`);
    }
  };

  const handleCreateWager = async () => {
    if (!publicKey || !connected || !signTransaction) {
      alert("Please connect your wallet");
      return;
    }

    // Validate player tag
    const trimmedTag = playerTag.trim();
    if (!trimmedTag) {
      alert("Please enter your Clash Royale player tag (e.g., #ABC123XYZ)");
      return;
    }

    // Format tag (ensure it starts with #)
    const formattedTag = trimmedTag.startsWith("#") ? trimmedTag.toUpperCase() : `#${trimmedTag.toUpperCase()}`;

    try {
      setCreatingWager(true);
      
      // Check if user already has an outstanding wager (PENDING or ACTIVE)
      const { data: existingWagers, error: checkError } = await supabase
        .from("wagers")
        .select("id, status, amount")
        .or(`creator_id.eq.${publicKey.toBase58()},opponent_id.eq.${publicKey.toBase58()}`)
        .in("status", ["PENDING", "ACTIVE"]);

      if (checkError) throw checkError;

      if (existingWagers && existingWagers.length > 0) {
        const existingWager = existingWagers[0];
        alert(
          `You already have an outstanding wager!\n\n` +
          `Game #${existingWager.id} - ${existingWager.amount} SOL (${existingWager.status})\n\n` +
          `You can only have 1 active wager at a time. Please complete or cancel your current wager first.`
        );
        setCreatingWager(false);
        return;
      }
      
      // Update or create user profile with player tag
      const { error: profileError } = await updateUserProfile(publicKey.toBase58(), formattedTag);
      if (profileError) {
        console.error("Error updating user profile:", profileError);
        // Continue anyway, but log the error
      }
      
      // Create wager in database first
      const { data: wagerData, error: dbError } = await supabase
        .from("wagers")
        .insert({
          creator_id: publicKey.toBase58(),
          amount: selectedAmount,
          status: "PENDING",
          admin_wallet: ADMIN_WALLET_ADDRESS,
        })
        .select()
        .single();

      if (dbError) throw dbError;

      // Send SOL directly to admin wallet
      const connection = new Connection(RPC_ENDPOINT, "confirmed");
      const adminPubkey = new PublicKey(ADMIN_WALLET_ADDRESS);
      const lamports = selectedAmount * LAMPORTS_PER_SOL;

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: adminPubkey,
          lamports: lamports,
        })
      );

      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      const signedTx = await signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signedTx.serialize());
      await connection.confirmTransaction(signature, "confirmed");

      // Update database with transaction signature
      await supabase
        .from("wagers")
        .update({ 
          deposit_signature: signature,
          status: "PENDING",
        })
        .eq("id", wagerData.id);

      alert(`Wager created successfully! TX: ${signature}`);
      fetchWagers();
      fetchUserProfile(); // Refresh profile to show updated tag
    } catch (error: any) {
      console.error("Error creating wager:", error);
      alert(`Failed to create wager: ${error.message}`);
    } finally {
      setCreatingWager(false);
    }
  };

  const handleJoinWager = async (wagerId: number) => {
    if (!publicKey || !connected || !signTransaction) {
      alert("Please connect your wallet");
      return;
    }

    // Check if user already has an outstanding wager (PENDING or ACTIVE)
    const { data: existingWagers, error: checkError } = await supabase
      .from("wagers")
      .select("id, status, amount")
      .or(`creator_id.eq.${publicKey.toBase58()},opponent_id.eq.${publicKey.toBase58()}`)
      .in("status", ["PENDING", "ACTIVE"]);

    if (checkError) {
      alert(`Error checking existing wagers: ${checkError.message}`);
      return;
    }

    if (existingWagers && existingWagers.length > 0) {
      const existingWager = existingWagers[0];
      alert(
        `You already have an outstanding wager!\n\n` +
        `Game #${existingWager.id} - ${existingWager.amount} SOL (${existingWager.status})\n\n` +
        `You can only have 1 active wager at a time. Please complete or cancel your current wager first.`
      );
      return;
    }

    // Check if user has a player tag
    if (!userProfile?.cr_tag && !playerTag.trim()) {
      alert("Please set your Clash Royale player tag first. You can update it in the create wager form.");
      return;
    }

    // If user has a tag in state but not in profile, update it
    const tagToUse = userProfile?.cr_tag || playerTag.trim();
    if (!userProfile?.cr_tag && playerTag.trim()) {
      const formattedTag = tagToUse.startsWith("#") ? tagToUse.toUpperCase() : `#${tagToUse.toUpperCase()}`;
      await updateUserProfile(publicKey.toBase58(), formattedTag);
      await fetchUserProfile();
    }

    try {
      setJoiningWagerId(wagerId);
      
      // Get wager details
      const { data: wager, error: fetchError } = await supabase
        .from("wagers")
        .select("*")
        .eq("id", wagerId)
        .single();

      if (fetchError || !wager) throw new Error("Wager not found");
      if (wager.opponent_id) throw new Error("Wager already has an opponent");
      if (wager.creator_id === publicKey.toBase58()) throw new Error("Cannot join your own wager");

      // Send SOL directly to admin wallet
      const connection = new Connection(RPC_ENDPOINT, "confirmed");
      const adminPubkey = new PublicKey(ADMIN_WALLET_ADDRESS);
      const lamports = wager.amount * LAMPORTS_PER_SOL;

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: adminPubkey,
          lamports: lamports,
        })
      );

      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      const signedTx = await signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signedTx.serialize());
      await connection.confirmTransaction(signature, "confirmed");

      // Update wager with opponent and activate
      await supabase
        .from("wagers")
        .update({
          opponent_id: publicKey.toBase58(),
          status: "ACTIVE",
          activated_at: new Date().toISOString(),
        })
        .eq("id", wagerId);

      alert(`Joined wager successfully! TX: ${signature}`);
      fetchWagers();
    } catch (error: any) {
      console.error("Error joining wager:", error);
      alert(`Failed to join wager: ${error.message}`);
    } finally {
      setJoiningWagerId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "text-yellow-400";
      case "ACTIVE":
        return "text-green-400";
      case "COMPLETED":
        return "text-blue-400";
      case "DISPUTED":
        return "text-red-400";
      case "CANCELLED":
        return "text-gray-400";
      default:
        return "text-slate-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Clock className="w-4 h-4" />;
      case "ACTIVE":
        return <Loader2 className="w-4 h-4 animate-spin" />;
      case "COMPLETED":
        return <CheckCircle className="w-4 h-4" />;
      case "DISPUTED":
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const myWagers = wagers.filter(
    (w) =>
      w.creator_id === publicKey?.toBase58() ||
      w.opponent_id === publicKey?.toBase58()
  );

  // Check if user has an outstanding wager
  const hasOutstandingWager = myWagers.some(
    (w) => w.status === "PENDING" || w.status === "ACTIVE"
  );

  return (
    <div className="min-h-screen bg-[#0a0a0f] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="w-8 h-8 text-game-gold" />
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white">
              Clash Royale 1v1s
            </h1>
            {isDevnet && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="px-3 py-1 bg-yellow-500/20 border border-yellow-500/50 rounded-lg flex items-center gap-2"
              >
                <TestTube className="w-4 h-4 text-yellow-400" />
                <span className="text-xs font-semibold text-yellow-400">DEVNET</span>
              </motion.div>
            )}
          </div>
          <p className="text-slate-400 text-lg">
            Think you're the best? Place bets on yourself and play 1v1s against other real players to win SOL • Winner takes all • One active wager per wallet
            {isDevnet && (
              <span className="ml-2 text-yellow-400 text-sm">(Test Mode - Not Real SOL)</span>
            )}
          </p>
          {connected && userStats && (
            <div className="mt-4 flex items-center justify-center gap-6 flex-wrap">
              <div className="px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-lg">
                <div className="text-purple-300 text-xs">Points</div>
                <div className="text-white font-bold text-lg">{userStats.points.toLocaleString()}</div>
              </div>
              <div className="px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-lg">
                <div className="text-green-300 text-xs">Wins</div>
                <div className="text-white font-bold text-lg">{userStats.gamesWon}</div>
              </div>
              <div className="px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-lg">
                <div className="text-red-300 text-xs">Losses</div>
                <div className="text-white font-bold text-lg">{userStats.gamesLost}</div>
              </div>
              {userStats.winStreak > 0 && (
                <div className="px-4 py-2 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
                  <div className="text-yellow-300 text-xs">Win Streak</div>
                  <div className="text-white font-bold text-lg">🔥 {userStats.winStreak}</div>
                </div>
              )}
            </div>
          )}
        </motion.div>

        {!connected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass rounded-xl p-6 text-center mb-8"
          >
            <p className="text-slate-300 mb-2 text-lg font-semibold">
              Connect your wallet to start playing 1v1s
            </p>
            <p className="text-slate-400 text-sm">
              Think you're the best? Place bets on yourself and play against other real players to win SOL!
            </p>
          </motion.div>
        )}

        {/* Create Wager Section */}
        {connected && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-xl p-6 mb-8"
          >
            <h2 className="text-xl font-bold text-white mb-2">Create New 1v1 Wager</h2>
            <p className="text-slate-400 text-sm mb-4">
              Create a wager and wait for an opponent to join. Winner takes the full pot (both deposits).
            </p>
            
            {/* Info about where SOL goes */}
            <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-slate-300">
                  <p className="font-semibold text-blue-400 mb-1">Where does your SOL go?</p>
                  <p className="text-xs">
                    Your SOL is sent directly to our secure admin wallet for escrow. 
                    Funds are held until the match is verified, then paid to the winner.
                  </p>
                  <p className="text-xs mt-1 font-mono text-blue-300">
                    Admin Wallet: {ADMIN_WALLET_ADDRESS.slice(0, 8)}...{ADMIN_WALLET_ADDRESS.slice(-8)}
                  </p>
                </div>
              </div>
            </div>

            {hasOutstandingWager && (
              <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-yellow-200">
                    <p className="font-semibold text-yellow-400 mb-1">You have an active wager</p>
                    <p className="text-xs">
                      You can only have 1 active wager at a time. Complete or cancel your current wager to create a new one.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Clash Royale Player Tag <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={playerTag}
                  onChange={(e) => {
                    setPlayerTag(e.target.value);
                    const trimmedTag = e.target.value.trim();
                    
                    // Clear existing timeout
                    if (statsTimeoutRef.current) {
                      clearTimeout(statsTimeoutRef.current);
                    }
                    
                    if (trimmedTag.length >= 3) {
                      // Debounce: wait 800ms after user stops typing
                      statsTimeoutRef.current = setTimeout(async () => {
                        setLoadingPlayerStats(true);
                        setPlayerStatsError(null);
                        try {
                          const stats = await getPlayerStats(trimmedTag);
                          setPlayerStats(stats);
                        } catch (error: any) {
                          setPlayerStats(null);
                          setPlayerStatsError(error.message);
                        } finally {
                          setLoadingPlayerStats(false);
                        }
                      }, 800);
                    } else {
                      setPlayerStats(null);
                      setPlayerStatsError(null);
                    }
                  }}
                  placeholder="#ABC123XYZ"
                  className="w-full px-4 py-2 bg-slate-800 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Enter your Clash Royale player tag so others can see your stats
                </p>

                {/* Player Stats Display */}
                {loadingPlayerStats && (
                  <div className="mt-3 p-3 bg-slate-800/50 rounded-lg border border-purple-500/20">
                    <div className="flex items-center gap-2 text-purple-300 text-sm">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading player stats...
                    </div>
                  </div>
                )}

                {playerStatsError && (
                  <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <p className="text-red-400 text-xs">{playerStatsError}</p>
                  </div>
                )}

                {playerStats && !loadingPlayerStats && (
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
              
              <div className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Wager Amount (SOL)
                  </label>
                  <select
                    value={selectedAmount}
                    onChange={(e) => setSelectedAmount(parseFloat(e.target.value))}
                    className="w-full px-4 py-2 bg-slate-800 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {availableAmounts.map((amount) => (
                      <option key={amount} value={amount}>
                        {amount} SOL
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-slate-500 mt-1">
                    {isDevnet 
                      ? "Devnet: 0.1 SOL increments (Test Mode - Not Real SOL)"
                      : "Production: 0.1 SOL increments (0.1 - 10.0 SOL)"}
                  </p>
                </div>
                <button
                  onClick={handleCreateWager}
                  disabled={creatingWager || !playerTag.trim() || hasOutstandingWager}
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {creatingWager ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : hasOutstandingWager ? (
                    <>
                      <AlertCircle className="w-4 h-4" />
                      Complete Current Wager First
                    </>
                  ) : (
                    <>
                      <Coins className="w-4 h-4" />
                      Create 1v1 Wager
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          </div>
        ) : (
          <>
            {/* My Wagers - Organized by Status */}
            {connected && myWagers.length > 0 && (
              <>
                {/* Searching for a Game (PENDING) */}
                {myWagers.filter(w => w.status === "PENDING").length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                  >
                    <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                      <Clock className="w-6 h-6 text-yellow-400" />
                      Searching for a Game ({myWagers.filter(w => w.status === "PENDING").length})
                    </h2>
                    <div className="grid gap-4">
                      {myWagers.filter(w => w.status === "PENDING").map((wager) => (
                        <WagerCard
                          key={wager.id}
                          wager={wager}
                          isMyWager={true}
                          onClaim={() => handleClaimFunds(wager.id)}
                          onVerify={() => handleVerifyMatch(wager.id)}
                          onCancel={() => handleCancelWager(wager.id)}
                          claiming={claimingWagerId === wager.id}
                          myWallet={publicKey?.toBase58() || ""}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Active Wagers */}
                {myWagers.filter(w => w.status === "ACTIVE").length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                  >
                    <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                      <Loader2 className="w-6 h-6 text-green-400 animate-spin" />
                      Active Matches ({myWagers.filter(w => w.status === "ACTIVE").length})
                    </h2>
                    <div className="grid gap-4">
                      {myWagers.filter(w => w.status === "ACTIVE").map((wager) => (
                        <WagerCard
                          key={wager.id}
                          wager={wager}
                          isMyWager={true}
                          onClaim={() => handleClaimFunds(wager.id)}
                          onVerify={() => handleVerifyMatch(wager.id)}
                          onCancel={() => handleCancelWager(wager.id)}
                          claiming={claimingWagerId === wager.id}
                          myWallet={publicKey?.toBase58() || ""}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Completed Wagers */}
                {myWagers.filter(w => w.status === "COMPLETED").length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                  >
                    <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                      <CheckCircle className="w-6 h-6 text-green-400" />
                      Completed ({myWagers.filter(w => w.status === "COMPLETED").length})
                    </h2>
                    <div className="grid gap-4">
                      {myWagers.filter(w => w.status === "COMPLETED").map((wager) => (
                        <WagerCard
                          key={wager.id}
                          wager={wager}
                          isMyWager={true}
                          onClaim={() => handleClaimFunds(wager.id)}
                          onVerify={() => handleVerifyMatch(wager.id)}
                          onCancel={() => handleCancelWager(wager.id)}
                          claiming={claimingWagerId === wager.id}
                          myWallet={publicKey?.toBase58() || ""}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Cancelled Wagers */}
                {myWagers.filter(w => w.status === "CANCELLED").length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                  >
                    <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                      <XCircle className="w-6 h-6 text-red-400" />
                      Cancelled ({myWagers.filter(w => w.status === "CANCELLED").length})
                    </h2>
                    <div className="grid gap-4">
                      {myWagers.filter(w => w.status === "CANCELLED").map((wager) => (
                        <WagerCard
                          key={wager.id}
                          wager={wager}
                          isMyWager={true}
                          onClaim={() => handleClaimFunds(wager.id)}
                          onVerify={() => handleVerifyMatch(wager.id)}
                          onCancel={() => handleCancelWager(wager.id)}
                          claiming={claimingWagerId === wager.id}
                          myWallet={publicKey?.toBase58() || ""}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </>
            )}

            {/* All Wagers Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h2 className="text-2xl font-bold text-white mb-2">
                Available 1v1 Matches ({wagers.filter(w => w.status === "PENDING" && !w.opponent_id).length})
              </h2>
              <p className="text-slate-400 text-sm mb-4">
                Join an open wager to challenge another player. Winner takes the full pot.
              </p>
              {wagers.length === 0 ? (
                <div className="glass rounded-xl p-8 text-center">
                  <p className="text-slate-400">No wagers found</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {wagers.map((wager) => (
                    <WagerCard
                      key={wager.id}
                      wager={wager}
                      isMyWager={false}
                      onClaim={() => handleClaimFunds(wager.id)}
                      onVerify={() => handleVerifyMatch(wager.id)}
                      onCancel={() => handleCancelWager(wager.id)}
                      onJoin={() => handleJoinWager(wager.id)}
                      claiming={claimingWagerId === wager.id}
                      joining={joiningWagerId === wager.id}
                      myWallet={publicKey?.toBase58() || ""}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}

function WagerCard({
  wager,
  isMyWager,
  onClaim,
  onVerify,
  onCancel,
  onJoin,
  claiming,
  joining,
  myWallet,
}: {
  wager: Wager;
  isMyWager: boolean;
  onClaim: () => void;
  onVerify: () => void;
  onCancel: () => void;
  onJoin?: () => void;
  claiming: boolean;
  joining?: boolean;
  myWallet: string;
}) {
  const [creatorTag, setCreatorTag] = useState<string | null>(null);
  const [opponentTag, setOpponentTag] = useState<string | null>(null);
  const [loadingTags, setLoadingTags] = useState(true);

  // Fetch player tags for creator and opponent
  useEffect(() => {
    const fetchTags = async () => {
      setLoadingTags(true);
      try {
        // Fetch creator tag
        const { data: creatorProfile } = await getUserProfile(wager.creator_id);
        if (creatorProfile?.cr_tag) {
          setCreatorTag(creatorProfile.cr_tag);
        }

        // Fetch opponent tag if exists
        if (wager.opponent_id) {
          const { data: opponentProfile } = await getUserProfile(wager.opponent_id);
          if (opponentProfile?.cr_tag) {
            setOpponentTag(opponentProfile.cr_tag);
          }
        }
      } catch (error) {
        console.error("Error fetching player tags:", error);
      } finally {
        setLoadingTags(false);
      }
    };

    fetchTags();
  }, [wager.creator_id, wager.opponent_id]);

  // Check if wager is stuck (active for 60+ minutes with no matches)
  const isStuck = wager.status === "ACTIVE" && wager.activated_at && 
    (Date.now() - new Date(wager.activated_at).getTime()) >= STUCK_MATCH_TIMEOUT;
  
  const isWinner = wager.winner_id === myWallet;
  const isCreator = wager.creator_id === myWallet;
  const isOpponent = wager.opponent_id === myWallet;
  const canCancel = isStuck && (isCreator || isOpponent);
  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "text-yellow-400 bg-yellow-400/10 border-yellow-400/30";
      case "ACTIVE":
        return "text-green-400 bg-green-400/10 border-green-400/30";
      case "COMPLETED":
        return "text-blue-400 bg-blue-400/10 border-blue-400/30";
      case "DISPUTED":
        return "text-red-400 bg-red-400/10 border-red-400/30";
      case "CANCELLED":
        return "text-gray-400 bg-gray-400/10 border-gray-400/30";
      default:
        return "text-slate-400 bg-slate-400/10 border-slate-400/30";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Clock className="w-4 h-4" />;
      case "ACTIVE":
        return <Loader2 className="w-4 h-4 animate-spin" />;
      case "COMPLETED":
        return <CheckCircle className="w-4 h-4" />;
      case "DISPUTED":
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };


  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass rounded-xl p-6 border ${
        isMyWager ? "border-purple-500/50" : "border-white/10"
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span
              className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 border ${getStatusColor(
                wager.status
              )}`}
            >
              {getStatusIcon(wager.status)}
              {wager.status}
            </span>
            {isMyWager && (
              <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                MY WAGER
              </span>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-300">
              <Coins className="w-4 h-4 text-game-gold" />
              <span className="font-semibold text-white">
                {wager.amount} SOL
              </span>
            </div>

            <div className="text-sm text-slate-400 space-y-1">
              <div>
                Creator:{" "}
                {creatorTag ? (
                  <span className="text-white font-semibold">
                    {creatorTag}
                    <a
                      href={`https://link.clashroyale.com/invite/friend/en?tag=${creatorTag.replace('#', '')}&token=yhwzrceg&platform=iOS`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center"
                      title="Add as friend in Clash Royale"
                    >
                      <Users className="w-3 h-3" />
                    </a>
                  </span>
                ) : (
                  <span className="text-white font-mono text-xs">
                    {wager.creator_id.slice(0, 8)}...{wager.creator_id.slice(-8)}
                  </span>
                )}
                {isCreator && (
                  <span className="ml-2 text-purple-400">(You)</span>
                )}
              </div>
              {wager.opponent_id && (
                <div>
                  Opponent:{" "}
                  {opponentTag ? (
                    <span className="text-white font-semibold">
                      {opponentTag}
                      {opponentTag && (
                        <a
                          href={`https://link.clashroyale.com/invite/friend/en?tag=${opponentTag.replace('#', '')}&token=yhwzrceg&platform=iOS`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 text-blue-400 hover:text-blue-300 transition-colors"
                          title="Add as friend in Clash Royale"
                        >
                          <Users className="w-3 h-3 inline" />
                        </a>
                      )}
                    </span>
                  ) : (
                    <span className="text-white font-mono text-xs">
                      {wager.opponent_id.slice(0, 8)}...
                      {wager.opponent_id.slice(-8)}
                    </span>
                  )}
                  {isOpponent && (
                    <span className="ml-2 text-purple-400">(You)</span>
                  )}
                </div>
              )}
              {wager.winner_id && (
                <div className="text-game-gold">
                  Winner:{" "}
                  {wager.winner_id === wager.creator_id && creatorTag ? (
                    <span className="font-semibold">
                      {creatorTag}
                      <a
                        href={`https://link.clashroyale.com/invite/friend/en?tag=${creatorTag.replace('#', '')}&token=yhwzrceg&platform=iOS`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center"
                        title="Add as friend in Clash Royale"
                      >
                        <Users className="w-3 h-3" />
                      </a>
                    </span>
                  ) : wager.winner_id === wager.opponent_id && opponentTag ? (
                    <span className="font-semibold">
                      {opponentTag}
                      <a
                        href={`https://link.clashroyale.com/invite/friend/en?tag=${opponentTag.replace('#', '')}&token=yhwzrceg&platform=iOS`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center"
                        title="Add as friend in Clash Royale"
                      >
                        <Users className="w-3 h-3" />
                      </a>
                    </span>
                  ) : (
                    <span className="font-mono text-xs">
                      {wager.winner_id.slice(0, 8)}...
                      {wager.winner_id.slice(-8)}
                    </span>
                  )}
                  {isWinner && (
                    <span className="ml-2 text-green-400">(You won!)</span>
                  )}
                </div>
              )}
            </div>

            {/* Transaction Links */}
            <div className="space-y-1 mt-2">
              {wager.deposit_signature && (
                <div className="text-xs text-slate-500">
                  Deposit:{" "}
                  <a
                    href={getSolscanUrl(wager.deposit_signature)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 underline"
                  >
                    {wager.deposit_signature.slice(0, 16)}...
                  </a>
                </div>
              )}
              {wager.payout_signature && wager.status === "COMPLETED" && (
                <div className="text-xs text-slate-500">
                  Winner Payment:{" "}
                  <a
                    href={getSolscanUrl(wager.payout_signature)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-400 hover:text-green-300 underline"
                  >
                    {wager.payout_signature.slice(0, 16)}...
                  </a>
                </div>
              )}
              {wager.refund_signature && wager.status === "CANCELLED" && (
                <div className="text-xs text-slate-500">
                  Refund:{" "}
                  <a
                    href={getSolscanUrl(wager.refund_signature)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-red-400 hover:text-red-300 underline"
                  >
                    {wager.refund_signature.slice(0, 16)}...
                  </a>
                </div>
              )}
              {wager.transaction_signature && !wager.deposit_signature && (
                <div className="text-xs text-slate-500">
                  TX:{" "}
                  <a
                    href={getSolscanUrl(wager.transaction_signature)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-400 hover:text-purple-300 underline"
                  >
                    {wager.transaction_signature.slice(0, 16)}...
                  </a>
                </div>
              )}
            </div>

            {/* Play Instructions for ACTIVE wagers */}
            {wager.status === "ACTIVE" && (isCreator || isOpponent) && (
              <PlayInstructionsSection 
                wager={wager} 
                isCreator={isCreator}
                onTournamentDetailsSaved={() => {
                  // Refresh wagers to get updated tournament details
                  fetchWagers();
                }}
              />
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:items-end">
          {wager.status === "PENDING" && !wager.opponent_id && !isCreator && onJoin && (
            <button
              onClick={onJoin}
              disabled={joining}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {joining ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Joining...
                </>
              ) : (
                <>
                  <Users className="w-4 h-4" />
                  Join Wager
                </>
              )}
            </button>
          )}
          {(wager.status === "PENDING" || wager.status === "ACTIVE") && (isCreator || isOpponent) && (
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all text-sm flex items-center gap-2"
            >
              <XCircle className="w-4 h-4" />
              Cancel Wager
            </button>
          )}
          {wager.status === "ACTIVE" && (
            <>
              <button
                onClick={onVerify}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-all text-sm"
              >
                Verify Match
              </button>
              {canCancel && (
                <motion.button
                  onClick={onCancel}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all text-sm flex items-center gap-2"
                >
                  <AlertCircle className="w-4 h-4" />
                  Cancel/Refund (60min Timeout)
                </motion.button>
              )}
            </>
          )}

          {wager.status === "COMPLETED" && isWinner && (
            <button
              onClick={onClaim}
              disabled={claiming}
              className="px-4 py-2 bg-game-gold hover:bg-game-gold/80 text-black rounded-lg font-semibold transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {claiming ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Claiming...
                </>
              ) : (
                <>
                  <Coins className="w-4 h-4" />
                  Claim Funds
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Play Instructions Component
function PlayInstructionsSection({ 
  wager, 
  isCreator,
  onTournamentDetailsSaved 
}: { 
  wager: Wager; 
  isCreator: boolean;
  onTournamentDetailsSaved: () => void;
}) {
  const [showInstructions, setShowInstructions] = useState(false);
  const [tournamentTag, setTournamentTag] = useState<string>(wager.tournament_tag || "");
  const [tournamentPassword, setTournamentPassword] = useState<string>(wager.tournament_password || "");
  const [saving, setSaving] = useState(false);

  const handleSaveTournament = async () => {
    if (!tournamentTag.trim() || !tournamentPassword.trim()) {
      alert("Please enter both tournament tag and password");
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase
        .from("wagers")
        .update({
          tournament_tag: tournamentTag.trim(),
          tournament_password: tournamentPassword.trim(),
        })
        .eq("id", wager.id);
      if (error) throw error;
      alert("Tournament details saved! Your opponent can now see them.");
      onTournamentDetailsSaved();
    } catch (error: any) {
      alert(`Failed to save: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Gamepad2 className="w-4 h-4 text-blue-400" />
          <span className="text-blue-300 font-semibold text-sm">How to Play Your 1v1 Match</span>
        </div>
        <button
          onClick={() => setShowInstructions(!showInstructions)}
          className="text-blue-400 hover:text-blue-300 text-xs"
        >
          {showInstructions ? "Hide" : "Show"}
        </button>
      </div>
      {showInstructions && (
        <div className="space-y-3 text-xs text-slate-300">
          {wager.tournament_tag && wager.tournament_password ? (
            <>
              <div className="bg-slate-900/50 rounded p-3 space-y-2">
                <div className="text-blue-200 font-semibold mb-2">Tournament Details:</div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-slate-400 min-w-[60px]">Tag:</span>
                    <code className="text-white font-mono bg-slate-800 px-2 py-1 rounded flex-1">{wager.tournament_tag}</code>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(wager.tournament_tag!);
                        alert("Copied!");
                      }}
                      className="text-blue-400 hover:text-blue-300 p-1"
                      title="Copy tag"
                    >
                      <CopyIcon size={14} />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-slate-400 min-w-[60px]">Password:</span>
                    <code className="text-white font-mono bg-slate-800 px-2 py-1 rounded flex-1">{wager.tournament_password}</code>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(wager.tournament_password!);
                        alert("Copied!");
                      }}
                      className="text-blue-400 hover:text-blue-300 p-1"
                      title="Copy password"
                    >
                      <CopyIcon size={14} />
                    </button>
                  </div>
                </div>
              </div>
              <ol className="list-decimal list-inside space-y-1.5 ml-2">
                <li>Open Clash Royale app on your device</li>
                <li>Go to <strong>Tournaments</strong> → <strong>Search</strong></li>
                <li>Enter tournament tag: <code className="bg-slate-800 px-1 rounded">{wager.tournament_tag}</code></li>
                <li>Enter password: <code className="bg-slate-800 px-1 rounded">{wager.tournament_password}</code></li>
                <li>Join the tournament</li>
                <li>Play your 1v1 match against your opponent</li>
                <li>After playing, click <strong>"Verify Match"</strong> button to check results</li>
              </ol>
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded p-2 text-yellow-200 text-xs">
                💡 Tip: Make sure both players join the tournament before starting the match!
              </div>
            </>
          ) : (
            <>
              <p className="text-blue-200 mb-3">
                {isCreator 
                  ? "Create a private tournament in Clash Royale and share the details below:"
                  : "Wait for the creator to set up the tournament. Once they add the tournament tag and password, you'll see instructions here."}
              </p>
              {isCreator && (
                <div className="space-y-2">
                  <div>
                    <label className="text-slate-400 text-xs mb-1 block">Tournament Tag</label>
                    <input
                      type="text"
                      placeholder="#ABC123 (from Clash Royale)"
                      value={tournamentTag}
                      onChange={(e) => setTournamentTag(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-white/10 rounded text-white text-xs placeholder-slate-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 text-xs mb-1 block">Tournament Password</label>
                    <input
                      type="text"
                      placeholder="Password you set in Clash Royale"
                      value={tournamentPassword}
                      onChange={(e) => setTournamentPassword(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-white/10 rounded text-white text-xs placeholder-slate-500"
                    />
                  </div>
                  <button
                    onClick={handleSaveTournament}
                    disabled={saving || !tournamentTag.trim() || !tournamentPassword.trim()}
                    className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? "Saving..." : "Save Tournament Details"}
                  </button>
                  <div className="bg-slate-900/50 rounded p-2 text-xs text-slate-400">
                    <strong>How to create:</strong> In Clash Royale → Tournaments → Create → Set as Private → Copy the tag and set a password
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}


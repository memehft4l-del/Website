"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { supabase } from "@/lib/supabase";
import { Trophy, Users, Clock, CheckCircle, XCircle, Loader2, Coins, X, AlertCircle, TestTube, Wallet, Info, Gamepad2, Share2, Copy as CopyIcon, TrendingUp, Award } from "lucide-react";
import { Connection, PublicKey, SystemProgram, Transaction, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { RPC_ENDPOINT, getAvailableWagerAmounts, DEFAULT_WAGER_AMOUNT, ADMIN_WALLET_ADDRESS, STUCK_MATCH_TIMEOUT, getSolscanUrl, getSolscanAccountUrl, IS_PRODUCTION } from "@/lib/constants";
import { updateUserProfile, getUserProfile } from "@/lib/wagers";
import { getUserStats } from "@/lib/points";
import { getPlayerStats, PlayerStats } from "@/lib/clashRoyale/getPlayerStats";
import { generateSolanaPayLink } from "@/lib/solana/solanaPay";
import Link from "next/link";
import { ArrowLeft, Swords, Trophy as TrophyIcon } from "lucide-react";
import dynamic from "next/dynamic";
import { ArenaStats } from "@/components/ArenaStats";

// Dynamically import TournamentMonitor to prevent SSR issues
const TournamentMonitor = dynamic(
  () => import("@/components/TournamentMonitor").then((mod) => ({ default: mod.TournamentMonitor })),
  { ssr: false }
);

interface Wager {
  id: number;
  creator_id: string;
  opponent_id: string | null;
  amount: number;
  status: "PENDING" | "ACTIVE" | "COMPLETED" | "DISPUTED" | "CANCELLED";
  winner_id: string | null;
  escrow_address: string | null;
  transaction_signature: string | null;
  deposit_signature: string | null; // Joiner's deposit
  creator_deposit_signature: string | null; // Creator's deposit
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
  const [activeMode, setActiveMode] = useState<"1v1" | "tournaments" | "stats">("1v1");
  const [wagers, setWagers] = useState<Wager[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimingWagerId, setClaimingWagerId] = useState<number | null>(null);
  const [selectedAmount, setSelectedAmount] = useState<number>(DEFAULT_WAGER_AMOUNT);
  const [creatingWager, setCreatingWager] = useState(false);
  const [joiningWagerId, setJoiningWagerId] = useState<number | null>(null);
  const [payingDepositWagerId, setPayingDepositWagerId] = useState<number | null>(null);
  const [playerTag, setPlayerTag] = useState<string>("");
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [userStats, setUserStats] = useState<{ 
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
  } | null>(null);
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
          tournamentPoints: stats.tournamentPoints,
          tournamentWins: stats.tournamentWins,
          tournamentLosses: stats.tournamentLosses,
          referralCode: stats.referralCode,
          referredBy: stats.referredBy,
          referralPoints: stats.referralPoints,
          totalReferrals: stats.totalReferrals,
          winStreak: stats.winStreak,
          bestWinStreak: stats.bestWinStreak,
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

  const handlePayCreatorDeposit = async (wagerId: number) => {
    if (!publicKey || !connected || !signTransaction) {
      alert("Please connect your wallet");
      return;
    }

    try {
      setPayingDepositWagerId(wagerId);
      
      // Get wager details
      const { data: wager, error: fetchError } = await supabase
        .from("wagers")
        .select("*")
        .eq("id", wagerId)
        .single();

      if (fetchError || !wager) throw new Error("Wager not found");
      if (wager.creator_id !== publicKey.toBase58()) throw new Error("Only the creator can pay this deposit");
      if (!wager.opponent_id) throw new Error("No opponent has joined yet");
      if (wager.status === "ACTIVE") throw new Error("Match is already active");

      // Send SOL from creator
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

      // Update wager with creator deposit and activate match
      await supabase
        .from("wagers")
        .update({
          creator_deposit_signature: signature, // Store creator's deposit separately
          status: "ACTIVE",
          activated_at: new Date().toISOString(),
        })
        .eq("id", wagerId);

      alert(`Deposit paid successfully! Match is now active. TX: ${signature}`);
      fetchWagers();
    } catch (error: any) {
      console.error("Error paying creator deposit:", error);
      alert(`Failed to pay deposit: ${error.message}`);
    } finally {
      setPayingDepositWagerId(null);
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

  // Auto-cancel wagers older than 1 hour
  useEffect(() => {
    const checkAndCancelOldWagers = async () => {
      if (!publicKey) return;

      try {
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
        
        // Find PENDING wagers older than 1 hour
        const { data: oldWagers, error } = await supabase
          .from("wagers")
          .select("*")
          .eq("status", "PENDING")
          .lt("created_at", oneHourAgo);

        if (error) {
          console.error("Error checking old wagers:", error);
          return;
        }

        // Auto-cancel old wagers
        if (oldWagers && oldWagers.length > 0) {
          for (const wager of oldWagers) {
            await supabase
              .from("wagers")
              .update({
                status: "CANCELLED",
                payout_status: "REFUNDED",
                updated_at: new Date().toISOString(),
              })
              .eq("id", wager.id);
          }
          
          // Refresh if any were cancelled
          if (oldWagers.some(w => w.creator_id === publicKey.toBase58() || w.opponent_id === publicKey.toBase58())) {
            fetchWagers();
          }
        }
      } catch (error) {
        console.error("Error in auto-cancel:", error);
      }
    };

    // Check every 5 minutes
    const interval = setInterval(checkAndCancelOldWagers, 5 * 60 * 1000);
    checkAndCancelOldWagers(); // Run immediately

    return () => clearInterval(interval);
  }, [publicKey]);

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
      
      // Create wager in database (no SOL payment yet - only when opponent joins)
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

      alert(`Wager created successfully! Waiting for an opponent to join. You'll pay ${selectedAmount} SOL when someone joins.`);
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

      // Send SOL from joiner (opponent) when joining
      const connection = new Connection(RPC_ENDPOINT, "confirmed");
      const adminPubkey = new PublicKey(ADMIN_WALLET_ADDRESS);
      const lamports = wager.amount * LAMPORTS_PER_SOL;

      // Send SOL from joiner
      const joinerTransaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: adminPubkey,
          lamports: lamports,
        })
      );

      const { blockhash: joinerBlockhash } = await connection.getLatestBlockhash();
      joinerTransaction.recentBlockhash = joinerBlockhash;
      joinerTransaction.feePayer = publicKey;

      const signedJoinerTx = await signTransaction(joinerTransaction);
      const joinerSignature = await connection.sendRawTransaction(signedJoinerTx.serialize());
      await connection.confirmTransaction(joinerSignature, "confirmed");

      // Update wager with opponent and joiner deposit signature
      // Status stays PENDING until creator also pays
      await supabase
        .from("wagers")
        .update({
          opponent_id: publicKey.toBase58(),
          deposit_signature: joinerSignature, // Store joiner's deposit
          // Status remains PENDING until creator pays
        })
        .eq("id", wagerId);

      alert(`Joined wager successfully! Your deposit: ${joinerSignature}\n\nThe creator will also need to deposit ${wager.amount} SOL to activate the match.`);
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
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Simple Header */}
      <div className="sticky top-0 z-50 glass border-b border-purple-500/20 backdrop-blur-xl bg-[#0a0a0f]/90">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link href="/" className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Home</span>
            </Link>
            <div className="flex items-center gap-3">
              <WalletMultiButton className="!bg-gradient-to-r !from-purple-600 !to-pink-600 hover:!from-purple-700 hover:!to-pink-700 !rounded-xl !px-6 !py-3 !font-semibold !text-base !transition-all !shadow-lg !shadow-purple-600/40 !border !border-purple-400/30" />
            </div>
          </div>
        </div>
      </div>

      <div className="py-12 px-4 sm:px-6 lg:px-8">
        {/* Under Construction Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto mb-8"
        >
          <div className="glass rounded-xl p-6 border border-yellow-500/30 bg-yellow-500/10">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-yellow-500/20 rounded-lg border border-yellow-500/30 flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-yellow-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-yellow-300 font-bold text-xl mb-2 font-display">1v1 Betting Arena - Under Construction</h2>
                <p className="text-yellow-200/90 text-base mb-3 font-body">
                  We're currently building an amazing 1v1 betting experience! The Arena is under construction and will be available soon.
                </p>
                <p className="text-yellow-200/80 text-sm font-body">
                  Stay tuned for updates on when you can start placing bets and challenging other players to 1v1 matches.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
        <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-purple-600/20 blur-3xl rounded-full"></div>
            <div className="relative flex items-center justify-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-game-gold/20 blur-xl rounded-full"></div>
                <Trophy className="relative w-12 h-12 md:w-16 md:h-16 text-game-gold drop-shadow-[0_0_20px_rgba(255,215,0,0.6)]" />
              </div>
              <h1 className="relative text-5xl sm:text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-pink-200 drop-shadow-lg">
                The Arena
              </h1>
            </div>
          </div>
          <p className="text-slate-300 text-lg md:text-xl mb-8 font-light max-w-2xl mx-auto leading-relaxed">
            Connect your wallet to compete in <span className="text-green-400 font-semibold">1v1 matches</span> and <span className="text-purple-400 font-semibold">tournaments</span>. 
            <br className="hidden md:block" />
            <span className="text-slate-400">Winner takes all • Points earned from both game modes</span>
          </p>

          {/* Game Mode Tabs */}
          {connected && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center justify-center gap-3 mb-10 flex-wrap"
            >
              <motion.button
                onClick={() => setActiveMode("1v1")}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className={`relative flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-base transition-all duration-300 ${
                  activeMode === "1v1"
                    ? "bg-gradient-to-r from-green-600 via-emerald-500 to-green-600 text-white shadow-2xl shadow-green-600/50 border-2 border-green-400/50"
                    : "bg-slate-800/50 backdrop-blur-sm text-slate-400 hover:text-white hover:bg-slate-800/70 border-2 border-slate-700/50"
                }`}
              >
                {activeMode === "1v1" && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-2xl"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <Swords className={`relative w-5 h-5 ${activeMode === "1v1" ? "text-white" : "text-slate-500"}`} />
                <span className="relative">1v1 Matches</span>
              </motion.button>
              <motion.button
                onClick={() => setActiveMode("tournaments")}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className={`relative flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-base transition-all duration-300 ${
                  activeMode === "tournaments"
                    ? "bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 text-white shadow-2xl shadow-purple-600/50 border-2 border-purple-400/50"
                    : "bg-slate-800/50 backdrop-blur-sm text-slate-400 hover:text-white hover:bg-slate-800/70 border-2 border-slate-700/50"
                }`}
              >
                {activeMode === "tournaments" && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-2xl"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <TrophyIcon className={`relative w-5 h-5 ${activeMode === "tournaments" ? "text-white" : "text-slate-500"}`} />
                <span className="relative">Tournaments</span>
              </motion.button>
              <motion.button
                onClick={() => setActiveMode("stats")}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className={`relative flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-base transition-all duration-300 ${
                  activeMode === "stats"
                    ? "bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 text-white shadow-2xl shadow-blue-600/50 border-2 border-blue-400/50"
                    : "bg-slate-800/50 backdrop-blur-sm text-slate-400 hover:text-white hover:bg-slate-800/70 border-2 border-slate-700/50"
                }`}
              >
                {activeMode === "stats" && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-2xl"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <TrendingUp className={`relative w-5 h-5 ${activeMode === "stats" ? "text-white" : "text-slate-500"}`} />
                <span className="relative">Stats</span>
              </motion.button>
            </motion.div>
          )}
        </motion.div>

        {!connected && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative overflow-hidden bg-gradient-to-br from-slate-900/90 via-purple-900/20 to-slate-900/90 backdrop-blur-xl rounded-3xl p-12 text-center mb-8 max-w-2xl mx-auto border border-purple-500/20 shadow-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-transparent to-pink-600/10"></div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"></div>
            <div className="relative z-10">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                className="inline-block mb-6"
              >
                <Trophy className="w-20 h-20 text-game-gold drop-shadow-[0_0_30px_rgba(255,215,0,0.8)]" />
              </motion.div>
              <h2 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-pink-200 mb-4">
                Connect Your Wallet
              </h2>
              <p className="text-slate-300 text-lg mb-8 leading-relaxed">
                Join the arena to compete in <span className="text-green-400 font-semibold">1v1 matches</span> and <span className="text-purple-400 font-semibold">tournaments</span>.
                <br />
                <span className="text-slate-400">Place bets, play matches, and earn points to climb the leaderboard.</span>
              </p>
              <div className="flex justify-center">
                <WalletMultiButton className="!bg-gradient-to-r !from-purple-600 !via-pink-600 !to-purple-600 hover:!from-purple-700 hover:!via-pink-700 hover:!to-purple-700 !rounded-2xl !px-10 !py-4 !font-bold !text-lg !transition-all !shadow-2xl !shadow-purple-600/50 !border-2 !border-purple-400/50 !backdrop-blur-sm" />
              </div>
            </div>
          </motion.div>
        )}


        {/* 1v1 Section */}
        {connected && activeMode === "1v1" && (
          <>
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
                          onPayDeposit={() => handlePayCreatorDeposit(wager.id)}
                          claiming={claimingWagerId === wager.id}
                          payingDeposit={payingDepositWagerId === wager.id}
                          myWallet={publicKey?.toBase58() || ""}
                          onRefresh={fetchWagers}
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
                          onPayDeposit={() => handlePayCreatorDeposit(wager.id)}
                          claiming={claimingWagerId === wager.id}
                          payingDeposit={payingDepositWagerId === wager.id}
                          myWallet={publicKey?.toBase58() || ""}
                          onRefresh={fetchWagers}
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
                          onPayDeposit={() => handlePayCreatorDeposit(wager.id)}
                          claiming={claimingWagerId === wager.id}
                          payingDeposit={payingDepositWagerId === wager.id}
                          myWallet={publicKey?.toBase58() || ""}
                          onRefresh={fetchWagers}
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
                          onPayDeposit={() => handlePayCreatorDeposit(wager.id)}
                          claiming={claimingWagerId === wager.id}
                          payingDeposit={payingDepositWagerId === wager.id}
                          myWallet={publicKey?.toBase58() || ""}
                          onRefresh={fetchWagers}
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
              {wagers.filter(w => w.status === "PENDING" && !w.opponent_id && w.creator_id !== publicKey?.toBase58()).length === 0 ? (
                <div className="glass rounded-xl p-8 text-center">
                  <p className="text-slate-400">No available wagers to join</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {wagers
                    .filter(w => w.status === "PENDING" && !w.opponent_id && w.creator_id !== publicKey?.toBase58())
                    .map((wager) => (
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
                        onRefresh={fetchWagers}
                      />
                    ))}
                </div>
              )}
              </motion.div>
            </>
          )}
          </>
        )}

        {/* Tournaments Section */}
        {connected && activeMode === "tournaments" && (
          <div className="mt-8">
            <TournamentMonitor />
          </div>
        )}

        {/* Stats Section */}
        {connected && activeMode === "stats" && userStats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-600/20 rounded-xl border border-blue-500/30">
                <TrendingUp className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Your Stats</h2>
                <p className="text-slate-400 text-sm">Track your performance and referrals</p>
              </div>
            </div>
            <ArenaStats userStats={userStats} onStatsUpdate={fetchUserStats} />
          </motion.div>
        )}
        </div>
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
  onPayDeposit,
  claiming,
  joining,
  payingDeposit,
  myWallet,
  onRefresh,
}: {
  wager: Wager;
  isMyWager: boolean;
  onClaim: () => void;
  onVerify: () => void;
  onCancel: () => void;
  onJoin?: () => void;
  onPayDeposit?: () => void;
  claiming: boolean;
  joining?: boolean;
  payingDeposit?: boolean;
  myWallet: string;
  onRefresh: () => void;
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

            {/* Transaction Links - Show both deposits separately */}
            <div className="space-y-1 mt-2">
              {wager.creator_deposit_signature && (
                <div className="text-xs text-slate-500">
                  Creator Deposit:{" "}
                  <a
                    href={getSolscanUrl(wager.creator_deposit_signature)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 underline"
                  >
                    {wager.creator_deposit_signature.slice(0, 16)}...
                  </a>
                </div>
              )}
              {wager.deposit_signature && (
                <div className="text-xs text-slate-500">
                  Opponent Deposit:{" "}
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
            </div>

            {/* Play Instructions for ACTIVE wagers - Always show when matched */}
            {wager.status === "ACTIVE" && (isCreator || isOpponent) && (
              <PlayInstructionsSection 
                wager={wager} 
                isCreator={isCreator}
                onTournamentDetailsSaved={onRefresh}
              />
            )}
            {/* Show setup instructions for creator when matched but not active */}
            {wager.status === "PENDING" && wager.opponent_id && isCreator && (
              <div className="mt-4 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                <p className="text-purple-300 text-xs mb-2">
                  💡 Once both payments are complete, you'll be able to set up tournament details here.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:items-end">
          {wager.status === "PENDING" && !wager.opponent_id && !isCreator && onJoin && (
            <motion.button
              onClick={onJoin}
              disabled={joining}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-semibold transition-all text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-green-600/30"
            >
              {joining ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Joining & Paying...
                </>
              ) : (
                <>
                  <Users className="w-5 h-5" />
                  <span>Join & Pay {wager.amount} SOL</span>
                </>
              )}
            </motion.button>
          )}
          {wager.status === "PENDING" && wager.opponent_id && isCreator && onPayDeposit && !wager.creator_deposit_signature && (
            <div className="flex flex-col gap-2">
              <motion.button
                onClick={onPayDeposit}
                disabled={payingDeposit}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg font-semibold transition-all text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-blue-600/30"
              >
                {payingDeposit ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <Coins className="w-5 h-5" />
                    <span>Pay Deposit ({wager.amount} SOL)</span>
                  </>
                )}
              </motion.button>
              <a
                href={generateSolanaPayLink(wager.amount, `wager-${wager.id}-creator`)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-400 hover:text-blue-300 underline text-center"
                onClick={(e) => {
                  // Open wallet app directly
                  window.open(generateSolanaPayLink(wager.amount, `wager-${wager.id}-creator`), '_blank');
                }}
              >
                Or use Solana Pay link
              </a>
            </div>
          )}
          {wager.status === "PENDING" && wager.opponent_id && isCreator && wager.creator_deposit_signature && (
            <div className="px-4 py-2 bg-green-500/20 border border-green-500/30 text-green-300 rounded-lg text-sm flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Deposit Paid - Waiting for activation
            </div>
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


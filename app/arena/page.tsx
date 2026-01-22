"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useWallet } from "@solana/wallet-adapter-react";
import { supabase } from "@/lib/supabase";
import { Trophy, Users, Clock, CheckCircle, XCircle, Loader2, Coins, X, AlertCircle, TestTube } from "lucide-react";
import { useCreateWager, useJoinWager } from "@/lib/solana/wagerEscrowClient";
import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { RPC_ENDPOINT, getAvailableWagerAmounts, DEFAULT_WAGER_AMOUNT, STUCK_MATCH_TIMEOUT } from "@/lib/constants";

interface Wager {
  id: number;
  creator_id: string;
  opponent_id: string | null;
  amount: number;
  status: "PENDING" | "ACTIVE" | "COMPLETED" | "DISPUTED" | "CANCELLED";
  winner_id: string | null;
  escrow_address: string | null;
  transaction_signature: string | null;
  created_at: string;
  activated_at: string | null;
  completed_at: string | null;
}

export default function ArenaPage() {
  const { publicKey, connected } = useWallet();
  const [wagers, setWagers] = useState<Wager[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimingWagerId, setClaimingWagerId] = useState<number | null>(null);
  const [selectedAmount, setSelectedAmount] = useState<number>(DEFAULT_WAGER_AMOUNT);
  const [creatingWager, setCreatingWager] = useState(false);
  const { create } = useCreateWager();
  const { join } = useJoinWager();
  
  // Get available wager amounts based on environment
  const availableAmounts = getAvailableWagerAmounts();
  const isDevnet = !process.env.NEXT_PUBLIC_SOLANA_NETWORK || process.env.NEXT_PUBLIC_SOLANA_NETWORK === "devnet";
  
  // Set default amount
  useEffect(() => {
    if (availableAmounts.length > 0) {
      setSelectedAmount(availableAmounts[0]);
    }
  }, [availableAmounts]);

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
    if (!confirm("Are you sure you want to cancel this wager? This will refund both players.")) {
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke("cancel-wager", {
        body: { wager_id: wagerId },
      });

      if (error) throw error;

      if (data.success) {
        alert("Wager cancelled successfully. Refunds will be processed.");
        fetchWagers(); // Refresh
      }
    } catch (error: any) {
      console.error("Error cancelling wager:", error);
      alert(`Failed to cancel wager: ${error.message}`);
    }
  };

  const handleCreateWager = async () => {
    if (!publicKey || !connected) {
      alert("Please connect your wallet");
      return;
    }

    try {
      setCreatingWager(true);
      
      // Create wager in database first
      const { data: wagerData, error: dbError } = await supabase
        .from("wagers")
        .insert({
          creator_id: publicKey.toBase58(),
          amount: selectedAmount,
          status: "PENDING",
        })
        .select()
        .single();

      if (dbError) throw dbError;

      // Create wager on-chain
      const tx = await create(wagerData.id, selectedAmount);
      
      if (tx) {
        // Update database with transaction signature
        await supabase
          .from("wagers")
          .update({ transaction_signature: tx })
          .eq("id", wagerData.id);

        alert(`Wager created successfully! TX: ${tx}`);
        fetchWagers();
      }
    } catch (error: any) {
      console.error("Error creating wager:", error);
      alert(`Failed to create wager: ${error.message}`);
    } finally {
      setCreatingWager(false);
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
              Arena
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
            1v1 Clash Royale Wagering System
            {isDevnet && (
              <span className="ml-2 text-yellow-400 text-sm">(Test Mode - Not Real SOL)</span>
            )}
          </p>
        </motion.div>

        {!connected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass rounded-xl p-6 text-center mb-8"
          >
            <p className="text-slate-300 mb-4">
              Connect your wallet to view and create wagers
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
            <h2 className="text-xl font-bold text-white mb-4">Create New Wager</h2>
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
                    ? "Devnet: 0.001 SOL (Test Mode - Not Real SOL)"
                    : "Production: 0.25 SOL increments"}
                </p>
              </div>
              <button
                onClick={handleCreateWager}
                disabled={creatingWager}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {creatingWager ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Coins className="w-4 h-4" />
                    Create Wager
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          </div>
        ) : (
          <>
            {/* My Wagers Section */}
            {connected && myWagers.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
              >
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <Users className="w-6 h-6" />
                  My Wagers ({myWagers.length})
                </h2>
                <div className="grid gap-4">
                  {myWagers.map((wager) => (
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

            {/* All Wagers Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h2 className="text-2xl font-bold text-white mb-4">
                All Wagers ({wagers.length})
              </h2>
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
                      claiming={claimingWagerId === wager.id}
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
  claiming,
  myWallet,
}: {
  wager: Wager;
  isMyWager: boolean;
  onClaim: () => void;
  onVerify: () => void;
  onCancel: () => void;
  claiming: boolean;
  myWallet: string;
}) {
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

            <div className="text-sm text-slate-400">
              <div>
                Creator:{" "}
                <span className="text-white font-mono text-xs">
                  {wager.creator_id.slice(0, 8)}...{wager.creator_id.slice(-8)}
                </span>
                {isCreator && (
                  <span className="ml-2 text-purple-400">(You)</span>
                )}
              </div>
              {wager.opponent_id && (
                <div>
                  Opponent:{" "}
                  <span className="text-white font-mono text-xs">
                    {wager.opponent_id.slice(0, 8)}...
                    {wager.opponent_id.slice(-8)}
                  </span>
                  {isOpponent && (
                    <span className="ml-2 text-purple-400">(You)</span>
                  )}
                </div>
              )}
              {wager.winner_id && (
                <div className="text-game-gold">
                  Winner:{" "}
                  <span className="font-mono text-xs">
                    {wager.winner_id.slice(0, 8)}...
                    {wager.winner_id.slice(-8)}
                  </span>
                  {isWinner && (
                    <span className="ml-2 text-green-400">(You won!)</span>
                  )}
                </div>
              )}
            </div>

            {wager.transaction_signature && (
              <div className="text-xs text-slate-500">
                TX:{" "}
                <a
                  href={`https://solscan.io/tx/${wager.transaction_signature}?cluster=devnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-purple-300 underline"
                >
                  {wager.transaction_signature.slice(0, 16)}...
                </a>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:items-end">
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


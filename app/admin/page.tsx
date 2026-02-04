"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Connection, PublicKey, SystemProgram, Transaction, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { RPC_ENDPOINT } from "@/lib/constants";
import { 
  Trophy, CheckCircle, XCircle, Clock, AlertCircle, 
  DollarSign, Search, Filter, RefreshCw, Eye, 
  Loader2, Copy, Wallet, ExternalLink, Send
} from "lucide-react";
import { getUserProfile } from "@/lib/wagers";

interface Wager {
  id: number;
  creator_id: string;
  opponent_id: string | null;
  amount: number;
  status: "PENDING" | "ACTIVE" | "COMPLETED" | "DISPUTED" | "CANCELLED";
  winner_id: string | null;
  verification_status: "PENDING" | "VERIFIED" | "NEEDS_REVIEW" | "DISPUTED";
  payout_status: "PENDING" | "PAID" | "REFUNDED";
  deposit_signature: string | null;
  payout_signature: string | null;
  match_result: any;
  notes: string | null;
  created_at: string;
  activated_at: string | null;
  completed_at: string | null;
  verified_at: string | null;
  paid_at: string | null;
  updated_at: string | null;
}

interface UserProfile {
  wallet_address: string;
  cr_tag: string | null;
}

export default function AdminDashboard() {
  const wallet = useWallet();
  const { publicKey, connected, signTransaction, sendTransaction } = wallet;
  const [wagers, setWagers] = useState<Wager[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "needs_review" | "verified" | "paid">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedWager, setSelectedWager] = useState<Wager | null>(null);
  const [verifying, setVerifying] = useState<number | null>(null);
  const [userProfiles, setUserProfiles] = useState<Record<string, UserProfile>>({});
  const [sendingPayment, setSendingPayment] = useState<number | null>(null);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);

  useEffect(() => {
    fetchWagers();
    
    // Subscribe to Realtime updates
    const channel = supabase
      .channel("admin-wagers-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "wagers",
        },
        () => {
          fetchWagers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Fetch wallet balance when connected
  useEffect(() => {
    if (connected && publicKey) {
      fetchWalletBalance();
    } else {
      setWalletBalance(null);
    }
  }, [connected, publicKey]);

  const fetchWalletBalance = async () => {
    if (!publicKey) return;
    try {
      const connection = new Connection(RPC_ENDPOINT, "confirmed");
      const balance = await connection.getBalance(publicKey);
      setWalletBalance(balance / LAMPORTS_PER_SOL);
    } catch (error) {
      console.error("Error fetching wallet balance:", error);
    }
  };

  // Fetch user profiles for winners
  useEffect(() => {
    const fetchProfiles = async () => {
      const profiles: Record<string, UserProfile> = {};
      const uniqueWallets = new Set<string>();
      
      wagers.forEach(wager => {
        if (wager.winner_id) uniqueWallets.add(wager.winner_id);
        if (wager.creator_id) uniqueWallets.add(wager.creator_id);
        if (wager.opponent_id) uniqueWallets.add(wager.opponent_id);
      });

      for (const wallet of uniqueWallets) {
        try {
          const { data } = await getUserProfile(wallet);
          if (data) {
            profiles[wallet] = data;
          }
        } catch (error) {
          console.error(`Error fetching profile for ${wallet}:`, error);
        }
      }

      setUserProfiles(profiles);
    };

    if (wagers.length > 0) {
      fetchProfiles();
    }
  }, [wagers]);

  const fetchWagers = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from("wagers")
        .select("*")
        .order("created_at", { ascending: false });

      if (filter === "pending") {
        query = query.eq("verification_status", "PENDING");
      } else if (filter === "needs_review") {
        query = query.eq("verification_status", "NEEDS_REVIEW");
      } else if (filter === "verified") {
        query = query.eq("verification_status", "VERIFIED");
      } else if (filter === "paid") {
        query = query.eq("payout_status", "PAID");
      }

      const { data, error } = await query;
      if (error) throw error;
      setWagers(data || []);
    } catch (error) {
      console.error("Error fetching wagers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyMatch = async (wagerId: number) => {
    try {
      setVerifying(wagerId);
      const { data, error } = await supabase.functions.invoke("verify-match", {
        body: { wager_id: wagerId },
      });

      if (error) throw error;

      if (data.success) {
        alert("Match verified successfully!");
        fetchWagers();
      } else {
        alert(`Verification failed: ${data.error || "Unknown error"}`);
      }
    } catch (error: any) {
      console.error("Error verifying match:", error);
      alert(`Failed to verify match: ${error.message}`);
    } finally {
      setVerifying(null);
    }
  };

  const handleMarkVerified = async (wagerId: number) => {
    try {
      const { error } = await supabase
        .from("wagers")
        .update({
          verification_status: "VERIFIED",
          verified_at: new Date().toISOString(),
        })
        .eq("id", wagerId);

      if (error) throw error;
      fetchWagers();
    } catch (error: any) {
      alert(`Failed to mark as verified: ${error.message}`);
    }
  };

  const handleMarkPaid = async (wagerId: number, payoutSignature: string) => {
    try {
      const { error } = await supabase
        .from("wagers")
        .update({
          payout_status: "PAID",
          payout_signature: payoutSignature,
          paid_at: new Date().toISOString(),
        })
        .eq("id", wagerId);

      if (error) throw error;
      alert("Marked as paid!");
      fetchWagers();
    } catch (error: any) {
      alert(`Failed to mark as paid: ${error.message}`);
    }
  };

  const handleCancelWager = async (wagerId: number) => {
    if (!confirm("Are you sure you want to cancel this wager? Both players will need to be refunded.")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("wagers")
        .update({
          status: "CANCELLED",
          payout_status: "REFUNDED", // Mark as needing refund
          updated_at: new Date().toISOString(),
        })
        .eq("id", wagerId);

      if (error) throw error;
      alert("Wager cancelled. Refunds need to be processed.");
      fetchWagers();
    } catch (error: any) {
      alert(`Failed to cancel wager: ${error.message}`);
    }
  };

  const handleMarkRefunded = async (wagerId: number, refundSignature: string) => {
    try {
      const { error } = await supabase
        .from("wagers")
        .update({
          payout_status: "PAID", // Change from REFUNDED to PAID after refund is sent
          payout_signature: refundSignature,
          paid_at: new Date().toISOString(),
        })
        .eq("id", wagerId);

      if (error) throw error;
      alert("Marked as refunded!");
      fetchWagers();
      fetchWalletBalance(); // Refresh balance
    } catch (error: any) {
      alert(`Failed to mark as refunded: ${error.message}`);
    }
  };

  const handleSendPayment = async (recipientAddress: string, amount: number, wagerId: number, isRefund: boolean = false) => {
    if (!publicKey || !connected || !signTransaction) {
      alert("Please connect your wallet first");
      return;
    }

    try {
      setSendingPayment(wagerId);
      const connection = new Connection(RPC_ENDPOINT, "confirmed");
      const recipientPubkey = new PublicKey(recipientAddress);
      const lamports = amount * LAMPORTS_PER_SOL;

      // Check balance
      const balance = await connection.getBalance(publicKey);
      if (balance < lamports) {
        alert(`Insufficient balance. You have ${(balance / LAMPORTS_PER_SOL).toFixed(4)} SOL but need ${amount} SOL`);
        setSendingPayment(null);
        return;
      }

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: recipientPubkey,
          lamports: lamports,
        })
      );

      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      const signedTx = await signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signedTx.serialize());
      await connection.confirmTransaction(signature, "confirmed");

      // Update database
      if (isRefund) {
        // For refunds, don't auto-mark as refunded - admin needs to mark manually after both payments
        alert(`Refund sent successfully!\n\nTX: ${signature}\n\nRemember to send refund to the other player and then mark as refunded.`);
      } else {
        // For payouts, automatically mark as paid
        await handleMarkPaid(wagerId, signature);
        alert(`Payment sent successfully! TX: ${signature}`);
      }

      fetchWalletBalance(); // Refresh balance
    } catch (error: any) {
      console.error("Error sending payment:", error);
      alert(`Failed to send payment: ${error.message}`);
    } finally {
      setSendingPayment(null);
    }
  };

  const filteredWagers = wagers.filter((wager) => {
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        wager.creator_id.toLowerCase().includes(search) ||
        wager.opponent_id?.toLowerCase().includes(search) ||
        wager.id.toString().includes(search)
      );
    }
    return true;
  });

  const stats = {
    total: wagers.length,
    pending: wagers.filter((w) => w.verification_status === "PENDING").length,
    needsReview: wagers.filter((w) => w.verification_status === "NEEDS_REVIEW").length,
    verified: wagers.filter((w) => w.verification_status === "VERIFIED").length,
    paid: wagers.filter((w) => w.payout_status === "PAID").length,
    totalAmount: wagers.reduce((sum, w) => sum + w.amount, 0),
  };

  // Get pending payouts (verified but not paid)
  const pendingPayouts = wagers.filter(
    (w) => w.verification_status === "VERIFIED" && w.payout_status === "PENDING" && w.winner_id
  );
  
  // Get pending refunds (cancelled wagers that need refunds)
  const pendingRefunds = wagers.filter(
    (w) => w.status === "CANCELLED" && w.payout_status === "REFUNDED"
  );
  
  // Calculate payout amount: (total wagered - 5% fee)
  const calculatePayoutAmount = (wagerAmount: number) => {
    const totalWagered = wagerAmount * 2; // Both players deposited
    const fee = totalWagered * 0.05; // 5% fee
    return totalWagered - fee;
  };
  
  const totalPayoutAmount = pendingPayouts.reduce((sum, w) => sum + calculatePayoutAmount(w.amount), 0);
  const totalRefundAmount = pendingRefunds.reduce((sum, w) => sum + (w.amount * 2), 0); // Full refund for both players

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                Admin Dashboard
              </h1>
              <p className="text-purple-300">Manage games, verify matches, and process payouts</p>
            </div>
            <div className="text-right flex flex-col items-end gap-2">
              <WalletMultiButton className="!bg-purple-600 hover:!bg-purple-700 !rounded-lg" />
              {connected && publicKey ? (
                <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-3 min-w-[200px]">
                  <div className="text-green-300 text-xs mb-1">Wallet Connected</div>
                  <div className="text-white font-mono text-sm">
                    {publicKey.toBase58().slice(0, 8)}...{publicKey.toBase58().slice(-8)}
                  </div>
                  {walletBalance !== null && (
                    <div className="text-green-200 text-xs mt-1">
                      Balance: {walletBalance.toFixed(4)} SOL
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-3 min-w-[200px]">
                  <div className="text-yellow-300 text-xs">Connect wallet above to send payments directly</div>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Refund Queue - Prominent Section */}
        {pendingRefunds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 bg-gradient-to-r from-red-500/20 to-orange-500/20 border-2 border-red-500/50 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
                  <XCircle className="w-6 h-6 text-red-400" />
                  Refund Queue
                </h2>
                <p className="text-red-200">
                  {pendingRefunds.length} cancelled wager{pendingRefunds.length !== 1 ? 's' : ''} need refunds
                </p>
              </div>
              <div className="text-right">
                <div className="text-red-200 text-sm">Total to Refund</div>
                <div className="text-3xl font-bold text-white">{totalRefundAmount.toFixed(4)} SOL</div>
                <div className="text-red-300 text-xs mt-1">
                  ({pendingRefunds.length} wagers × 2 players)
                </div>
              </div>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {pendingRefunds.map((wager) => {
                const creatorProfile = wager.creator_id ? userProfiles[wager.creator_id] : null;
                const opponentProfile = wager.opponent_id ? userProfiles[wager.opponent_id] : null;
                const refundPerPlayer = wager.amount; // Each player gets their wager back
                
                return (
                  <div
                    key={wager.id}
                    className="bg-slate-900/80 rounded-lg p-4 border border-red-500/30"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <span className="text-white font-bold">Game #{wager.id}</span>
                          <span className="text-red-400 font-semibold text-lg">{refundPerPlayer} SOL per player</span>
                          <span className="text-xs text-slate-400">
                            ({wager.amount * 2} SOL total to refund)
                          </span>
                        </div>
                        <div className="space-y-1">
                          <div className="text-sm">
                            <span className="text-purple-300">Creator: </span>
                            {creatorProfile?.cr_tag ? (
                              <span className="text-white font-semibold">{creatorProfile.cr_tag}</span>
                            ) : null}
                            <span className="text-white font-mono text-xs ml-2">
                              {wager.creator_id}
                            </span>
                            <button
                              onClick={() => copyToClipboard(wager.creator_id)}
                              className="ml-2 text-red-400 hover:text-red-300 transition-colors"
                              title="Copy wallet address"
                            >
                              <Copy size={14} />
                            </button>
                            {connected ? (
                              <button
                                onClick={() => handleSendPayment(wager.creator_id, refundPerPlayer, wager.id, true)}
                                disabled={sendingPayment === wager.id}
                                className="ml-2 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs disabled:opacity-50"
                              >
                                {sendingPayment === wager.id ? "Sending..." : "Send Refund"}
                              </button>
                            ) : (
                              <a
                                href={`https://solana.com/pay?recipient=${wager.creator_id}&amount=${refundPerPlayer}&label=Game%20%23${wager.id}%20Refund&memo=Wager%20${wager.id}%20Refund`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ml-2 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs"
                              >
                                Pay Creator
                              </a>
                            )}
                          </div>
                          {wager.opponent_id && (
                            <div className="text-sm">
                              <span className="text-purple-300">Opponent: </span>
                              {opponentProfile?.cr_tag ? (
                                <span className="text-white font-semibold">{opponentProfile.cr_tag}</span>
                              ) : null}
                              <span className="text-white font-mono text-xs ml-2">
                                {wager.opponent_id}
                              </span>
                              <button
                                onClick={() => copyToClipboard(wager.opponent_id!)}
                                className="ml-2 text-red-400 hover:text-red-300 transition-colors"
                                title="Copy wallet address"
                              >
                                <Copy size={14} />
                              </button>
                              {connected ? (
                                <button
                                  onClick={() => {
                                    if (wager.opponent_id) {
                                      handleSendPayment(wager.opponent_id, refundPerPlayer, wager.id, true);
                                    } else {
                                      alert("Opponent ID is missing");
                                    }
                                  }}
                                  disabled={sendingPayment === wager.id || !wager.opponent_id}
                                  className="ml-2 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs disabled:opacity-50"
                                >
                                  {sendingPayment === wager.id ? "Sending..." : "Send Refund"}
                                </button>
                              ) : (
                                <a
                                  href={`https://solana.com/pay?recipient=${wager.opponent_id}&amount=${refundPerPlayer}&label=Game%20%23${wager.id}%20Refund&memo=Wager%20${wager.id}%20Refund`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="ml-2 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs"
                                >
                                  Pay Opponent
                                </a>
                              )}
                            </div>
                          )}
                          <div className="text-xs text-slate-400">
                            Cancelled: {wager.updated_at ? new Date(wager.updated_at).toLocaleString() : 'N/A'}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => {
                            const sig = prompt(`Enter refund transaction signature for Game #${wager.id}:\n\nBoth players refunded: ${wager.amount} SOL each`);
                            if (sig) handleMarkRefunded(wager.id, sig);
                          }}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all flex items-center gap-2"
                        >
                          <CheckCircle size={18} />
                          Mark Refunded
                        </button>
                        <button
                          onClick={() => setSelectedWager(wager)}
                          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-all flex items-center gap-2"
                        >
                          <Eye size={18} />
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Payout Queue - Prominent Section */}
        {pendingPayouts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-2 border-yellow-500/50 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
                  <DollarSign className="w-6 h-6 text-yellow-400" />
                  Payout Queue
                </h2>
                <p className="text-yellow-200">
                  {pendingPayouts.length} verified game{pendingPayouts.length !== 1 ? 's' : ''} ready for payout
                </p>
              </div>
              <div className="text-right">
                <div className="text-yellow-200 text-sm">Total to Pay (after 5% fee)</div>
                <div className="text-3xl font-bold text-white">{totalPayoutAmount.toFixed(4)} SOL</div>
                <div className="text-yellow-300 text-xs mt-1">
                  {pendingPayouts.reduce((sum, w) => sum + (w.amount * 2), 0).toFixed(4)} SOL wagered - {pendingPayouts.reduce((sum, w) => sum + (w.amount * 2 * 0.05), 0).toFixed(4)} SOL fee
                </div>
              </div>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {pendingPayouts.map((wager) => {
                const winnerProfile = wager.winner_id ? userProfiles[wager.winner_id] : null;
                const totalWagered = wager.amount * 2; // Both players deposited
                const fee = totalWagered * 0.05; // 5% fee
                const payoutAmount = totalWagered - fee; // Winner gets total - 5%
                
                // Create Solana Pay link
                const solanaPayLink = `https://solana.com/pay?recipient=${wager.winner_id}&amount=${payoutAmount}&label=Game%20%23${wager.id}%20Payout&memo=Wager%20${wager.id}`;
                
                return (
                  <div
                    key={wager.id}
                    className="bg-slate-900/80 rounded-lg p-4 border border-yellow-500/30"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <span className="text-white font-bold">Game #{wager.id}</span>
                          <span className="text-yellow-400 font-semibold text-lg">{payoutAmount.toFixed(4)} SOL</span>
                          <span className="text-xs text-slate-400">
                            ({totalWagered.toFixed(4)} SOL total - {fee.toFixed(4)} SOL fee)
                          </span>
                        </div>
                        <div className="space-y-1">
                          <div className="text-sm">
                            <span className="text-purple-300">Winner: </span>
                            {winnerProfile?.cr_tag ? (
                              <span className="text-white font-semibold">{winnerProfile.cr_tag}</span>
                            ) : null}
                            <span className="text-white font-mono text-xs ml-2">
                              {wager.winner_id}
                            </span>
                            <button
                              onClick={() => copyToClipboard(wager.winner_id!)}
                              className="ml-2 text-yellow-400 hover:text-yellow-300 transition-colors"
                              title="Copy wallet address"
                            >
                              <Copy size={14} />
                            </button>
                          </div>
                          <div className="text-xs text-slate-400">
                            Verified: {wager.verified_at ? new Date(wager.verified_at).toLocaleString() : 'N/A'}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        {connected ? (
                          <button
                            onClick={() => handleSendPayment(wager.winner_id!, payoutAmount, wager.id, false)}
                            disabled={sendingPayment === wager.id}
                            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-semibold transition-all flex items-center gap-2 text-center justify-center disabled:opacity-50"
                          >
                            {sendingPayment === wager.id ? (
                              <>
                                <Loader2 size={18} className="animate-spin" />
                                Sending...
                              </>
                            ) : (
                              <>
                                <Send size={18} />
                                Send {payoutAmount.toFixed(4)} SOL
                              </>
                            )}
                          </button>
                        ) : (
                          <a
                            href={solanaPayLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all flex items-center gap-2 text-center justify-center"
                          >
                            <Wallet size={18} />
                            Pay {payoutAmount.toFixed(4)} SOL
                          </a>
                        )}
                        <button
                          onClick={() => {
                            const sig = prompt(`Enter payout transaction signature for Game #${wager.id}:\n\nWinner: ${wager.winner_id}\nAmount: ${payoutAmount.toFixed(4)} SOL`);
                            if (sig) handleMarkPaid(wager.id, sig);
                          }}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all flex items-center gap-2"
                        >
                          <CheckCircle size={18} />
                          Mark Paid
                        </button>
                        <button
                          onClick={() => setSelectedWager(wager)}
                          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-all flex items-center gap-2"
                        >
                          <Eye size={18} />
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-purple-500/30"
          >
            <div className="text-purple-300 text-sm">Total Games</div>
            <div className="text-2xl font-bold text-white">{stats.total}</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-yellow-500/30"
          >
            <div className="text-yellow-300 text-sm">Pending Review</div>
            <div className="text-2xl font-bold text-white">{stats.pending}</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-orange-500/30"
          >
            <div className="text-orange-300 text-sm">Needs Review</div>
            <div className="text-2xl font-bold text-white">{stats.needsReview}</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-green-500/30"
          >
            <div className="text-green-300 text-sm">Total Amount</div>
            <div className="text-2xl font-bold text-white">{stats.totalAmount.toFixed(2)} SOL</div>
          </motion.div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-300" size={20} />
            <input
              type="text"
              placeholder="Search by wallet or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/10 backdrop-blur-md rounded-lg border border-purple-500/30 text-white placeholder-purple-300 focus:outline-none focus:border-purple-500"
            />
          </div>
          <div className="flex gap-2">
            {(["all", "pending", "needs_review", "verified", "paid"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filter === f
                    ? "bg-purple-600 text-white"
                    : "bg-white/10 text-purple-300 hover:bg-white/20"
                }`}
              >
                {f.replace("_", " ").toUpperCase()}
              </button>
            ))}
          </div>
          <button
            onClick={fetchWagers}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all flex items-center gap-2"
          >
            <RefreshCw size={18} />
            Refresh
          </button>
        </div>

        {/* Wagers Table */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="animate-spin text-purple-500" size={48} />
          </div>
        ) : (
          <div className="bg-white/10 backdrop-blur-md rounded-lg border border-purple-500/30 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-purple-900/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-purple-300 font-medium">ID</th>
                    <th className="px-4 py-3 text-left text-purple-300 font-medium">Creator</th>
                    <th className="px-4 py-3 text-left text-purple-300 font-medium">Opponent</th>
                    <th className="px-4 py-3 text-left text-purple-300 font-medium">Amount</th>
                    <th className="px-4 py-3 text-left text-purple-300 font-medium">Status</th>
                    <th className="px-4 py-3 text-left text-purple-300 font-medium">Verification</th>
                    <th className="px-4 py-3 text-left text-purple-300 font-medium">Payout</th>
                    <th className="px-4 py-3 text-left text-purple-300 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredWagers.map((wager) => (
                    <tr
                      key={wager.id}
                      className="border-t border-purple-500/20 hover:bg-white/5 transition-colors"
                    >
                      <td className="px-4 py-3 text-white">#{wager.id}</td>
                      <td className="px-4 py-3 text-white font-mono text-sm">
                        {wager.creator_id.slice(0, 8)}...
                      </td>
                      <td className="px-4 py-3 text-white font-mono text-sm">
                        {wager.opponent_id ? `${wager.opponent_id.slice(0, 8)}...` : "-"}
                      </td>
                      <td className="px-4 py-3 text-white font-semibold">{wager.amount} SOL</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            wager.status === "COMPLETED"
                              ? "bg-green-500/20 text-green-300"
                              : wager.status === "ACTIVE"
                              ? "bg-blue-500/20 text-blue-300"
                              : "bg-yellow-500/20 text-yellow-300"
                          }`}
                        >
                          {wager.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            wager.verification_status === "VERIFIED"
                              ? "bg-green-500/20 text-green-300"
                              : wager.verification_status === "NEEDS_REVIEW"
                              ? "bg-orange-500/20 text-orange-300"
                              : "bg-yellow-500/20 text-yellow-300"
                          }`}
                        >
                          {wager.verification_status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            wager.payout_status === "PAID"
                              ? "bg-green-500/20 text-green-300"
                              : "bg-yellow-500/20 text-yellow-300"
                          }`}
                        >
                          {wager.payout_status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setSelectedWager(wager)}
                            className="p-1 text-purple-300 hover:text-white transition-colors"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </button>
                          {wager.verification_status === "PENDING" && (
                            <button
                              onClick={() => handleVerifyMatch(wager.id)}
                              disabled={verifying === wager.id}
                              className="p-1 text-green-300 hover:text-green-200 transition-colors disabled:opacity-50"
                              title="Verify Match"
                            >
                              {verifying === wager.id ? (
                                <Loader2 size={18} className="animate-spin" />
                              ) : (
                                <CheckCircle size={18} />
                              )}
                            </button>
                          )}
                          {(wager.status === "PENDING" || wager.status === "ACTIVE") && (
                            <button
                              onClick={() => handleCancelWager(wager.id)}
                              className="p-1 text-red-300 hover:text-red-200 transition-colors"
                              title="Cancel Wager"
                            >
                              <XCircle size={18} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Wager Detail Modal */}
        {selectedWager && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-slate-900 rounded-lg border border-purple-500/30 p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-white">Wager #{selectedWager.id} Details</h2>
                <button
                  onClick={() => setSelectedWager(null)}
                  className="text-purple-300 hover:text-white"
                >
                  <XCircle size={24} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="text-purple-300 text-sm">Creator</div>
                  <div className="text-white font-mono flex items-center gap-2">
                    {selectedWager.creator_id}
                    <button
                      onClick={() => copyToClipboard(selectedWager.creator_id)}
                      className="text-purple-400 hover:text-purple-300"
                      title="Copy"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                  {userProfiles[selectedWager.creator_id]?.cr_tag && (
                    <div className="text-purple-200 text-sm mt-1">
                      Tag: {userProfiles[selectedWager.creator_id].cr_tag}
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-purple-300 text-sm">Opponent</div>
                  <div className="text-white font-mono flex items-center gap-2">
                    {selectedWager.opponent_id || "None"}
                    {selectedWager.opponent_id && (
                      <button
                        onClick={() => copyToClipboard(selectedWager.opponent_id!)}
                        className="text-purple-400 hover:text-purple-300"
                        title="Copy"
                      >
                        <Copy size={16} />
                      </button>
                    )}
                  </div>
                  {selectedWager.opponent_id && userProfiles[selectedWager.opponent_id]?.cr_tag && (
                    <div className="text-purple-200 text-sm mt-1">
                      Tag: {userProfiles[selectedWager.opponent_id].cr_tag}
                    </div>
                  )}
                </div>
                {selectedWager.winner_id && (
                  <div>
                    <div className="text-purple-300 text-sm">Winner</div>
                    <div className="text-white font-mono flex items-center gap-2">
                      {selectedWager.winner_id}
                      <button
                        onClick={() => copyToClipboard(selectedWager.winner_id!)}
                        className="text-purple-400 hover:text-purple-300"
                        title="Copy"
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                    {userProfiles[selectedWager.winner_id]?.cr_tag && (
                      <div className="text-purple-200 text-sm mt-1">
                        Tag: {userProfiles[selectedWager.winner_id].cr_tag}
                      </div>
                    )}
                  </div>
                )}
                <div>
                  <div className="text-purple-300 text-sm">Wager Amount</div>
                  <div className="text-white font-semibold text-xl">{selectedWager.amount} SOL</div>
                </div>
                {selectedWager.verification_status === "VERIFIED" && selectedWager.winner_id && selectedWager.payout_status !== "PAID" && (
                  <div className="bg-gradient-to-r from-green-500/30 to-emerald-500/30 border-2 border-green-500/50 rounded-lg p-4 mb-4">
                    <div className="text-green-300 text-lg font-bold mb-3 flex items-center gap-2">
                      💰 Payout Required
                    </div>
                    {(() => {
                      const totalWagered = selectedWager.amount * 2;
                      const fee = totalWagered * 0.05;
                      const payoutAmount = totalWagered - fee;
                      const solanaPayLink = `https://solana.com/pay?recipient=${selectedWager.winner_id}&amount=${payoutAmount}&label=Game%20%23${selectedWager.id}%20Payout&memo=Wager%20${selectedWager.id}`;
                      
                      return (
                        <>
                          <div className="text-white font-bold text-3xl mb-2">{payoutAmount.toFixed(4)} SOL</div>
                          <div className="text-green-200 text-sm mb-4">
                            ({totalWagered.toFixed(4)} SOL total - {fee.toFixed(4)} SOL fee)
                          </div>
                          <a
                            href={solanaPayLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-bold transition-all text-center text-lg shadow-lg mb-2"
                          >
                            <Wallet className="inline mr-2" size={20} />
                            Pay {payoutAmount.toFixed(4)} SOL via Solana Pay
                          </a>
                          <p className="text-green-200 text-xs text-center">
                            Click to open Solana Pay in your wallet
                          </p>
                        </>
                      );
                    })()}
                  </div>
                )}
                {selectedWager.payout_status === "PAID" && (
                  <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-3 mb-4">
                    <div className="text-blue-300 text-sm font-semibold mb-1">✅ Payment Completed</div>
                    {selectedWager.payout_signature && (
                      <div className="text-white font-mono text-xs break-all mt-2">
                        TX: {selectedWager.payout_signature}
                      </div>
                    )}
                  </div>
                )}
                <div>
                  <div className="text-purple-300 text-sm">Deposit Signature</div>
                  <div className="text-white font-mono text-sm break-all">
                    {selectedWager.deposit_signature || "None"}
                  </div>
                </div>
                {selectedWager.match_result && (
                  <div>
                    <div className="text-purple-300 text-sm">Match Result</div>
                    <pre className="text-white text-sm bg-slate-800 p-3 rounded overflow-auto">
                      {JSON.stringify(selectedWager.match_result, null, 2)}
                    </pre>
                  </div>
                )}
                {selectedWager.notes && (
                  <div>
                    <div className="text-purple-300 text-sm">Notes</div>
                    <div className="text-white">{selectedWager.notes}</div>
                  </div>
                )}
                
                <div className="flex gap-2 pt-4">
                  {selectedWager.verification_status !== "VERIFIED" && (
                    <button
                      onClick={() => handleMarkVerified(selectedWager.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
                    >
                      Mark as Verified
                    </button>
                  )}
                  {selectedWager.verification_status === "VERIFIED" && selectedWager.payout_status !== "PAID" && selectedWager.winner_id && (
                    <>
                      {/* Payment link is already shown above in the payout section */}
                      <button
                        onClick={() => {
                          const sig = prompt("Enter payout transaction signature after sending payment:");
                          if (sig) handleMarkPaid(selectedWager.id, sig);
                        }}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all"
                      >
                        Mark as Paid (After Payment)
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}



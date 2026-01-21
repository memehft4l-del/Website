"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { supabase, TournamentSignup } from "@/lib/supabase";
import { useWallet } from "@solana/wallet-adapter-react";

interface TournamentSignupFormProps {
  tier: "SQUIRE" | "WHALE" | "TGE";
  onSignupSuccess?: () => void;
}

export function TournamentSignupForm({ tier, onSignupSuccess }: TournamentSignupFormProps) {
  const { publicKey } = useWallet();
  const [username, setUsername] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

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
            className="w-full px-4 py-2 bg-slate-800 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            disabled={isSubmitting || status === "success"}
            required
          />
          <p className="text-xs text-slate-500 mt-1">
            Find your player tag in-game: Profile → Copy Player Tag
          </p>
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
            w-full px-4 py-3 rounded-lg font-semibold transition-all duration-200
            ${
              isSubmitting || status === "success"
                ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg shadow-purple-600/40 border border-purple-400/30 backdrop-blur-sm hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0"
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


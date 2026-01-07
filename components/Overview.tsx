"use client";

import { Trophy, Coins, Copy, Check, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { TiltCard } from "@/components/TiltCard";
import { DynamicWalletButton } from "@/components/DynamicWalletButton";
import { AboutSection } from "@/components/AboutSection";
import { TokenInfo } from "@/components/TokenInfo";
import { useWallet } from "@solana/wallet-adapter-react";
import { usePrizePool, DEV_WALLET } from "@/lib/usePrizePool";
import { useState } from "react";

export function Overview() {
  const { connected } = useWallet();
  const { balance: prizePoolBalance, isLoading: prizePoolLoading } = usePrizePool();
  const [copied, setCopied] = useState(false);

  const copyDevWallet = async () => {
    try {
      await navigator.clipboard.writeText(DEV_WALLET);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const formatPrizePool = () => {
    if (prizePoolLoading) return "Loading...";
    return `${prizePoolBalance.toFixed(2)} SOL`;
  };

  return (
    <>
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 10 }}
            className="mb-8"
          >
            <div className="relative inline-block mb-6">
              <motion.div
                animate={{ 
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.05, 1]
                }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity, 
                  repeatDelay: 2 
                }}
                className="relative"
              >
                <div className="absolute inset-0 blur-2xl bg-game-gold/40 rounded-full animate-pulse"></div>
                <div className="absolute inset-0 blur-xl bg-purple-500/20 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                <Trophy className="w-16 h-16 sm:w-20 sm:h-20 mx-auto text-game-gold relative z-10 drop-shadow-[0_0_30px_rgba(255,215,0,0.6)] filter brightness-110" />
              </motion.div>
            </div>
            <div className="mb-4">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 relative">
                <span className="gradient-text text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight">
                  Elixir Pump
                </span>
              </h1>
              <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold relative">
                <span className="gradient-text-gold text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight">
                  $ELIXIR
                </span>
              </p>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-6"
            >
              <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl text-white mb-4 font-bold text-stroke text-center">
                🏆 Home to Clash Royale Tournaments 🏆
              </p>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-slate-300 mb-3 font-semibold text-center">
                Token-Gated Competitive Gaming
              </p>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-slate-400 mb-2 px-4 max-w-3xl mx-auto text-center">
                Hold <span className="text-game-gold font-semibold">$ELIXIR</span> tokens to unlock exclusive tournament access and compete for prize pools funded by token fees.
              </p>
              <p className="text-xs sm:text-sm md:text-base text-slate-500 px-4 max-w-2xl mx-auto text-center">
                The more <span className="text-purple-400 font-semibold">$ELIXIR</span> tokens you hold, the higher your tier and the bigger the prize pools you can compete for.
              </p>
            </motion.div>
          </motion.div>

          {/* Connect Wallet Section */}
          {!connected && (
            <TiltCard intensity={6}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="glass rounded-2xl p-6 sm:p-8 mb-8 sm:mb-12"
              >
                <div className="flex flex-col items-center gap-6">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  >
                    <Shield className="w-12 h-12 sm:w-14 sm:h-14 text-purple-400" />
                  </motion.div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white">
                    Connect Your Wallet
                  </h2>
                  <p className="text-slate-400 max-w-md text-sm sm:text-base px-4">
                    Connect your Solana wallet to check your $ELIXIR balance and
                    unlock tournament access
                  </p>
                  <motion.div
                    className="mt-4"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <DynamicWalletButton className="!bg-gradient-to-r !from-purple-600 !to-yellow-600 hover:!from-purple-700 hover:!to-yellow-700 !rounded-lg !px-6 !py-3 sm:!px-8 sm:!py-4 !font-semibold !text-base sm:!text-lg !transition-all !border !border-white/10 !w-full sm:!w-auto" />
                  </motion.div>
                </div>
              </motion.div>
            </TiltCard>
          )}

          {/* Prize Pool Display */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="clash-card rounded-2xl p-6 sm:p-8 mb-8 sm:mb-12 gold-glow-box arena-badge-gold"
          >
            <div className="flex items-center justify-center gap-4 mb-4">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <Coins className="w-10 h-10 text-game-gold drop-shadow-[0_0_15px_rgba(255,215,0,0.6)]" />
              </motion.div>
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white text-stroke">Prize Pool</h3>
            </div>
            <motion.p
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold gradient-text-gold gold-glow"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {formatPrizePool()}
            </motion.p>
            <p className="text-slate-400 mt-2 font-medium">Funded by 85% of transaction fees</p>
            <p className="text-slate-500 text-xs mt-2 flex items-center justify-center gap-2">
              <span>Dev Wallet:</span>
              <code className="text-slate-400 font-mono text-xs">{DEV_WALLET.slice(0, 4)}...{DEV_WALLET.slice(-4)}</code>
              <button
                onClick={copyDevWallet}
                className="text-slate-500 hover:text-slate-300 transition-colors"
                title="Copy dev wallet address"
              >
                {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </p>
          </motion.div>
        </motion.div>

        {/* Token Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-12"
        >
          <TokenInfo />
        </motion.div>
      </div>

      {/* About Section */}
      <AboutSection />
    </>
  );
}


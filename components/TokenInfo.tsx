"use client";

import { motion } from "framer-motion";
import { ExternalLink, Copy, Check, Globe, Zap, TrendingUp, Twitter } from "lucide-react";
import { useState } from "react";
import { useTokenInfo } from "@/lib/useTokenInfo";

export function TokenInfo() {
  const [copied, setCopied] = useState(false);
  const { tokenInfo, isLoading } = useTokenInfo();

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  if (isLoading || !tokenInfo) {
    return (
      <div className="glass rounded-2xl p-4 sm:p-6 md:p-8 mb-8 card-modern">
        <div className="flex items-center gap-3 mb-4 sm:mb-6">
          <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">Token Information</h2>
        </div>
        <div className="text-slate-400 text-center py-8">Loading token information...</div>
      </div>
    );
  }

  const contractAddress = tokenInfo.contract_address;
  const pumpFunUrl = tokenInfo.pump_fun_url || `https://pump.fun/${contractAddress}`;
  const jupiterUrl = tokenInfo.jupiter_url || `https://jup.ag/swap/SOL-${contractAddress}`;
  const dexscreenerUrl = tokenInfo.dexscreener_url || `https://dexscreener.com/solana/${contractAddress}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-5xl mx-auto"
    >
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
          Token Information
        </h2>
        <p className="text-xl text-slate-400">Access, trade, and track $ELIXIR</p>
      </div>
      
      <div className="glass rounded-3xl p-6 sm:p-8 md:p-10 card-modern">

        {/* Contract Address */}
        <div className="glass rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 border border-white/10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex-1 min-w-0">
              <div className="text-slate-400 text-xs sm:text-sm mb-2 font-medium">Contract Address</div>
              <div className="flex items-center gap-2">
                <code className="text-white font-mono text-xs sm:text-sm md:text-base break-all">
                  {contractAddress}
                </code>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => copyToClipboard(contractAddress)}
              className="flex-shrink-0 glass rounded-lg p-3 hover:bg-white/10 transition-colors"
              title="Copy contract address"
            >
              {copied ? (
                <Check className="w-5 h-5 text-green-400" />
              ) : (
                <Copy className="w-5 h-5 text-slate-400" />
              )}
            </motion.button>
          </div>
        </div>

        {/* Buy Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <motion.a
          href={pumpFunUrl}
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="glass-gold rounded-xl p-3 sm:p-4 border border-game-gold/30 hover:border-game-gold/50 transition-all flex items-center justify-center gap-2 sm:gap-3 group"
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-game-gold/20 flex items-center justify-center group-hover:bg-game-gold/30 transition-colors flex-shrink-0">
            <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-game-gold" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white font-bold text-base sm:text-lg">Buy on Pump.fun</div>
            <div className="text-slate-400 text-xs">Primary Launch Platform</div>
          </div>
          <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5 text-game-gold flex-shrink-0" />
        </motion.a>

        <motion.a
          href={jupiterUrl}
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="glass rounded-xl p-3 sm:p-4 border border-purple-500/30 hover:border-purple-500/50 transition-all flex items-center justify-center gap-2 sm:gap-3 group"
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-purple-500/20 flex items-center justify-center group-hover:bg-purple-500/30 transition-colors flex-shrink-0">
            <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white font-bold text-base sm:text-lg">Swap on Jupiter</div>
            <div className="text-slate-400 text-xs">Best Rates</div>
          </div>
          <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400 flex-shrink-0" />
        </motion.a>
      </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {tokenInfo.twitter_url && (
            <motion.a
              href={tokenInfo.twitter_url}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="glass rounded-lg p-3 border border-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-3 group"
            >
              <Twitter className="w-5 h-5 text-blue-400" />
              <span className="text-sm text-slate-300 font-medium">Follow on Twitter/X</span>
              <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-white" />
            </motion.a>
          )}
          <motion.a
            href={dexscreenerUrl}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="glass rounded-lg p-3 border border-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-3 group"
          >
            <TrendingUp className="w-5 h-5 text-green-400" />
            <span className="text-sm text-slate-300 font-medium">View on DexScreener</span>
            <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-white" />
          </motion.a>
        </div>
      </div>
    </motion.div>
  );
}


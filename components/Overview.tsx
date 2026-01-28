"use client";

import { Trophy, Coins, Copy, Check, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { TiltCard } from "@/components/TiltCard";
import { DynamicWalletButton } from "@/components/DynamicWalletButton";
import { AboutSection } from "@/components/AboutSection";
import { TokenInfo } from "@/components/TokenInfo";
import { useWallet } from "@solana/wallet-adapter-react";
import { usePrizePool, DEV_WALLET } from "@/lib/usePrizePool";
import { useTokenInfo } from "@/lib/useTokenInfo";
import { useState } from "react";
import Link from "next/link";

export function Overview() {
  const { connected } = useWallet();
  const { balance: prizePoolBalance, isLoading: prizePoolLoading } = usePrizePool();
  const { tokenInfo } = useTokenInfo();
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
      {/* Hero Section - Modern Style */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Modern gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-purple-950/20 via-transparent to-purple-950/20"></div>
        {/* Floating elixir drops - Start immediately */}
        <div className="elixir-drop" style={{ left: '10%', animationDelay: '0.1s' }}></div>
        <div className="elixir-drop" style={{ left: '30%', animationDelay: '0.3s' }}></div>
        <div className="elixir-drop" style={{ left: '50%', animationDelay: '0.5s' }}></div>
        <div className="elixir-drop" style={{ left: '70%', animationDelay: '0.2s' }}></div>
        <div className="elixir-drop" style={{ left: '90%', animationDelay: '0.4s' }}></div>
        <div className="elixir-drop" style={{ left: '20%', animationDelay: '0.6s' }}></div>
        <div className="elixir-drop" style={{ left: '60%', animationDelay: '0.7s' }}></div>
        <div className="elixir-drop" style={{ left: '80%', animationDelay: '0.8s' }}></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
            className="max-w-5xl mx-auto text-center"
          >
            {/* Main Hero Title */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-6 leading-tight px-2"
            >
              <span className="block text-white mb-1 sm:mb-2">#1 Place for</span>
              <span className="block gradient-text-gold break-words">Clash Royale</span>
              <span className="block text-white break-words drop-shadow-lg">Tournaments & 1v1s</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-base sm:text-lg md:text-xl lg:text-2xl text-slate-300 mb-4 max-w-3xl mx-auto font-light px-4"
            >
              Token-gated competitive gaming. Hold <span className="text-game-gold font-semibold">$ELIXIR</span> to unlock exclusive tournaments and compete for prize pools.
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.8 }}
              className="text-base sm:text-lg md:text-xl text-green-400 mb-6 sm:mb-8 max-w-3xl mx-auto font-medium px-4"
            >
              Think you're the best? Place bets on yourself and play 1v1s against other real players to win SOL.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="mb-8"
            >
              <Link
                href="/arena"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-green-600/30"
              >
                <Trophy className="w-5 h-5" />
                1v1 Betting Arena
              </Link>
            </motion.div>

            {/* CTA Button */}
            {!connected && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="mb-16"
              >
                <DynamicWalletButton className="!bg-gradient-to-r !from-purple-600 !to-pink-600 hover:!from-purple-700 hover:!to-pink-700 !rounded-xl !px-8 !py-4 !text-lg !font-semibold !transition-all !shadow-lg !shadow-purple-600/30" />
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-24">
        {/* Prize Pool Section - Street.app Style */}
        <section className="mb-20 sm:mb-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            <div className="glass rounded-3xl p-8 sm:p-12 md:p-16 border border-white/10 card-modern">
              <div className="text-center">
                <h2 className="text-3xl sm:text-4xl md:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4 px-2">
                  Live Prize Pool
                </h2>
                <motion.p
                  className="text-4xl sm:text-5xl md:text-5xl lg:text-6xl xl:text-7xl font-bold gradient-text-gold mb-3 sm:mb-4 px-2 break-words"
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {formatPrizePool()}
                </motion.p>
                <p className="text-sm sm:text-base md:text-lg lg:text-xl text-slate-400 mb-2 px-2">Funded by 85% of transaction fees</p>
                <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                  <span>Dev Wallet:</span>
                  <code className="text-slate-400 font-mono">{DEV_WALLET.slice(0, 4)}...{DEV_WALLET.slice(-4)}</code>
                  <button
                    onClick={copyDevWallet}
                    className="text-slate-500 hover:text-slate-300 transition-colors"
                    title="Copy dev wallet address"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* How It Works Section - Detailed */}
        <section className="mb-20 sm:mb-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="max-w-6xl mx-auto"
          >
            <h2 className="text-3xl sm:text-4xl md:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4 text-center px-4">
              How It Works
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-slate-400 mb-8 sm:mb-12 text-center max-w-3xl mx-auto px-4">
              Simple steps to join tournaments and compete for prizes
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-12">
              {/* Step 1 */}
              <div className="glass rounded-2xl p-4 sm:p-6 md:p-8 card-modern">
                <div className="text-4xl sm:text-5xl font-bold text-game-gold mb-3 sm:mb-4">1</div>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-2 sm:mb-3">Buy & Hold $ELIXIR</h3>
                <p className="text-slate-400 text-xs sm:text-sm md:text-base leading-relaxed">
                  Purchase $ELIXIR tokens on Pump.fun or Jupiter. Hold the minimum amount required for your desired tier:
                </p>
                <ul className="mt-3 sm:mt-4 space-y-1 sm:space-y-2 text-xs sm:text-sm text-slate-300">
                  <li>• <span className="text-purple-400 font-semibold">Squire:</span> 500K+ tokens</li>
                  <li>• <span className="text-game-gold font-semibold">Whale:</span> 2.5M+ tokens</li>
                  <li>• <span className="text-pink-400 font-semibold">TGE:</span> 500K+ tokens</li>
                </ul>
              </div>
              {/* Step 2 */}
              <div className="glass rounded-2xl p-4 sm:p-6 md:p-8 card-modern">
                <div className="text-4xl sm:text-5xl font-bold text-purple-400 mb-3 sm:mb-4">2</div>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-2 sm:mb-3">Connect Wallet</h3>
                <p className="text-slate-400 text-xs sm:text-sm md:text-base leading-relaxed">
                  Connect your Solana wallet (Phantom, Solflare, etc.) to verify your token balance and unlock tournament access.
                </p>
                <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-slate-300">
                  Your wallet address is linked to your tournament signup for verification.
                </p>
              </div>
              {/* Step 3 */}
              <div className="glass rounded-2xl p-4 sm:p-6 md:p-8 card-modern">
                <div className="text-4xl sm:text-5xl font-bold text-pink-400 mb-3 sm:mb-4">3</div>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-2 sm:mb-3">Sign Up & Compete</h3>
                <p className="text-slate-400 text-xs sm:text-sm md:text-base leading-relaxed">
                  Enter your Clash Royale player tag, join the tournament, and compete! Remember: you must maintain your token 
                  balance throughout the entire tournament to be eligible for prizes.
                </p>
              </div>
            </div>

            {/* How to Join Tournament - Detailed */}
            <div className="glass rounded-3xl p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12 card-modern">
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6 text-center px-2">
                How to Join a Tournament
              </h3>
              
              <div className="space-y-4 sm:space-y-6">
                <div className="flex gap-3 sm:gap-4">
                  <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center text-sm sm:text-base">
                    1
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-lg sm:text-xl font-bold text-white mb-1 sm:mb-2">Check Your Eligibility</h4>
                    <p className="text-slate-300 text-xs sm:text-sm md:text-base leading-relaxed">
                      Go to the Dashboard and verify you hold enough $ELIXIR tokens for your desired tournament tier. 
                      Your balance and tier status are displayed automatically.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 sm:gap-4">
                  <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center text-sm sm:text-base">
                    2
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-lg sm:text-xl font-bold text-white mb-1 sm:mb-2">Wait for Tournament Signup</h4>
                    <p className="text-slate-300 text-xs sm:text-sm md:text-base leading-relaxed">
                      Tournaments are held biweekly on Wednesdays and Saturdays. Signup opens during the preparation phase 
                      (3 PM UTC). Check the countdown timer on the Dashboard to know when signup opens.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 sm:gap-4">
                  <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center text-sm sm:text-base">
                    3
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-lg sm:text-xl font-bold text-white mb-1 sm:mb-2">Enter Your Clash Royale Tag</h4>
                    <p className="text-slate-300 text-xs sm:text-sm md:text-base leading-relaxed">
                      When signup opens, enter your Clash Royale player tag (found in your Clash Royale profile). 
                      This links your wallet to your Clash Royale account for tournament participation.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 sm:gap-4">
                  <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center text-sm sm:text-base">
                    4
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-lg sm:text-xl font-bold text-white mb-1 sm:mb-2">Join the Tournament</h4>
                    <p className="text-slate-300 text-xs sm:text-sm md:text-base leading-relaxed">
                      Use the tournament tag and password provided on the Dashboard to join the in-game tournament. 
                      Tournament starts at 4 PM UTC and runs until 8 PM UTC.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 sm:gap-4">
                  <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center text-sm sm:text-base">
                    5
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-lg sm:text-xl font-bold text-white mb-1 sm:mb-2">Compete & Maintain Balance</h4>
                    <p className="text-slate-300 text-xs sm:text-sm md:text-base leading-relaxed">
                      Play your matches! You're eliminated after 3 losses. <span className="text-yellow-400 font-semibold">Important:</span> You must maintain 
                      your required token balance throughout the entire tournament. Selling tokens or dropping below your tier 
                      will void any prizes.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 sm:gap-4">
                  <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-game-gold text-white font-bold flex items-center justify-center text-sm sm:text-base">
                    ✓
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-lg sm:text-xl font-bold text-white mb-1 sm:mb-2">Win Prizes</h4>
                    <p className="text-slate-300 text-xs sm:text-sm md:text-base leading-relaxed">
                      Top 3 finishers receive prizes: 1st place (75%), 2nd place (20%), 3rd place (5%). 
                      Prizes are distributed after verification of token holdings and tournament results.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-purple-500/10 border border-purple-500/30 rounded-xl">
                <p className="text-xs sm:text-sm md:text-base text-purple-200 leading-relaxed">
                  <span className="font-semibold text-white">💡 Pro Tip:</span> Keep your $ELIXIR tokens in your connected wallet 
                  throughout the entire tournament period. Don't transfer or sell them until after prizes are distributed!
                </p>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Token Info Section */}
        <section className="mb-20 sm:mb-24">
          <TokenInfo />
        </section>
      </div>

      {/* About Section */}
      <AboutSection />

      {/* Footer with Legal Links */}
      <footer className="border-t border-white/10 mt-20 sm:mt-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div>
                <h3 className="text-xl font-bold text-white mb-4">Elixir Pump</h3>
                <p className="text-slate-400 text-sm">
                  Home to Clash Royale Tournaments. Token-gated competitive gaming platform.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-4">Quick Links</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="/rules" className="text-slate-400 hover:text-white transition-colors text-sm">
                      Tournament Rules
                    </Link>
                  </li>
                  {tokenInfo?.twitter_url && (
                    <li>
                      <a 
                        href={tokenInfo.twitter_url}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-slate-400 hover:text-white transition-colors text-sm"
                      >
                        Twitter / X
                      </a>
                    </li>
                  )}
                  {tokenInfo?.dexscreener_url && (
                    <li>
                      <a 
                        href={tokenInfo.dexscreener_url}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-slate-400 hover:text-white transition-colors text-sm"
                      >
                        DexScreener
                      </a>
                    </li>
                  )}
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-4">Legal</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="/legal" className="text-slate-400 hover:text-white transition-colors text-sm">
                      Terms of Service
                    </Link>
                  </li>
                  <li>
                    <Link href="/legal" className="text-slate-400 hover:text-white transition-colors text-sm">
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link href="/legal" className="text-slate-400 hover:text-white transition-colors text-sm">
                      Disclaimers
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="border-t border-white/10 pt-8 text-center">
              <p className="text-slate-500 text-sm">
                © {new Date().getFullYear()} Elixir Pump. All rights reserved. Not affiliated with Supercell or Clash Royale.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}


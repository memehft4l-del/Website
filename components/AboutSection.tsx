"use client";

import { motion } from "framer-motion";
import { Trophy, Coins, TrendingUp, Shield, Calendar, AlertCircle } from "lucide-react";
import { TiltCard } from "./TiltCard";

export function AboutSection() {
  return (
    <section className="w-full max-w-6xl mx-auto py-16 px-4">
      {/* $ELIXIR Ecosystem Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-6xl mx-auto"
      >
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            Elixir Pump Ecosystem
          </h2>
          <p className="text-xl text-slate-400">Token utility, tokenomics, and tournament rules</p>
        </div>

        <div className="glass rounded-3xl p-8 sm:p-10 md:p-12 card-modern">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-8">
            {/* Token Utility */}
            <div className="glass rounded-2xl p-6 sm:p-8 border border-purple-500/20 card-modern">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-6 h-6 text-purple-400" />
                <h3 className="text-xl sm:text-2xl font-bold text-white">Token Utility</h3>
              </div>
              <p className="text-slate-300 leading-relaxed text-sm sm:text-base">
                <span className="text-game-gold font-semibold">$ELIXIR</span> is the core fuel for <span className="text-purple-400 font-semibold">Elixir Pump</span>, our Clash Royale tournament platform. High-tier holdings unlock exclusive 
                Arenas (Squire/Whale) with larger prize pools.
              </p>
            </div>

            {/* The Vault */}
            <div className="glass rounded-2xl p-6 sm:p-8 border border-purple-500/20 card-modern">
              <div className="flex items-center gap-3 mb-4">
                <Coins className="w-6 h-6 text-game-gold" />
                <h3 className="text-xl sm:text-2xl font-bold text-white">The Vault</h3>
              </div>
              <p className="text-slate-300 leading-relaxed text-sm sm:text-base">
                85% of all launch and trading fees fund the tournament Prize Pools. 15% is dedicated to automated <span className="text-game-gold font-semibold">$ELIXIR</span> Token Buybacks.
              </p>
            </div>
          </div>

          {/* Tournament Rules */}
          <div className="glass rounded-2xl p-6 sm:p-8 border border-yellow-500/20 bg-yellow-500/5 card-modern">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="w-6 h-6 text-yellow-400" />
              <h3 className="text-xl font-bold text-white">Tournament Format</h3>
            </div>
            <div className="space-y-3 text-slate-300 leading-relaxed">
              <p>
                Regular tournaments occur <span className="font-semibold text-white">daily</span> with a 
                <span className="font-semibold text-white"> 1-hour preparation phase</span> starting at 
                <span className="font-semibold text-white"> 3PM UTC</span>, followed by a <span className="font-semibold text-white">4-hour tournament</span> from 
                <span className="font-semibold text-white"> 4PM to 8PM UTC</span>.
              </p>
              <p>
                Game modes (primarily Classic Battles and Triple Draft) are announced before each tournament. 
                <span className="font-semibold text-white"> 3 losses eliminate you</span> from the competition.
              </p>
              <p>
                <span className="font-semibold text-white">Prize Distribution:</span> 1st place receives 75%, 2nd place gets 20%, and 3rd place earns 5% of the prize pool.
              </p>
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3 mt-4">
                <p className="text-sm text-purple-200">
                  <span className="font-semibold text-white">✨ Surprise Tournaments:</span> Stay tuned for special announcement tournaments on X (Twitter)! 
                  These events feature unique prizes and formats, announced when there's high demand and enough players ready to compete.
                </p>
              </div>
              <p className="text-sm text-slate-400 pt-2 border-t border-white/10 mt-3">
                You must hold the required tier balance for the entire duration of the event. 
                Selling or dipping below your tier voids any prize; voided prizes are redirected to $ELIXIR buybacks.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

"use client";

import { motion } from "framer-motion";
import { Trophy, Coins, TrendingUp, Shield, Calendar, AlertCircle } from "lucide-react";
import { TiltCard } from "./TiltCard";

export function AboutSection() {
  return (
    <div className="w-full max-w-6xl mx-auto py-16 px-4">
      {/* $ELIXIR Ecosystem Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="glass rounded-2xl p-8 md:p-12 mb-12"
      >
        <div className="flex items-center gap-3 mb-8">
          <Trophy className="w-8 h-8 text-game-gold" />
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            $ELIXIR Ecosystem
          </h2>
        </div>

        <div className="space-y-8">
          {/* Token Utility */}
          <div className="glass rounded-xl p-6 border border-purple-500/20">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-6 h-6 text-purple-400" />
              <h3 className="text-xl font-bold text-white">Token Utility</h3>
            </div>
            <p className="text-slate-300 leading-relaxed">
              $ELIXIR is the core fuel for our Clash Royale tournament platform. High-tier holdings unlock exclusive 
              Arenas (Squire/Whale) with larger prize pools.
            </p>
          </div>

          {/* The Vault */}
          <div className="glass rounded-xl p-6 border border-purple-500/20">
            <div className="flex items-center gap-3 mb-4">
              <Coins className="w-6 h-6 text-game-gold" />
              <h3 className="text-xl font-bold text-white">The Vault</h3>
            </div>
            <p className="text-slate-300 leading-relaxed">
              85% of all launch and trading fees fund the tournament Prize Pools. 15% is dedicated to automated Token Buybacks.
            </p>
          </div>

          {/* Tournament Rules */}
          <div className="glass rounded-xl p-6 border border-yellow-500/20 bg-yellow-500/5">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="w-6 h-6 text-yellow-400" />
              <h3 className="text-xl font-bold text-white">Tournament Format</h3>
            </div>
            <div className="space-y-3 text-slate-300 leading-relaxed">
              <p>
                Regular tournaments occur <span className="font-semibold text-white">biweekly on Wednesdays and Saturdays</span> with a 
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
    </div>
  );
}

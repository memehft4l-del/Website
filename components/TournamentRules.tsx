"use client";

import { motion } from "framer-motion";
import { Clock, Trophy, Users, AlertCircle, Calendar, Target, Award, Sparkles } from "lucide-react";

export function TournamentRules() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-6 border border-purple-500/20 bg-purple-500/5"
    >
      <div className="flex items-center gap-3 mb-6">
        <Trophy className="w-6 h-6 text-purple-400" />
        <h3 className="text-2xl font-bold text-white">Tournament Rules & Format</h3>
      </div>

      <div className="space-y-6">
        {/* Schedule */}
        <div className="glass rounded-lg p-4 border border-white/5">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-5 h-5 text-blue-400" />
            <h4 className="text-lg font-semibold text-white">Tournament Schedule</h4>
          </div>
          <div className="space-y-2 text-slate-300 text-sm">
            <div className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-semibold text-white">Preparation Phase:</span> 3:00 PM UTC (1 hour)
                <p className="text-slate-400 text-xs mt-1">
                  Participants with the correct token amount can join during this time
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Target className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-semibold text-white">Tournament Start:</span> 4:00 PM UTC
                <p className="text-slate-400 text-xs mt-1">
                  Tournament begins and lasts for 4 hours until 8:00 PM UTC
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Game Modes */}
        <div className="glass rounded-lg p-4 border border-white/5">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-5 h-5 text-purple-400" />
            <h4 className="text-lg font-semibold text-white">Game Modes</h4>
          </div>
          <p className="text-slate-300 text-sm mb-2">
            Game modes will be displayed before the tournament is announced. Tournaments will primarily feature:
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-300 text-sm ml-2">
            <li>Classic Battles</li>
            <li>Triple Draft Mode</li>
          </ul>
        </div>

        {/* Elimination Rules */}
        <div className="glass rounded-lg p-4 border border-red-500/20 bg-red-500/5">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <h4 className="text-lg font-semibold text-white">Elimination Rules</h4>
          </div>
          <p className="text-slate-300 text-sm">
            <span className="font-semibold text-white">3 losses and you're out.</span> Manage your battles carefully!
          </p>
        </div>

        {/* Prize Distribution */}
        <div className="glass rounded-lg p-4 border border-game-gold/30 bg-game-gold/5">
          <div className="flex items-center gap-2 mb-3">
            <Award className="w-5 h-5 text-game-gold" />
            <h4 className="text-lg font-semibold text-white">Prize Distribution</h4>
          </div>
          <div className="space-y-2 text-slate-300 text-sm">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-game-gold" />
                <span className="font-semibold text-white">1st Place:</span>
              </span>
              <span className="font-bold text-game-gold">75% of Prize Pool</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-slate-400" />
                <span className="font-semibold text-white">2nd Place:</span>
              </span>
              <span className="font-bold text-slate-300">20% of Prize Pool</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-600" />
                <span className="font-semibold text-white">3rd Place:</span>
              </span>
              <span className="font-bold text-amber-500">5% of Prize Pool</span>
            </div>
          </div>
        </div>

        {/* Tournament Schedule Update */}
        <div className="glass rounded-lg p-4 border border-blue-500/30 bg-blue-500/5">
          <div className="flex items-start gap-2">
            <Calendar className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-blue-400 mb-1">Regular Tournament Schedule</h4>
              <p className="text-slate-300 text-xs leading-relaxed">
                Tournaments are held biweekly on <span className="font-semibold text-white">Wednesdays and Saturdays</span>. 
                Stay tuned for surprise announcement tournaments announced on X (Twitter) and other platforms. 
                These special tournaments will have different prizes and operate with unique formats based on demand and player participation.
              </p>
            </div>
          </div>
        </div>

        {/* Surprise Tournaments */}
        <div className="glass rounded-lg p-4 border border-purple-500/40 bg-gradient-to-br from-purple-500/10 to-pink-500/10">
          <div className="flex items-start gap-2">
            <Sparkles className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-purple-400 mb-1 flex items-center gap-2">
                Surprise Tournaments
                <span className="px-2 py-0.5 bg-purple-500/20 rounded text-xs">Special Events</span>
              </h4>
              <p className="text-slate-300 text-xs leading-relaxed">
                Follow us on <span className="font-semibold text-white">X (Twitter)</span> for surprise tournament announcements! 
                These special events are announced when there's high demand and enough players ready to compete. 
                They feature unique prize structures and may operate differently from regular tournaments.
              </p>
            </div>
          </div>
        </div>

        {/* Important Notice */}
        <div className="glass rounded-lg p-4 border border-yellow-500/30 bg-yellow-500/5">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-yellow-400 mb-1">Important Notice</h4>
              <p className="text-slate-300 text-xs leading-relaxed">
                You must maintain your required token holdings throughout the entire tournament duration. 
                Token balance will be verified at sign-up, during the preparation phase, and before prize distribution. 
                If you win but no longer hold the required tokens, your prize will be voided and used for token buybacks.
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}


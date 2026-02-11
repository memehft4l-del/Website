"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock } from "lucide-react";

export function TournamentCountdown() {
  const [prepTimeRemaining, setPrepTimeRemaining] = useState<string>("Calculating...");
  const [tournamentTimeRemaining, setTournamentTimeRemaining] = useState<string>("Calculating...");
  const [phase, setPhase] = useState<"upcoming" | "preparation" | "active">("upcoming");
  const [nextDay, setNextDay] = useState<string>("");

  useEffect(() => {
    const calculateNextTournament = () => {
      const updateCountdown = () => {
        const now = new Date();
        const nowUTC = new Date(now.toISOString());
        
        // Tournaments are daily at 3PM UTC (prep) and 4PM UTC (start)
        // Find next tournament (today if before 8PM UTC, otherwise tomorrow)
        let daysUntilNext = 0;
        let nextDayName = "";
        
        const currentHour = nowUTC.getUTCHours();
        const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        
        // If it's before 8PM UTC, tournament is today
        if (currentHour < 20) {
          daysUntilNext = 0;
          nextDayName = dayNames[nowUTC.getUTCDay()];
        } else {
          // Tournament ended today, next one is tomorrow
          daysUntilNext = 1;
          const tomorrow = new Date(nowUTC);
          tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
          nextDayName = dayNames[tomorrow.getUTCDay()];
        }
        
        let nextPrep = new Date(nowUTC);
        nextPrep.setUTCDate(nowUTC.getUTCDate() + daysUntilNext);
        nextPrep.setUTCHours(15, 0, 0, 0); // 3PM UTC preparation phase
        
        let nextStart = new Date(nextPrep);
        nextStart.setUTCHours(16, 0, 0, 0); // 4PM UTC tournament start
        
        let nextEnd = new Date(nextStart);
        nextEnd.setUTCHours(20, 0, 0, 0); // 8PM UTC tournament end
        
        setNextDay(nextDayName);

        // Determine current phase
        if (nowUTC >= nextEnd) {
          // Tournament ended, find next one (tomorrow)
          nextPrep.setUTCDate(nextPrep.getUTCDate() + 1);
          nextStart.setUTCDate(nextStart.getUTCDate() + 1);
          nextEnd.setUTCDate(nextEnd.getUTCDate() + 1);
          const tomorrow = new Date(nowUTC);
          tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
          setNextDay(dayNames[tomorrow.getUTCDay()]);
          setPhase("upcoming");
        } else if (nowUTC >= nextStart) {
          setPhase("active");
        } else if (nowUTC >= nextPrep) {
          setPhase("preparation");
        } else {
          setPhase("upcoming");
        }

        // Calculate time until prep phase
        const prepDiff = nextPrep.getTime() - nowUTC.getTime();
        if (prepDiff <= 0 && phase === "preparation") {
          setPrepTimeRemaining("Preparation Phase Active");
        } else if (prepDiff <= 0) {
          setPrepTimeRemaining("Starting Soon");
        } else {
          const prepDays = Math.floor(prepDiff / (1000 * 60 * 60 * 24));
          const prepHours = Math.floor((prepDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const prepMinutes = Math.floor((prepDiff % (1000 * 60 * 60)) / (1000 * 60));
          
          if (prepDays > 0) {
            setPrepTimeRemaining(`${prepDays}d ${prepHours}h ${prepMinutes}m`);
          } else if (prepHours > 0) {
            setPrepTimeRemaining(`${prepHours}h ${prepMinutes}m`);
          } else {
            setPrepTimeRemaining(`${prepMinutes}m`);
          }
        }

        // Calculate time until tournament start
        const startDiff = nextStart.getTime() - nowUTC.getTime();
        if (startDiff <= 0 && phase === "active") {
          setTournamentTimeRemaining("Tournament Active");
        } else if (startDiff <= 0) {
          setTournamentTimeRemaining("Starting Now");
        } else {
          const startDays = Math.floor(startDiff / (1000 * 60 * 60 * 24));
          const startHours = Math.floor((startDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const startMinutes = Math.floor((startDiff % (1000 * 60 * 60)) / (1000 * 60));
          
          if (startDays > 0) {
            setTournamentTimeRemaining(`${startDays}d ${startHours}h ${startMinutes}m`);
          } else if (startHours > 0) {
            setTournamentTimeRemaining(`${startHours}h ${startMinutes}m`);
          } else {
            setTournamentTimeRemaining(`${startMinutes}m`);
          }
        }
      };

      updateCountdown();
      const interval = setInterval(updateCountdown, 60000); // Update every minute

      return () => clearInterval(interval);
    };

    const cleanup = calculateNextTournament();
    return cleanup;
  }, [phase]);


  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-slate-300">
        <Calendar className="w-4 h-4" />
        <span className="text-sm font-medium">Next Tournament ({nextDay}):</span>
      </div>
      <div className="ml-6 space-y-1 text-sm">
        <div className="flex items-center gap-2 text-yellow-400">
          <Clock className="w-3 h-3" />
          <span>Prep Phase (3PM UTC): {prepTimeRemaining}</span>
        </div>
        <div className="flex items-center gap-2 text-green-400">
          <Clock className="w-3 h-3" />
          <span>Tournament Start (4PM UTC): {tournamentTimeRemaining}</span>
        </div>
        <div className="text-slate-400 text-xs mt-1">
          Tournament runs 4 hours (until 8PM UTC) • Daily tournaments every day
        </div>
      </div>
    </div>
  );
}


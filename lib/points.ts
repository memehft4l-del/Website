// Points calculation and management system

import { supabase } from "./supabase";
import { POINTS_CONFIG } from "./constants";

export interface PointsUpdate {
  walletAddress: string;
  points: number;
  gamesWon: number;
  gamesLost: number;
  winStreak: number;
  bestWinStreak: number;
  totalWinnings: number;
}

/**
 * Calculate points for a match result
 */
export function calculatePoints(
  isWinner: boolean,
  currentStreak: number,
  wagerAmount: number
): number {
  let points = isWinner ? POINTS_CONFIG.WIN : POINTS_CONFIG.LOSS;

  // Streak bonus for winners
  if (isWinner && currentStreak > 0) {
    const streakBonus = Math.min(
      currentStreak * POINTS_CONFIG.STREAK_BONUS,
      POINTS_CONFIG.MAX_STREAK_BONUS
    );
    points += streakBonus;
  }

  // Bonus based on wager amount (higher stakes = more points)
  const wagerBonus = Math.floor(wagerAmount * 10); // 10 points per SOL
  points += wagerBonus;

  return points;
}

/**
 * Update user points and stats after a match
 */
export async function updateUserPoints(
  walletAddress: string,
  isWinner: boolean,
  wagerAmount: number
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get current user profile
    const { data: profile, error: fetchError } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("wallet_address", walletAddress)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      // PGRST116 = not found, which is OK
      throw fetchError;
    }

    const currentPoints = profile?.total_points || 0;
    const currentWins = profile?.games_won || 0;
    const currentLosses = profile?.games_lost || 0;
    const currentStreak = profile?.win_streak || 0;
    const bestStreak = profile?.best_win_streak || 0;
    const totalWinnings = parseFloat(profile?.total_winnings || "0");

    // Calculate new values
    const newWins = isWinner ? currentWins + 1 : currentWins;
    const newLosses = isWinner ? currentLosses : currentLosses + 1;
    const newStreak = isWinner ? currentStreak + 1 : 0;
    const newBestStreak = Math.max(bestStreak, newStreak);
    const pointsEarned = calculatePoints(isWinner, currentStreak, wagerAmount);
    const newPoints = currentPoints + pointsEarned;
    const newWinnings = isWinner
      ? totalWinnings + wagerAmount * 2 // Winner gets 2x (both players' wagers)
      : totalWinnings;

    // Update or insert user profile
    const { error: updateError } = await supabase
      .from("user_profiles")
      .upsert(
        {
          wallet_address: walletAddress,
          total_points: newPoints,
          games_won: newWins,
          games_lost: newLosses,
          win_streak: newStreak,
          best_win_streak: newBestStreak,
          total_winnings: newWinnings,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "wallet_address",
        }
      );

    if (updateError) throw updateError;

    return { success: true };
  } catch (error: any) {
    console.error("Error updating user points:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Get user stats
 */
export async function getUserStats(
  walletAddress: string
): Promise<PointsUpdate | null> {
  try {
    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("wallet_address", walletAddress)
      .single();

    if (error) throw error;

    if (!data) return null;

    return {
      walletAddress: data.wallet_address,
      points: data.total_points || 0,
      gamesWon: data.games_won || 0,
      gamesLost: data.games_lost || 0,
      winStreak: data.win_streak || 0,
      bestWinStreak: data.best_win_streak || 0,
      totalWinnings: parseFloat(data.total_winnings || "0"),
    };
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return null;
  }
}



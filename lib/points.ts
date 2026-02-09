// Points calculation and management system

import { supabase } from "./supabase";
import { POINTS_CONFIG } from "./constants";

export interface PointsUpdate {
  walletAddress: string;
  points: number; // Total points (1v1 + tournament)
  gamesWon: number; // 1v1 wins only
  gamesLost: number; // 1v1 losses only
  tournamentPoints: number; // Tournament points only
  tournamentWins: number; // Tournament wins
  tournamentLosses: number; // Tournament losses
  referralCode: string | null; // User's referral code
  referredBy: string | null; // Who referred them
  referralPoints: number; // Points earned from referrals
  totalReferrals: number; // Number of users referred
  winStreak: number; // 1v1 win streak
  bestWinStreak: number; // Best 1v1 win streak
  totalWinnings: number;
}

/**
 * Generate a unique referral code from wallet address
 */
export function generateReferralCode(walletAddress: string): string {
  // Use first 8 characters of wallet address + random suffix
  const prefix = walletAddress.slice(0, 8).toUpperCase();
  const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${randomSuffix}`;
}

/**
 * Award referral bonus to referrer
 */
async function awardReferralBonus(referrerWallet: string, bonusPoints: number): Promise<void> {
  try {
    const { data: referrerProfile, error: fetchError } = await supabase
      .from("user_profiles")
      .select("referral_points, total_points")
      .eq("wallet_address", referrerWallet)
      .single();

    if (fetchError || !referrerProfile) {
      console.error("Error fetching referrer profile:", fetchError);
      return;
    }

    const newReferralPoints = (referrerProfile.referral_points || 0) + bonusPoints;
    const newTotalPoints = (referrerProfile.total_points || 0) + bonusPoints;

    await supabase
      .from("user_profiles")
      .update({
        referral_points: newReferralPoints,
        total_points: newTotalPoints,
        updated_at: new Date().toISOString(),
      })
      .eq("wallet_address", referrerWallet);
  } catch (error) {
    console.error("Error awarding referral bonus:", error);
  }
}

/**
 * Create or get user referral code
 */
export async function getOrCreateReferralCode(walletAddress: string): Promise<string> {
  try {
    const { data: profile, error: fetchError } = await supabase
      .from("user_profiles")
      .select("referral_code")
      .eq("wallet_address", walletAddress)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      throw fetchError;
    }

    if (profile?.referral_code) {
      return profile.referral_code;
    }

    // Generate new referral code
    let referralCode = generateReferralCode(walletAddress);
    let attempts = 0;
    const maxAttempts = 10;

    // Ensure uniqueness
    while (attempts < maxAttempts) {
      const { data: existing } = await supabase
        .from("user_profiles")
        .select("referral_code")
        .eq("referral_code", referralCode)
        .single();

      if (!existing) {
        break; // Code is unique
      }

      referralCode = generateReferralCode(walletAddress);
      attempts++;
    }

    // Update user profile with referral code
    await supabase
      .from("user_profiles")
      .upsert(
        {
          wallet_address: walletAddress,
          referral_code: referralCode,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "wallet_address",
        }
      );

    return referralCode;
  } catch (error: any) {
    console.error("Error creating referral code:", error);
    throw new Error(`Failed to create referral code: ${error.message}`);
  }
}

/**
 * Register a referral (when a new user signs up with a referral code)
 */
export async function registerReferral(
  newUserWallet: string,
  referralCode: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Find referrer by code
    const { data: referrerProfile, error: referrerError } = await supabase
      .from("user_profiles")
      .select("wallet_address, total_referrals")
      .eq("referral_code", referralCode)
      .single();

    if (referrerError || !referrerProfile) {
      return { success: false, error: "Invalid referral code" };
    }

    // Check if user already has a referrer
    const { data: existingProfile } = await supabase
      .from("user_profiles")
      .select("referred_by")
      .eq("wallet_address", newUserWallet)
      .single();

    if (existingProfile?.referred_by) {
      return { success: false, error: "User already has a referrer" };
    }

    // Update new user's profile
    await supabase
      .from("user_profiles")
      .upsert(
        {
          wallet_address: newUserWallet,
          referred_by: referrerProfile.wallet_address,
          total_points: POINTS_CONFIG.REFERRAL.REFERRED_BONUS, // Give bonus to new user
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "wallet_address",
        }
      );

    // Update referrer's total referrals count
    await supabase
      .from("user_profiles")
      .update({
        total_referrals: (referrerProfile.total_referrals || 0) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("wallet_address", referrerProfile.wallet_address);

    return { success: true };
  } catch (error: any) {
    console.error("Error registering referral:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Calculate points for a 1v1 match result
 */
export function calculate1v1Points(
  isWinner: boolean,
  currentStreak: number,
  wagerAmount: number
): number {
  const config = POINTS_CONFIG.ONE_V_ONE;
  let points = isWinner ? config.WIN : config.LOSS;

  // Streak bonus for winners
  if (isWinner && currentStreak > 0) {
    const streakBonus = Math.min(
      currentStreak * config.STREAK_BONUS,
      config.MAX_STREAK_BONUS
    );
    points += streakBonus;
  }

  // Bonus based on wager amount (higher stakes = more points)
  const wagerBonus = Math.floor(wagerAmount * config.WAGER_BONUS_MULTIPLIER);
  points += wagerBonus;

  return points;
}

/**
 * Calculate points for a tournament result
 * @param placement - Final placement (1 = first, 2 = second, etc.)
 * @param matchesWon - Number of matches won in the tournament
 */
export function calculateTournamentPoints(
  placement: number,
  matchesWon: number
): number {
  const config = POINTS_CONFIG.TOURNAMENT;
  let points = 0;

  // Placement points
  if (placement === 1) {
    points = config.FIRST_PLACE;
  } else if (placement === 2) {
    points = config.SECOND_PLACE;
  } else if (placement === 3) {
    points = config.THIRD_PLACE;
  } else if (placement <= 8) {
    points = config.TOP_8;
  } else if (placement <= 16) {
    points = config.TOP_16;
  } else {
    points = config.PARTICIPATION;
  }

  // Bonus for matches won
  points += matchesWon * config.WIN_BONUS;

  return points;
}

/**
 * Update user points and stats after a 1v1 match
 */
export async function update1v1Points(
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
    const currentTournamentPoints = profile?.tournament_points || 0;
    const current1v1Points = currentPoints - currentTournamentPoints;
    const currentWins = profile?.games_won || 0;
    const currentLosses = profile?.games_lost || 0;
    const currentStreak = profile?.win_streak || 0;
    const bestStreak = profile?.best_win_streak || 0;
    const totalWinnings = parseFloat(profile?.total_winnings || "0");

    // Calculate new values for 1v1
    const newWins = isWinner ? currentWins + 1 : currentWins;
    const newLosses = isWinner ? currentLosses : currentLosses + 1;
    const newStreak = isWinner ? currentStreak + 1 : 0;
    const newBestStreak = Math.max(bestStreak, newStreak);
    const pointsEarned = calculate1v1Points(isWinner, currentStreak, wagerAmount);
    const new1v1Points = current1v1Points + pointsEarned;
    const newTotalPoints = new1v1Points + currentTournamentPoints;
    const newWinnings = isWinner
      ? totalWinnings + wagerAmount * 2 // Winner gets 2x (both players' wagers)
      : totalWinnings;

    // Award referral bonus to referrer (10% of points earned)
    if (profile?.referred_by) {
      const referralBonus = Math.floor(pointsEarned * POINTS_CONFIG.REFERRAL.REFERRER_BONUS_PERCENTAGE);
      if (referralBonus > 0) {
        await awardReferralBonus(profile.referred_by, referralBonus);
      }
    }

    // Update or insert user profile
    const { error: updateError } = await supabase
      .from("user_profiles")
      .upsert(
        {
          wallet_address: walletAddress,
          total_points: newTotalPoints,
          games_won: newWins,
          games_lost: newLosses,
          tournament_points: currentTournamentPoints, // Keep existing tournament points
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
 * Update user points and stats after a tournament
 */
export async function updateTournamentPoints(
  walletAddress: string,
  placement: number,
  matchesWon: number
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get current user profile
    const { data: profile, error: fetchError } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("wallet_address", walletAddress)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      throw fetchError;
    }

    const currentTotalPoints = profile?.total_points || 0;
    const currentTournamentPoints = profile?.tournament_points || 0;
    const current1v1Points = currentTotalPoints - currentTournamentPoints;
    const currentTournamentWins = profile?.tournament_wins || 0;
    const currentTournamentLosses = profile?.tournament_losses || 0;

    // Calculate new tournament values
    const pointsEarned = calculateTournamentPoints(placement, matchesWon);
    const newTournamentPoints = currentTournamentPoints + pointsEarned;
    const newTotalPoints = current1v1Points + newTournamentPoints;
    const isWinner = placement === 1;
    const newTournamentWins = isWinner ? currentTournamentWins + 1 : currentTournamentWins;
    const newTournamentLosses = isWinner ? currentTournamentLosses : currentTournamentLosses + 1;

    // Award referral bonus to referrer (10% of points earned)
    if (profile?.referred_by) {
      const referralBonus = Math.floor(pointsEarned * POINTS_CONFIG.REFERRAL.REFERRER_BONUS_PERCENTAGE);
      if (referralBonus > 0) {
        await awardReferralBonus(profile.referred_by, referralBonus);
      }
    }

    // Update or insert user profile
    const { error: updateError } = await supabase
      .from("user_profiles")
      .upsert(
        {
          wallet_address: walletAddress,
          total_points: newTotalPoints,
          tournament_points: newTournamentPoints,
          tournament_wins: newTournamentWins,
          tournament_losses: newTournamentLosses,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "wallet_address",
        }
      );

    if (updateError) throw updateError;

    return { success: true };
  } catch (error: any) {
    console.error("Error updating tournament points:", error);
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
      tournamentPoints: data.tournament_points || 0,
      tournamentWins: data.tournament_wins || 0,
      tournamentLosses: data.tournament_losses || 0,
      referralCode: data.referral_code || null,
      referredBy: data.referred_by || null,
      referralPoints: data.referral_points || 0,
      totalReferrals: data.total_referrals || 0,
      winStreak: data.win_streak || 0,
      bestWinStreak: data.best_win_streak || 0,
      totalWinnings: parseFloat(data.total_winnings || "0"),
    };
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return null;
  }
}

// Backward compatibility
export const updateUserPoints = update1v1Points;
export const calculatePoints = calculate1v1Points;

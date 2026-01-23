// Helper functions for wagers system

import { supabase } from "./supabase";

export interface Wager {
  id: number;
  creator_id: string;
  opponent_id: string | null;
  amount: number;
  status: "PENDING" | "ACTIVE" | "COMPLETED" | "DISPUTED" | "CANCELLED";
  winner_id: string | null;
  escrow_address: string | null;
  transaction_signature: string | null;
  created_at: string;
  activated_at: string | null;
  completed_at: string | null;
  updated_at: string;
}

export interface UserProfile {
  id: number;
  wallet_address: string;
  cr_tag: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Create a new wager
 */
export async function createWager(
  creatorId: string,
  amount: number,
  escrowAddress: string
): Promise<{ data: Wager | null; error: any }> {
  return await supabase
    .from("wagers")
    .insert({
      creator_id: creatorId,
      amount: amount,
      escrow_address: escrowAddress,
      status: "PENDING",
    })
    .select()
    .single();
}

/**
 * Update user profile with Clash Royale tag
 */
export async function updateUserProfile(
  walletAddress: string,
  crTag: string
): Promise<{ data: UserProfile | null; error: any }> {
  // Try to update existing profile
  const { data: existing } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("wallet_address", walletAddress)
    .single();

  if (existing) {
    return await supabase
      .from("user_profiles")
      .update({ cr_tag: crTag, updated_at: new Date().toISOString() })
      .eq("wallet_address", walletAddress)
      .select()
      .single();
  } else {
    return await supabase
      .from("user_profiles")
      .insert({
        wallet_address: walletAddress,
        cr_tag: crTag,
      })
      .select()
      .single();
  }
}

/**
 * Get user profile by wallet address
 */
export async function getUserProfile(
  walletAddress: string
): Promise<{ data: UserProfile | null; error: any }> {
  return await supabase
    .from("user_profiles")
    .select("*")
    .eq("wallet_address", walletAddress)
    .single();
}

/**
 * Get wager by ID
 */
export async function getWager(
  wagerId: number
): Promise<{ data: Wager | null; error: any }> {
  return await supabase
    .from("wagers")
    .select("*")
    .eq("id", wagerId)
    .single();
}

/**
 * Get all wagers
 */
export async function getAllWagers(): Promise<{ data: Wager[] | null; error: any }> {
  return await supabase
    .from("wagers")
    .select("*")
    .order("created_at", { ascending: false });
}

/**
 * Get wagers for a specific wallet
 */
export async function getWagersForWallet(
  walletAddress: string
): Promise<{ data: Wager[] | null; error: any }> {
  return await supabase
    .from("wagers")
    .select("*")
    .or(`creator_id.eq.${walletAddress},opponent_id.eq.${walletAddress}`)
    .order("created_at", { ascending: false });
}


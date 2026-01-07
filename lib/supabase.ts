import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase URL or Anon Key is missing. Please check your .env.local file.");
}

// Always create a client, even if env vars are missing (will fail gracefully)
export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-key"
);

// Tournament signups table type
export interface TournamentSignup {
  id?: number;
  wallet_address: string;
  clash_royale_username: string;
  tier: "SQUIRE" | "WHALE" | "TGE";
  created_at?: string;
}

// Tournament configs table type
export interface TournamentConfig {
  id?: number;
  tournament_type: "SQUIRE" | "WHALE" | "TGE";
  tournament_tag: string;
  tournament_password: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}


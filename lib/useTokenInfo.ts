"use client";

import { useState, useEffect } from "react";
import { supabase } from "./supabase";

export interface TokenInfo {
  id?: number;
  token_name: string;
  token_symbol: string;
  contract_address: string;
  pump_fun_url: string | null;
  jupiter_url: string | null;
  twitter_url: string | null;
  telegram_url: string | null;
  dexscreener_url: string | null;
  website_url: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export function useTokenInfo() {
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTokenInfo = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const { data, error: supabaseError } = await supabase
          .from("token_info")
          .select("*")
          .eq("is_active", true)
          .single();

        if (supabaseError) {
          throw supabaseError;
        }

        if (data) {
          setTokenInfo(data as TokenInfo);
        }
      } catch (err: any) {
        console.error("Error fetching token info:", err);
        setError(err.message || "Failed to load token information");
        // Fallback to default values
        setTokenInfo({
          token_name: "$ELIXIR",
          token_symbol: "ELIXIR",
          contract_address: "4W7cM6SUuqhv9jp2t3jfmonXzNbDsJt5PCWqt7w1Axa2",
          pump_fun_url: "https://pump.fun/4W7cM6SUuqhv9jp2t3jfmonXzNbDsJt5PCWqt7w1Axa2",
          jupiter_url: "https://jup.ag/swap/SOL-4W7cM6SUuqhv9jp2t3jfmonXzNbDsJt5PCWqt7w1Axa2",
          twitter_url: null,
          telegram_url: null,
          dexscreener_url: "https://dexscreener.com/solana/4W7cM6SUuqhv9jp2t3jfmonXzNbDsJt5PCWqt7w1Axa2",
          website_url: null,
          is_active: true,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTokenInfo();
  }, []);

  return { tokenInfo, isLoading, error };
}


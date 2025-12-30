"use client";

import { useState, useEffect } from "react";
import { supabase } from "./supabase";

export interface TournamentConfig {
  tournament_type: "SQUIRE" | "WHALE" | "TGE";
  tournament_tag: string;
  tournament_password: string;
  is_active: boolean;
}

export function useTournamentConfig() {
  const [configs, setConfigs] = useState<Record<string, TournamentConfig>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConfigs = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const { data, error: supabaseError } = await supabase
          .from("tournament_configs")
          .select("*")
          .eq("is_active", true);

        if (supabaseError) {
          throw supabaseError;
        }

        if (data) {
          const configMap: Record<string, TournamentConfig> = {};
          data.forEach((config) => {
            configMap[config.tournament_type] = config as TournamentConfig;
          });
          setConfigs(configMap);
        }
      } catch (err: any) {
        console.error("Error fetching tournament configs:", err);
        setError(err.message || "Failed to load tournament configurations");
        // Fallback to default configs
        setConfigs({
          SQUIRE: {
            tournament_type: "SQUIRE",
            tournament_tag: "#SQUIRE2024",
            tournament_password: "SquirePass123!",
            is_active: true,
          },
          WHALE: {
            tournament_type: "WHALE",
            tournament_tag: "#WHALE2024",
            tournament_password: "WhalePass456!",
            is_active: true,
          },
          TGE: {
            tournament_type: "TGE",
            tournament_tag: "#TGE2024",
            tournament_password: "TGEPass789!",
            is_active: true,
          },
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchConfigs();
  }, []);

  return { configs, isLoading, error };
}



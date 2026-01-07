"use client";

import { useState, useEffect } from "react";
import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { RPC_ENDPOINT } from "./constants";

const DEV_WALLET = "ZvhrcR6XHRSDcb8A15vrZ89rFaHUBWGVBYY1yadY2sj";

export function usePrizePool() {
  const [balance, setBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const connection = new Connection(RPC_ENDPOINT, "confirmed");
        const publicKey = new PublicKey(DEV_WALLET);
        const balance = await connection.getBalance(publicKey);
        const solBalance = balance / LAMPORTS_PER_SOL;

        setBalance(solBalance);
      } catch (err: any) {
        console.error("Error fetching prize pool balance:", err);
        setError(err.message || "Failed to fetch prize pool");
        setBalance(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBalance();
    // Refresh every 30 seconds
    const interval = setInterval(fetchBalance, 30000);
    return () => clearInterval(interval);
  }, []);

  return { balance, isLoading, error };
}

export { DEV_WALLET };


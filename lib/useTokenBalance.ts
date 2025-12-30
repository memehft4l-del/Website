import { useEffect, useState } from "react";
import { Connection, PublicKey } from "@solana/web3.js";
import { TOKEN_MINT_ADDRESS, RPC_ENDPOINT, TIER_THRESHOLDS } from "./constants";

export type Tier = "MINNOW" | "SQUIRE" | "WHALE";

export interface TokenBalanceData {
  balance: number;
  tier: Tier;
  isLoading: boolean;
  error: string | null;
}

export function useTokenBalance(
  walletAddress: string | null | undefined
): TokenBalanceData {
  const [balance, setBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!walletAddress) {
      setBalance(0);
      setIsLoading(false);
      setError(null);
      return;
    }

    const fetchTokenBalance = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const connection = new Connection(RPC_ENDPOINT, "confirmed");
        const walletPubkey = new PublicKey(walletAddress);
        const tokenMintPubkey = new PublicKey(TOKEN_MINT_ADDRESS);

        // Get token accounts for the wallet
        const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
          walletPubkey,
          { mint: tokenMintPubkey }
        );

        if (tokenAccounts.value.length === 0) {
          setBalance(0);
          setIsLoading(false);
          return;
        }

        // Sum up all token account balances
        let totalBalance = 0;
        for (const account of tokenAccounts.value) {
          const parsedInfo = account.account.data.parsed.info;
          const tokenAmount = parsedInfo.tokenAmount.uiAmount || 0;
          totalBalance += tokenAmount;
        }

        setBalance(Math.floor(totalBalance));
      } catch (err) {
        console.error("Error fetching token balance:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch token balance"
        );
        setBalance(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTokenBalance();
  }, [walletAddress]);

  // Determine tier based on balance
  const getTier = (balance: number): Tier => {
    if (balance >= TIER_THRESHOLDS.WHALE) {
      return "WHALE";
    } else if (balance >= TIER_THRESHOLDS.SQUIRE) {
      return "SQUIRE";
    } else {
      return "MINNOW";
    }
  };

  return {
    balance,
    tier: getTier(balance),
    isLoading,
    error,
  };
}

/**
 * Next.js Client Helper for Wager Escrow
 * React hooks and utilities for frontend integration
 */

import { useWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useCallback, useState } from "react";
import { 
  createWager, 
  joinWager, 
  resolveWager, 
  getWagerAccount,
  getWagerPDA,
  WAGER_ESCROW_PROGRAM_ID,
  PLATFORM_TREASURY,
  BACKEND_AUTHORITY
} from "./wagerEscrow";
import { RPC_ENDPOINT } from "@/lib/constants";
import { AnchorProvider, BN } from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { IDL } from "./idl/wager_escrow";

// Wallet interface for AnchorProvider
interface Wallet {
  publicKey: PublicKey;
  signTransaction: (tx: any) => Promise<any>;
  signAllTransactions: (txs: any[]) => Promise<any[]>;
}

/**
 * Hook for creating a wager
 */
export function useCreateWager() {
  const { publicKey, signTransaction, sendTransaction } = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(
    async (wagerId: number, amountSol: number) => {
      if (!publicKey || !signTransaction || !sendTransaction) {
        setError("Wallet not connected");
        return null;
      }

      try {
        setLoading(true);
        setError(null);

        const connection = new Connection(RPC_ENDPOINT, "confirmed");
        
        // Create a wallet adapter compatible wallet
        const wallet = {
          publicKey,
          signTransaction,
          signAllTransactions: async (txs: Transaction[]) => {
            return Promise.all(txs.map(tx => signTransaction(tx)));
          },
        } as Wallet;

        const provider = new AnchorProvider(connection, wallet, {
          commitment: "confirmed",
        });

        const program = new Program(IDL, WAGER_ESCROW_PROGRAM_ID, provider);
        const [wagerPDA] = getWagerPDA(publicKey, wagerId);
        const amountLamports = Math.floor(amountSol * LAMPORTS_PER_SOL);

        const tx = await program.methods
          .createWager(new BN(wagerId), new BN(amountLamports))
          .accounts({
            wager: wagerPDA,
            creator: publicKey,
            systemProgram: SystemProgram.programId,
          })
          .rpc();

        return tx;
      } catch (err: any) {
        setError(err.message || "Failed to create wager");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [publicKey, signTransaction, sendTransaction]
  );

  return { create, loading, error };
}

/**
 * Hook for joining a wager
 */
export function useJoinWager() {
  const { publicKey, signTransaction, sendTransaction } = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const join = useCallback(
    async (creatorPubkey: string, wagerId: number) => {
      if (!publicKey || !signTransaction || !sendTransaction) {
        setError("Wallet not connected");
        return null;
      }

      try {
        setLoading(true);
        setError(null);

        // Use 'confirmed' commitment for Mainnet reliability
        const connection = new Connection(RPC_ENDPOINT, "confirmed");
        const creatorPubKey = new PublicKey(creatorPubkey);
        
        const wallet = {
          publicKey,
          signTransaction,
          signAllTransactions: async (txs: Transaction[]) => {
            return Promise.all(txs.map(tx => signTransaction(tx)));
          },
        } as Wallet;

        const provider = new AnchorProvider(connection, wallet, {
          commitment: "confirmed",
        });

        const program = new Program(IDL, WAGER_ESCROW_PROGRAM_ID, provider);
        const [wagerPDA] = getWagerPDA(creatorPubKey, wagerId);

        // Note: joinWager doesn't require fetching the account first
        // The program verifies opponent sends same amount as creator

        const tx = await program.methods
          .joinWager()
          .accounts({
            wager: wagerPDA,
            opponent: publicKey,
            systemProgram: SystemProgram.programId,
          })
          .rpc();

        return tx;
      } catch (err: any) {
        setError(err.message || "Failed to join wager");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [publicKey, signTransaction, sendTransaction]
  );

  return { join, loading, error };
}

/**
 * Hook for fetching wager account data
 */
export function useWagerAccount(creatorPubkey: string | null, wagerId: number | null) {
  const [wagerData, setWagerData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!creatorPubkey || wagerId === null) {
      setWagerData(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

        // Use 'confirmed' commitment for Mainnet reliability
        const connection = new Connection(RPC_ENDPOINT, "confirmed");
        const creatorPubKey = new PublicKey(creatorPubkey);
        
        const data = await getWagerAccount(connection, creatorPubKey, wagerId);
      setWagerData(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch wager");
      setWagerData(null);
    } finally {
      setLoading(false);
    }
  }, [creatorPubkey, wagerId]);

  return { wagerData, loading, error, fetch };
}

/**
 * Get wager PDA address (for display purposes)
 */
export function useWagerPDA(creatorPubkey: string | null, wagerId: number | null) {
  if (!creatorPubkey || wagerId === null) {
    return null;
  }

  const creatorPubKey = new PublicKey(creatorPubkey);
  const [pda] = getWagerPDA(creatorPubKey, wagerId);
  return pda.toString();
}


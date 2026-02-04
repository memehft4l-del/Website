/**
 * Wager Escrow Program Client
 * Helper functions for interacting with the Clash Royale Escrow program
 */

import { Program, AnchorProvider, BN } from "@coral-xyz/anchor";
import { Connection, PublicKey, Keypair, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { IDL } from "./idl/wager_escrow";

// Wallet interface for AnchorProvider
interface Wallet {
  publicKey: PublicKey;
  signTransaction: (tx: any) => Promise<any>;
  signAllTransactions: (txs: any[]) => Promise<any[]>;
}

// Program ID - Devnet deployed program ID
export const WAGER_ESCROW_PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_WAGER_ESCROW_PROGRAM_ID || 
  "CA4ADsMYjuCQMsGfHuxHzcn4s6VuiQCtT49MGCLANEvb" // Devnet Program ID
);

// Platform treasury address (update with your actual treasury address)
export const PLATFORM_TREASURY = new PublicKey(
  "YourPlatformTreasuryAddressHere111111111111111111111111"
);

// Backend authority (your Supabase service wallet)
export const BACKEND_AUTHORITY = new PublicKey(
  "YourBackendAuthorityAddressHere111111111111111111111111"
);

/**
 * Get the PDA (Program Derived Address) for a wager
 */
export function getWagerPDA(
  creator: PublicKey,
  wagerId: number,
  programId: PublicKey = WAGER_ESCROW_PROGRAM_ID
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from("wager"),
      creator.toBuffer(),
      Buffer.from(wagerId.toString().padStart(8, "0")),
    ],
    programId
  );
}

/**
 * Create a new wager
 */
export async function createWager(
  connection: Connection,
  creator: Keypair,
  wagerId: number,
  amountSol: number
): Promise<string> {
  // Use 'confirmed' commitment for Mainnet reliability
  const wallet: Wallet = {
    publicKey: creator.publicKey,
    signTransaction: async (tx: any) => {
      tx.sign(creator);
      return tx;
    },
    signAllTransactions: async (txs: any[]) => {
      return txs.map(tx => {
        tx.sign(creator);
        return tx;
      });
    },
  };
  const provider = new AnchorProvider(connection, wallet as any, { commitment: "confirmed" });
  const program = new Program(IDL as any, WAGER_ESCROW_PROGRAM_ID, provider);

  const [wagerPDA] = getWagerPDA(creator.publicKey, wagerId);
  const amountLamports = Math.floor(amountSol * LAMPORTS_PER_SOL);

  const tx = await program.methods
    .createWager(new BN(wagerId), new BN(amountLamports))
    .accounts({
      wager: wagerPDA,
      creator: creator.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .signers([creator])
    .rpc();

  return tx;
}

/**
 * Join an existing wager
 */
export async function joinWager(
  connection: Connection,
  opponent: Keypair,
  creatorPubkey: PublicKey,
  wagerId: number
): Promise<string> {
  // Use 'confirmed' commitment for Mainnet reliability
  const wallet: Wallet = {
    publicKey: opponent.publicKey,
    signTransaction: async (tx: any) => {
      tx.sign(opponent);
      return tx;
    },
    signAllTransactions: async (txs: any[]) => {
      return txs.map(tx => {
        tx.sign(opponent);
        return tx;
      });
    },
  };
  const provider = new AnchorProvider(connection, wallet as any, { commitment: "confirmed" });
  const program = new Program(IDL as any, WAGER_ESCROW_PROGRAM_ID, provider);

  const [wagerPDA] = getWagerPDA(creatorPubkey, wagerId);

  // Note: Amount is stored in the wager account, but we don't need to fetch it
  // The joinWager instruction doesn't require amount as parameter
  // The program will verify the opponent sends the same amount as creator

  const tx = await program.methods
    .joinWager()
    .accounts({
      wager: wagerPDA,
      opponent: opponent.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .signers([opponent])
    .rpc();

  return tx;
}

/**
 * Resolve wager (only backend authority can call)
 */
export async function resolveWager(
  connection: Connection,
  backendAuthority: Keypair,
  creatorPubkey: PublicKey,
  wagerId: number,
  winnerPubkey: PublicKey,
  platformTreasury: PublicKey = PLATFORM_TREASURY
): Promise<string> {
  // Use 'confirmed' commitment for Mainnet reliability
  const wallet: Wallet = {
    publicKey: backendAuthority.publicKey,
    signTransaction: async (tx: any) => {
      tx.sign(backendAuthority);
      return tx;
    },
    signAllTransactions: async (txs: any[]) => {
      return txs.map(tx => {
        tx.sign(backendAuthority);
        return tx;
      });
    },
  };
  const provider = new AnchorProvider(connection, wallet as any, { commitment: "confirmed" });
  const program = new Program(IDL as any, WAGER_ESCROW_PROGRAM_ID, provider);

  const [wagerPDA] = getWagerPDA(creatorPubkey, wagerId);

  const tx = await program.methods
    .resolveWager(winnerPubkey)
    .accounts({
      wager: wagerPDA,
      winner: winnerPubkey,
      platformTreasury: platformTreasury,
      creator: creatorPubkey,
      backendAuthority: backendAuthority.publicKey,
    })
    .signers([backendAuthority])
    .rpc();

  return tx;
}

/**
 * Get wager account data
 */
export async function getWagerAccount(
  connection: Connection,
  creatorPubkey: PublicKey,
  wagerId: number
) {
  // Use 'confirmed' commitment for Mainnet reliability
  const provider = new AnchorProvider(
    connection,
    { publicKey: PublicKey.default, signTransaction: async () => ({} as any), signAllTransactions: async () => [] },
    { commitment: "confirmed" }
  );
  const program = new Program(IDL, WAGER_ESCROW_PROGRAM_ID, provider);

  const [wagerPDA] = getWagerPDA(creatorPubkey, wagerId);

  try {
    const wagerAccount: any = await (program.account as any).Wager.fetch(wagerPDA);
    return {
      creator: wagerAccount.creator.toString(),
      opponent: wagerAccount.opponent?.toString() || null,
      amount: Number(wagerAccount.amount) / LAMPORTS_PER_SOL,
      status: wagerAccount.status,
      winner: wagerAccount.winner?.toString() || null,
      wagerId: Number(wagerAccount.wagerId),
    };
  } catch (error) {
    return null;
  }
}

/**
 * Wager status enum
 */
export enum WagerStatus {
  Created = "Created",
  Active = "Active",
  Resolved = "Resolved",
}


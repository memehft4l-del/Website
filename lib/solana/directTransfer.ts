// Direct SOL transfer to admin wallet (no smart contract)

import { Connection, PublicKey, SystemProgram, Transaction, sendAndConfirmTransaction, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import { RPC_ENDPOINT, ADMIN_WALLET_ADDRESS } from "@/lib/constants";

/**
 * Send SOL directly to admin wallet
 */
export async function sendToAdminWallet(
  fromPublicKey: PublicKey,
  amount: number, // Amount in SOL
  signTransaction: (tx: Transaction) => Promise<Transaction>
): Promise<string> {
  try {
    const connection = new Connection(RPC_ENDPOINT, "confirmed");
    const adminPubkey = new PublicKey(ADMIN_WALLET_ADDRESS);

    // Convert SOL to lamports
    const lamports = amount * LAMPORTS_PER_SOL;

    // Check balance
    const balance = await connection.getBalance(fromPublicKey);
    if (balance < lamports) {
      throw new Error("Insufficient balance");
    }

    // Create transfer instruction
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: fromPublicKey,
        toPubkey: adminPubkey,
        lamports: lamports,
      })
    );

    // Get recent blockhash
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = fromPublicKey;

    // Sign and send transaction
    const signedTx = await signTransaction(transaction);
    const signature = await connection.sendRawTransaction(signedTx.serialize());

    // Wait for confirmation
    await connection.confirmTransaction(signature, "confirmed");

    return signature;
  } catch (error: any) {
    console.error("Error sending SOL to admin wallet:", error);
    throw error;
  }
}



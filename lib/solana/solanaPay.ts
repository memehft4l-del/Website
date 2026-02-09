/**
 * Solana Pay Link Generator
 * Creates payment links that open wallet apps directly
 */

import { ADMIN_WALLET_ADDRESS } from "@/lib/constants";

/**
 * Generate a Solana Pay link for payment
 * Format: solana:<recipient>?amount=<lamports>&reference=<reference>
 */
export function generateSolanaPayLink(
  amount: number, // Amount in SOL
  reference?: string // Optional reference (wager ID, etc.)
): string {
  const lamports = Math.floor(amount * 1_000_000_000); // Convert SOL to lamports
  
  const params = new URLSearchParams({
    amount: lamports.toString(),
  });
  
  if (reference) {
    params.append("reference", reference);
  }
  
  return `solana:${ADMIN_WALLET_ADDRESS}?${params.toString()}`;
}

/**
 * Generate a Solana Pay QR code URL
 */
export function generateSolanaPayQRUrl(
  amount: number,
  reference?: string
): string {
  const link = generateSolanaPayLink(amount, reference);
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(link)}`;
}


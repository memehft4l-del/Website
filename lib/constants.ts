// Token Mint Address - Use environment variable or placeholder
// To set your token: Create .env.local file with NEXT_PUBLIC_TOKEN_MINT_ADDRESS=YOUR_TOKEN_ADDRESS
export const TOKEN_MINT_ADDRESS =
  process.env.NEXT_PUBLIC_TOKEN_MINT_ADDRESS ||
  "So11111111111111111111111111111111111111112"; // Placeholder: SOL mint address (replace with your $ELIXIR token address)

// RPC Endpoint - Use environment variable or fallback to Devnet RPC
// To use Helius Devnet: Create .env.local file with NEXT_PUBLIC_RPC_ENDPOINT=https://devnet.helius-rpc.com/?api-key=YOUR_KEY
// Or get a free API key from: https://www.helius.dev/
export const RPC_ENDPOINT =
  process.env.NEXT_PUBLIC_RPC_ENDPOINT ||
  "https://api.devnet.solana.com"; // Devnet RPC

// Wager Escrow Program ID (Devnet)
export const WAGER_ESCROW_PROGRAM_ID =
  process.env.NEXT_PUBLIC_WAGER_ESCROW_PROGRAM_ID ||
  "CA4ADsMYjuCQMsGfHuxHzcn4s6VuiQCtT49MGCLANEvb";

// Devnet RPC for backend operations (use Helius for reliability)
export const DEVNET_RPC_ENDPOINT =
  process.env.NEXT_PUBLIC_RPC_ENDPOINT ||
  "https://api.devnet.solana.com";

// Wager amount options
// Devnet: 0.10 SOL increments (for testing)
// Production: 0.10 SOL increments from 0.1 to 10.0 SOL
export const WAGER_AMOUNTS = {
  DEVNET: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.5, 2.0, 2.5, 3.0, 4.0, 5.0],
  PRODUCTION: [
    0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0,
    1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 2.0,
    2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 3.0,
    3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 4.0,
    4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 5.0,
    5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9, 6.0,
    6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9, 7.0,
    7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9, 8.0,
    8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8, 8.9, 9.0,
    9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8, 9.9, 10.0
  ],
};

// Check if we're in production mode (Mainnet)
export const IS_PRODUCTION = process.env.NEXT_PUBLIC_SOLANA_NETWORK === "mainnet-beta";

// Get available wager amounts based on environment
export const getAvailableWagerAmounts = () => {
  return IS_PRODUCTION ? WAGER_AMOUNTS.PRODUCTION : WAGER_AMOUNTS.DEVNET;
};

// Default wager amount (0.1 SOL)
export const DEFAULT_WAGER_AMOUNT = 0.1;

// Tier Thresholds
export const TIER_THRESHOLDS = {
  MINNOW: 0,
  SQUIRE: 500_000,
  WHALE: 2_500_000,
} as const;

// Maximum tokens for Elixir Bar (15 million)
export const MAX_ELIXIR_TOKENS = 15_000_000;

// Tournament Configuration
export interface TournamentConfig {
  squireArena: {
    tag: string;
    password: string;
  };
  whaleWar: {
    tag: string;
    password: string;
  };
}

export const TOURNAMENT_CONFIG: TournamentConfig = {
  squireArena: {
    tag: "#SQUIRE2024",
    password: "SquirePass123!",
  },
  whaleWar: {
    tag: "#WHALE2024",
    password: "WhalePass456!",
  },
};

// Prize Pool (hardcoded for now)
export const PRIZE_POOL = "150 SOL";

// Stuck match timeout (60 minutes in milliseconds)
export const STUCK_MATCH_TIMEOUT = 60 * 60 * 1000; // 60 minutes

// Admin wallet address (receives all escrow funds)
export const ADMIN_WALLET_ADDRESS =
  process.env.NEXT_PUBLIC_ADMIN_WALLET_ADDRESS ||
  "ZvhrcR6XHRSDcb8A15vrZ89rFaHUBWGVBYY1yadY2sj"; // Default admin wallet

// Points system configuration
export const POINTS_CONFIG = {
  WIN: 100, // Points for winning a match
  LOSS: 10, // Points for losing (participation)
  STREAK_BONUS: 50, // Bonus points per win streak
  MAX_STREAK_BONUS: 500, // Maximum streak bonus
};

// Clash Royale API Proxy URL (Railway deployment)
export const CLASH_ROYALE_PROXY_URL =
  process.env.NEXT_PUBLIC_CLASH_ROYALE_PROXY_URL || "https://api-production-0e8d.up.railway.app";

// Solscan base URL (determines cluster based on network)
export const getSolscanUrl = (signature: string): string => {
  const cluster = IS_PRODUCTION ? "" : "?cluster=devnet";
  return `https://solscan.io/tx/${signature}${cluster}`;
};

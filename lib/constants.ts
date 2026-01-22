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
  "Boj5LmCSvrNMzJ9mdbTEf2vMZ1HnabZb2p3KHxyQgcDY";

// Devnet RPC for backend operations (use Helius for reliability)
export const DEVNET_RPC_ENDPOINT =
  process.env.NEXT_PUBLIC_RPC_ENDPOINT ||
  "https://api.devnet.solana.com";

// Wager amount options
// Devnet: 0.001 SOL (default for testing)
// Production: 0.25 SOL increments
export const WAGER_AMOUNTS = {
  DEVNET: [0.001],
  PRODUCTION: [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0],
};

// Check if we're in production mode (Mainnet)
export const IS_PRODUCTION = process.env.NEXT_PUBLIC_SOLANA_NETWORK === "mainnet-beta";

// Get available wager amounts based on environment
export const getAvailableWagerAmounts = () => {
  return IS_PRODUCTION ? WAGER_AMOUNTS.PRODUCTION : WAGER_AMOUNTS.DEVNET;
};

// Default wager amount (0.001 SOL for Devnet)
export const DEFAULT_WAGER_AMOUNT = 0.001;

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

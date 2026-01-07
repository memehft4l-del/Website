// Token Mint Address - Use environment variable or placeholder
// To set your token: Create .env.local file with NEXT_PUBLIC_TOKEN_MINT_ADDRESS=YOUR_TOKEN_ADDRESS
export const TOKEN_MINT_ADDRESS =
  process.env.NEXT_PUBLIC_TOKEN_MINT_ADDRESS ||
  "So11111111111111111111111111111111111111112"; // Placeholder: SOL mint address (replace with your $ELIXIR token address)

// RPC Endpoint - Use environment variable or fallback to free public RPC
// To use Helius: Create .env.local file with NEXT_PUBLIC_RPC_ENDPOINT=https://mainnet.helius-rpc.com/?api-key=YOUR_KEY
// Or get a free API key from: https://www.helius.dev/
export const RPC_ENDPOINT =
  process.env.NEXT_PUBLIC_RPC_ENDPOINT ||
  "https://api.mainnet-beta.solana.com"; // Free public Solana RPC (rate limited)

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

// Clash Royale API integration
// Official API: https://developer.clashroyale.com/

const CLASH_ROYALE_API_BASE = "https://api.clashroyale.com/v1";

export interface ClashRoyalePlayer {
  tag: string;
  name: string;
  expLevel: number;
  trophies: number;
  bestTrophies: number;
  wins: number;
  losses: number;
  battleCount: number;
  threeCrownWins: number;
  challengeCardsWon: number;
  challengeMaxWins: number;
  tournamentCardsWon: number;
  tournamentBattleCount: number;
  role: string;
  donations: number;
  donationsReceived: number;
  totalDonations: number;
  warDayWins: number;
  clanCardsCollected: number;
  clan: {
    tag: string;
    name: string;
    badgeId: number;
  } | null;
  arena: {
    id: number;
    name: string;
  };
  leagueStatistics: {
    currentSeason: {
      trophies: number;
      bestTrophies: number;
    };
    previousSeason: {
      trophies: number;
      bestTrophies: number;
    };
    bestSeason: {
      trophies: number;
      bestTrophies: number;
    };
  } | null;
  badges: Array<{
    name: string;
    progress: number;
    target: number;
    level: number;
    maxLevel: number;
  }>;
  achievements: Array<{
    name: string;
    stars: number;
    value: number;
    target: number;
    info: string;
  }>;
  cards: Array<{
    name: string;
    id: number;
    level: number;
    maxLevel: number;
    count: number;
    iconUrls: {
      medium: string;
    };
  }>;
  currentDeck: Array<{
    name: string;
    id: number;
    level: number;
    maxLevel: number;
    count: number;
    iconUrls: {
      medium: string;
    };
  }>;
  currentFavouriteCard: {
    name: string;
    id: number;
    maxLevel: number;
    iconUrls: {
      medium: string;
    };
  };
  starPoints: number;
  expPoints: number;
}

export interface TournamentSignupWithStats {
  id: number;
  wallet_address: string;
  clash_royale_username: string;
  tier: "SQUIRE" | "WHALE";
  created_at: string;
  playerStats?: ClashRoyalePlayer | null;
  statsError?: string;
}

/**
 * Convert Clash Royale username/tag to API format
 * Tags need to be URL encoded (e.g., #ABC123 becomes %23ABC123)
 */
export function formatPlayerTag(tagOrUsername: string): string {
  // Remove any # symbols and ensure uppercase
  let tag = tagOrUsername.replace(/#/g, "").toUpperCase();
  // Add # prefix if not present
  if (!tag.startsWith("#")) {
    tag = "#" + tag;
  }
  // URL encode the #
  return encodeURIComponent(tag);
}

/**
 * Fetch player stats from Clash Royale API via Next.js API route
 * This avoids CORS issues by proxying through our server
 */
export async function fetchPlayerStats(
  playerTag: string
): Promise<ClashRoyalePlayer | null> {
  try {
    // Format the tag for the API route
    let formattedTag = playerTag.replace(/#/g, "").toUpperCase();
    if (!formattedTag.startsWith("#")) {
      formattedTag = "#" + formattedTag;
    }
    
    // Use our API route to proxy the request
    const response = await fetch(`/api/clash-royale/player/${encodeURIComponent(formattedTag)}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
      
      if (response.status === 404) {
        throw new Error("Player not found. Please check the player tag.");
      }
      
      throw new Error(errorData.error || `API error: ${response.status}`);
    }

    const data = await response.json();
    return data as ClashRoyalePlayer;
  } catch (error: any) {
    console.error("Error fetching Clash Royale player stats:", error);
    throw error;
  }
}


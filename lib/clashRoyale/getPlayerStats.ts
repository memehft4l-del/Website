/**
 * Fetch Clash Royale Player Stats
 * 
 * Fetches player information from Clash Royale API via Railway proxy
 * Returns key stats like trophies, wins, losses, etc.
 */

import { CLASH_ROYALE_PROXY_URL } from "@/lib/constants";

export interface PlayerStats {
  tag: string;
  name: string;
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
  level: number;
  expLevel: number;
  arena?: {
    id: number;
    name: string;
  };
  leagueStatistics?: {
    currentSeason: {
      trophies: number;
      bestTrophies: number;
    };
    previousSeason: {
      id: string;
      trophies: number;
      bestTrophies: number;
    };
  };
}

export async function getPlayerStats(
  playerTag: string,
  proxyUrl: string = CLASH_ROYALE_PROXY_URL
): Promise<PlayerStats | null> {
  try {
    // Format tag (remove # if present, ensure uppercase)
    const formatTag = (tag: string): string => {
      const cleaned = tag.replace(/^#/, "").toUpperCase();
      return cleaned;
    };

    const tag = formatTag(playerTag);
    
    // Call Railway proxy to get player data
    const playerUrl = `${proxyUrl}/players/${encodeURIComponent(`%23${tag}`)}`;
    
    const response = await fetch(playerUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("Player not found. Please check the player tag.");
      }
      if (response.status === 403) {
        // Try to get more details from the response
        let errorDetails = "";
        let errorMessage = "";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorData.reason || "";
          errorDetails = errorData.message || errorData.error || errorData.reason || "";
        } catch {
          // If response isn't JSON, use status text
          errorDetails = response.statusText;
        }
        
        // Provide more helpful error message based on the error
        if (errorMessage.toLowerCase().includes("authorization") || errorMessage.toLowerCase().includes("invalid")) {
          throw new Error(
            `API authorization failed. The Clash Royale API key on the proxy server may be invalid or expired. ` +
            `Please contact support to update the API key.`
          );
        }
        
        throw new Error(
          `API access denied (403). ${errorDetails ? `Reason: ${errorDetails}` : "This may be due to an invalid API key or rate limiting."} ` +
          `Please contact support if this issue persists.`
        );
      }
      if (response.status === 429) {
        throw new Error("Rate limit exceeded. Please wait a moment and try again.");
      }
      throw new Error(`Failed to fetch player data: ${response.status} ${response.statusText}`);
    }

    const playerData = await response.json();
    
    // Map API response to our PlayerStats interface
    return {
      tag: playerData.tag || `#${tag}`,
      name: playerData.name || "Unknown",
      trophies: playerData.trophies || 0,
      bestTrophies: playerData.bestTrophies || 0,
      wins: playerData.wins || 0,
      losses: playerData.losses || 0,
      battleCount: playerData.battleCount || 0,
      threeCrownWins: playerData.threeCrownWins || 0,
      challengeCardsWon: playerData.challengeCardsWon || 0,
      challengeMaxWins: playerData.challengeMaxWins || 0,
      tournamentCardsWon: playerData.tournamentCardsWon || 0,
      tournamentBattleCount: playerData.tournamentBattleCount || 0,
      role: playerData.role || "",
      donations: playerData.donations || 0,
      donationsReceived: playerData.donationsReceived || 0,
      totalDonations: playerData.totalDonations || 0,
      warDayWins: playerData.warDayWins || 0,
      clanCardsCollected: playerData.clanCardsCollected || 0,
      level: playerData.expLevel || playerData.level || 0,
      expLevel: playerData.expLevel || 0,
      arena: playerData.arena,
      leagueStatistics: playerData.leagueStatistics,
    };
  } catch (error: any) {
    console.error("Error fetching player stats:", error);
    throw new Error(`Failed to fetch player stats: ${error.message}`);
  }
}


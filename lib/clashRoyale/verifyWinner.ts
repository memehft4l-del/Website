/**
 * Verify Winner Function
 * 
 * Calls the Railway proxy to get battle logs and determines the winner
 * of a 1v1 match between two players.
 * 
 * @param playerATag - Clash Royale tag of player A (e.g., "#ABC123")
 * @param playerBTag - Clash Royale tag of player B (e.g., "#XYZ789")
 * @param proxyUrl - URL of your Railway proxy (e.g., "https://your-railway-url.app")
 * @returns The winning player's tag or "Match Not Found" if no recent match exists
 */

interface BattleLogEntry {
  type: string;
  battleTime: string;
  gameMode: {
    id: number;
    name: string;
  };
  opponent: Array<{
    tag: string;
    name: string;
    startingTrophies: number;
    trophyChange: number;
    crowns: number;
  }>;
  team: Array<{
    tag: string;
    name: string;
    startingTrophies: number;
    trophyChange: number;
    crowns: number;
  }>;
}

interface BattleLogResponse {
  items: BattleLogEntry[];
}

export async function verifyWinner(
  playerATag: string,
  playerBTag: string,
  proxyUrl: string = process.env.NEXT_PUBLIC_CLASH_ROYALE_PROXY_URL || ""
): Promise<string> {
  try {
    // Format tags (remove # if present, ensure uppercase)
    const formatTag = (tag: string): string => {
      const cleaned = tag.replace(/^#/, "").toUpperCase();
      return cleaned;
    };

    const tagA = formatTag(playerATag);
    const tagB = formatTag(playerBTag);

    // Call Railway proxy to get Player A's battle log
    const battleLogUrl = `${proxyUrl}/battlelog/${encodeURIComponent(`#${tagA}`)}`;
    
    const response = await fetch(battleLogUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch battle log: ${response.status} ${response.statusText}`);
    }

    const battleLog: BattleLogResponse = await response.json();

    // Search through the last 25 matches for a match between Player A and Player B
    // The battle log returns the most recent matches first
    for (const battle of battleLog.items) {
      // Check if Player B is in the opponent array
      const opponentTags = battle.opponent.map((p) => p.tag.replace(/^#/, "").toUpperCase());
      const teamTags = battle.team.map((p) => p.tag.replace(/^#/, "").toUpperCase());

      // Check if Player A is in team and Player B is in opponent
      const playerAInTeam = teamTags.includes(tagA);
      const playerBInOpponent = opponentTags.includes(tagB);

      if (playerAInTeam && playerBInOpponent) {
        // Found a match! Compare crowns to determine winner
        const teamCrowns = battle.team.reduce((sum, p) => sum + (p.crowns || 0), 0);
        const opponentCrowns = battle.opponent.reduce((sum, p) => sum + (p.crowns || 0), 0);

        if (teamCrowns > opponentCrowns) {
          // Player A (team) won
          return `#${tagA}`;
        } else if (opponentCrowns > teamCrowns) {
          // Player B (opponent) won
          return `#${tagB}`;
        } else {
          // Tie (shouldn't happen in 1v1, but handle it)
          return "Tie";
        }
      }

      // Also check reverse: Player B in team, Player A in opponent
      const playerBInTeam = teamTags.includes(tagB);
      const playerAInOpponent = opponentTags.includes(tagA);

      if (playerBInTeam && playerAInOpponent) {
        // Found a match! Compare crowns to determine winner
        const teamCrowns = battle.team.reduce((sum, p) => sum + (p.crowns || 0), 0);
        const opponentCrowns = battle.opponent.reduce((sum, p) => sum + (p.crowns || 0), 0);

        if (teamCrowns > opponentCrowns) {
          // Player B (team) won
          return `#${tagB}`;
        } else if (opponentCrowns > teamCrowns) {
          // Player A (opponent) won
          return `#${tagA}`;
        } else {
          // Tie
          return "Tie";
        }
      }
    }

    // No match found between the two players in the last 25 matches
    return "Match Not Found";
  } catch (error: any) {
    console.error("Error verifying winner:", error);
    throw new Error(`Failed to verify winner: ${error.message}`);
  }
}


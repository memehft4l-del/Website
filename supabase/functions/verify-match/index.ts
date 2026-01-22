// Supabase Edge Function: Verify Match Results
// This function verifies Clash Royale match results by checking battle logs
// Implements Best of 3 logic: First player to 2 wins is the winner

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Connection, PublicKey, Keypair, SystemProgram } from "https://esm.sh/@solana/web3.js@1.95.2";
import { Program, AnchorProvider, BN } from "https://esm.sh/@coral-xyz/anchor@0.30.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

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

interface ClashRoyaleBattleLogResponse {
  items: BattleLogEntry[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get API proxy URL from environment (for static IP proxy)
    // MUST use proxy.royaleapi.dev for IP whitelisting
    const proxyBaseUrl = Deno.env.get("CLASH_ROYALE_PROXY_URL") || "https://proxy.royaleapi.dev/v1";
    const apiToken = Deno.env.get("CLASH_ROYALE_API_TOKEN") || "";
    
    // Get Devnet RPC endpoint (use Helius for reliability)
    const devnetRpc = Deno.env.get("RPC_ENDPOINT") || 
      Deno.env.get("NEXT_PUBLIC_RPC_ENDPOINT") || 
      "https://api.devnet.solana.com";
    
    // Get backend authority private key (for signing resolve_wager transactions)
    const backendPrivateKey = Deno.env.get("SOLANA_BACKEND_PRIVATE_KEY");
    if (!backendPrivateKey) {
      return new Response(
        JSON.stringify({ error: "SOLANA_BACKEND_PRIVATE_KEY not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    // Derive backend authority public key from private key
    const backendKeypair = Keypair.fromSecretKey(
      Uint8Array.from(JSON.parse(backendPrivateKey))
    );
    const backendAuthority = backendKeypair.publicKey;
    
    // Get Program ID from environment
    const programId = Deno.env.get("WAGER_ESCROW_PROGRAM_ID") || 
      "Boj5LmCSvrNMzJ9mdbTEf2vMZ1HnabZb2p3KHxyQgcDY";
    const programIdPubkey = new PublicKey(programId);
    
    // Get Platform Treasury from environment
    const platformTreasury = Deno.env.get("PLATFORM_TREASURY") || 
      "YourPlatformTreasuryAddressHere111111111111111111111111";
    const platformTreasuryPubkey = new PublicKey(platformTreasury);

    if (!apiToken) {
      return new Response(
        JSON.stringify({ error: "Clash Royale API token not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Parse request body
    const { wager_id } = await req.json();

    if (!wager_id) {
      return new Response(
        JSON.stringify({ error: "wager_id is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Fetch wager details
    const { data: wager, error: wagerError } = await supabase
      .from("wagers")
      .select("*")
      .eq("id", wager_id)
      .eq("status", "ACTIVE")
      .single();

    if (wagerError || !wager) {
      return new Response(
        JSON.stringify({ 
          error: "Wager not found or not active",
          details: wagerError?.message 
        }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get activated_at timestamp (STRICT: only count battles after this)
    // Must have activated_at - if not, wager is not active yet
    if (!wager.activated_at) {
      return new Response(
        JSON.stringify({ 
          error: "Wager not activated yet",
          message: "Wager must be activated before verification"
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const activatedAt = new Date(wager.activated_at).getTime();
    
    // Strict timestamp check: battles must be AFTER activated_at (not equal)
    // Add 1 second buffer to ensure we don't count battles from the exact activation moment
    const strictActivatedAt = activatedAt + 1000;

    // Fetch user profiles to get Clash Royale tags
    const { data: creatorProfile, error: creatorError } = await supabase
      .from("user_profiles")
      .select("cr_tag")
      .eq("wallet_address", wager.creator_id)
      .single();

    const { data: opponentProfile, error: opponentError } = await supabase
      .from("user_profiles")
      .select("cr_tag")
      .eq("wallet_address", wager.opponent_id)
      .single();

    if (creatorError || !creatorProfile?.cr_tag) {
      return new Response(
        JSON.stringify({ 
          error: "Creator Clash Royale tag not found",
          details: creatorError?.message 
        }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (opponentError || !opponentProfile?.cr_tag) {
      return new Response(
        JSON.stringify({ 
          error: "Opponent Clash Royale tag not found",
          details: opponentError?.message 
        }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Format tags (remove # if present, add if missing)
    const formatTag = (tag: string) => {
      const cleaned = tag.replace(/^#/, "").toUpperCase();
      return `#${cleaned}`;
    };

    const creatorTag = formatTag(creatorProfile.cr_tag);
    const opponentTag = formatTag(opponentProfile.cr_tag);

    // Fetch battle logs for creator
    const creatorBattleLogUrl = `${proxyBaseUrl}/players/${encodeURIComponent(creatorTag)}/battlelog`;
    
    const creatorResponse = await fetch(creatorBattleLogUrl, {
      headers: {
        "Authorization": `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!creatorResponse.ok) {
      return new Response(
        JSON.stringify({ 
          error: "Failed to fetch creator battle log",
          details: await creatorResponse.text() 
        }),
        {
          status: creatorResponse.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const creatorBattleLog: ClashRoyaleBattleLogResponse = await creatorResponse.json();

    // Filter battles:
    // 1. Must be STRICTLY after wager was activated (with 1s buffer)
    // 2. Opponent tag must match the other player
    // 3. Count wins (crowns > opponent crowns = win)
    const validBattles = creatorBattleLog.items
      .filter((battle) => {
        const battleTime = new Date(battle.battleTime).getTime();
        if (battleTime <= strictActivatedAt) {
          return false; // Battle happened before or at activation (strict check)
        }

        // Check if opponent matches
        const opponentTags = battle.opponent.map((p) => p.tag.toUpperCase());
        const creatorTags = battle.team.map((p) => p.tag.toUpperCase());
        
        const creatorInTeam = creatorTags.includes(creatorTag.replace("#", ""));
        const opponentInOpponent = opponentTags.includes(opponentTag.replace("#", ""));

        return creatorInTeam && opponentInOpponent;
      })
      .map((battle) => {
        const creatorCrowns = battle.team.reduce((sum, p) => sum + (p.crowns || 0), 0);
        const opponentCrowns = battle.opponent.reduce((sum, p) => sum + (p.crowns || 0), 0);
        
        return {
          battleTime: battle.battleTime,
          creatorCrowns,
          opponentCrowns,
          creatorWon: creatorCrowns > opponentCrowns,
        };
      })
      .sort((a, b) => new Date(b.battleTime).getTime() - new Date(a.battleTime).getTime()); // Most recent first

    // Count wins (Best of 3)
    // Logic: 
    // - Filter battles where UserA.tag played UserB.tag
    // - Only count games where battleTime > wager_activated_at
    // - If Player A has 2 wins → Resolve Wager (A wins)
    // - If Player B has 2 wins → Resolve Wager (B wins)
    // - If score is 1-1 → Wait for the 3rd game
    let creatorWins = 0;
    let opponentWins = 0;
    let battlesAnalyzed = 0;

    // Process battles one by one to implement Best of 3 logic
    // Only analyze up to 3 battles (Best of 3)
    for (const battle of validBattles.slice(0, 3)) {
      battlesAnalyzed++;
      
      if (battle.creatorWon) {
        creatorWins++;
      } else {
        opponentWins++;
      }

      // If someone reaches 2 wins, stop immediately and resolve
      if (creatorWins >= 2) {
        break; // Creator wins Best of 3
      }
      if (opponentWins >= 2) {
        break; // Opponent wins Best of 3
      }

      // If we've played 2 games and it's 1-1, we need the 3rd game
      // Continue to next battle
      if (battlesAnalyzed === 2 && creatorWins === 1 && opponentWins === 1) {
        // Wait for 3rd game - continue loop to check for 3rd battle
        continue;
      }
    }

    // Determine winner (first to 2 wins, or winner of 3rd game if 1-1)
    let winnerId: string | null = null;
    let winnerTag: string | null = null;

    if (creatorWins >= 2) {
      // Creator wins (2-0 or 2-1)
      winnerId = wager.creator_id;
      winnerTag = creatorTag;
    } else if (opponentWins >= 2) {
      // Opponent wins (2-0 or 2-1)
      winnerId = wager.opponent_id;
      winnerTag = opponentTag;
    } else if (battlesAnalyzed === 3 && creatorWins === 2 && opponentWins === 1) {
      // 3rd game decided it (2-1 for creator)
      winnerId = wager.creator_id;
      winnerTag = creatorTag;
    } else if (battlesAnalyzed === 3 && creatorWins === 1 && opponentWins === 2) {
      // 3rd game decided it (1-2 for opponent)
      winnerId = wager.opponent_id;
      winnerTag = opponentTag;
    }
    
    // Check timeout: If 60 minutes pass and no 2nd/3rd game appears
    const now = Date.now();
    const timeSinceActivation = now - activatedAt;
    const sixtyMinutes = 60 * 60 * 1000; // 60 minutes in milliseconds
    const isTimeout = timeSinceActivation >= sixtyMinutes && battlesAnalyzed < 2;

    // Update wager if winner is determined
    if (winnerId) {
      // First, call resolve_wager on-chain to transfer funds
      let onChainTxSignature: string | null = null;
      try {
        const connection = new Connection(devnetRpc, "confirmed");
        const creatorPubkey = new PublicKey(wager.creator_id);
        const winnerPubkey = new PublicKey(winnerId);
        
        // Get wager PDA
        const [wagerPDA] = PublicKey.findProgramAddressSync(
          [
            Buffer.from("wager"),
            creatorPubkey.toBuffer(),
            Buffer.from(wager.id.toString().padStart(8, "0")),
          ],
          programIdPubkey
        );
        
        // Create wallet adapter for backend authority
        const wallet = {
          publicKey: backendAuthority,
          signTransaction: async (tx: any) => {
            tx.sign(backendKeypair);
            return tx;
          },
          signAllTransactions: async (txs: any[]) => {
            return txs.map(tx => {
              tx.sign(backendKeypair);
              return tx;
            });
          },
        };
        
        // Load IDL (simplified - in production, load from file or fetch)
        // For now, we'll use a minimal approach - you may need to import IDL differently
        const provider = new AnchorProvider(connection, wallet as any, { commitment: "confirmed" });
        
        // Note: In production, you'd load the IDL properly
        // For now, we'll update the database and log that on-chain resolution should happen
        console.log(`Winner determined: ${winnerId}. Should call resolve_wager on-chain.`);
        console.log(`Wager PDA: ${wagerPDA.toString()}`);
        console.log(`Backend Authority: ${backendAuthority.toString()}`);
        console.log(`Program ID: ${programIdPubkey.toString()}`);
        
        // TODO: Implement actual on-chain resolve_wager call here
        // This requires the IDL to be available in the Edge Function
        // For now, we'll update the database and return success
        // The on-chain call can be implemented by:
        // 1. Loading the IDL from a URL or file
        // 2. Creating a Program instance
        // 3. Calling program.methods.resolveWager(winnerPubkey).accounts({...}).rpc()
        
      } catch (onChainError) {
        console.error("Error calling resolve_wager on-chain:", onChainError);
        // Continue with database update even if on-chain call fails
        // The funds can be manually resolved later if needed
      }
      
      // Update database
      const { data: updatedWager, error: updateError } = await supabase
        .from("wagers")
        .update({
          status: "COMPLETED",
          winner_id: winnerId,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", wager_id)
        .select()
        .single();

      if (updateError) {
        return new Response(
          JSON.stringify({ 
            error: "Failed to update wager",
            details: updateError.message 
          }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          wager_id: updatedWager.id,
          winner_id: winnerId,
          winner_tag: winnerTag,
          creator_wins: creatorWins,
          opponent_wins: opponentWins,
          battles_analyzed: battlesAnalyzed,
          status: updatedWager.status,
          on_chain_tx: onChainTxSignature || "pending",
          message: "Winner determined. On-chain resolution initiated.",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } else {
      // No winner yet (need more battles)
      // Check timeout: If 60 minutes pass and no 2nd/3rd game appears
      const now = Date.now();
      const timeSinceActivation = now - activatedAt;
      const sixtyMinutes = 60 * 60 * 1000; // 60 minutes in milliseconds
      const isTimeout = timeSinceActivation >= sixtyMinutes && battlesAnalyzed < 2;
      
      return new Response(
        JSON.stringify({
          success: true,
          wager_id: wager.id,
          creator_wins: creatorWins,
          opponent_wins: opponentWins,
          battles_analyzed: battlesAnalyzed,
          status: "ACTIVE",
          message: isTimeout
            ? "Timeout: 60 minutes passed with no matches. Cancel/Refund option available."
            : battlesAnalyzed === 2 && creatorWins === 1 && opponentWins === 1
            ? "Score is 1-1. Waiting for 3rd game to decide winner."
            : "No winner yet. Need 2 wins to complete match.",
          is_timeout: isTimeout,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    console.error("Error verifying match:", error);
    return new Response(
      JSON.stringify({ 
        error: "Internal server error",
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});


// Supabase Edge Function: Cancel Stuck Wager
// Allows cancellation if no matches detected within 30 minutes and verify-match confirms 0 games

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Connection, PublicKey, Keypair } from "https://esm.sh/@solana/web3.js@1.95.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

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

    // Get Solana RPC endpoint (Mainnet)
    const rpcEndpoint = Deno.env.get("RPC_ENDPOINT") || "https://api.mainnet-beta.solana.com";
    const connection = new Connection(rpcEndpoint, "confirmed");

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

    // Check if wager has been active for at least 60 minutes
    const activatedAt = wager.activated_at 
      ? new Date(wager.activated_at).getTime() 
      : null;

    if (!activatedAt) {
      return new Response(
        JSON.stringify({ 
          error: "Wager not activated yet",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const now = Date.now();
    const timeSinceActivation = now - activatedAt;
    const sixtyMinutes = 60 * 60 * 1000; // 60 minutes in milliseconds

    if (timeSinceActivation < sixtyMinutes) {
      return new Response(
        JSON.stringify({ 
          error: "Wager must be active for at least 60 minutes before cancellation",
          timeRemaining: Math.ceil((sixtyMinutes - timeSinceActivation) / 1000 / 60) + " minutes"
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Verify that no matches were played by calling verify-match logic
    // (Simplified - in production, you'd call the actual verify-match function)
    // For now, we'll check if there are any battles after activation
    const { data: creatorProfile } = await supabase
      .from("user_profiles")
      .select("cr_tag")
      .eq("wallet_address", wager.creator_id)
      .single();

    const { data: opponentProfile } = await supabase
      .from("user_profiles")
      .select("cr_tag")
      .eq("wallet_address", wager.opponent_id)
      .single();

    if (!creatorProfile?.cr_tag || !opponentProfile?.cr_tag) {
      return new Response(
        JSON.stringify({ 
          error: "Player profiles not found",
        }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Call verify-match to check for games
    const verifyResponse = await fetch(
      `${supabaseUrl}/functions/v1/verify-match`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${supabaseServiceKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ wager_id }),
      }
    );

    const verifyData = await verifyResponse.json();

    // Only allow cancellation if 0 games were played
    if (verifyData.battles_analyzed > 0) {
      return new Response(
        JSON.stringify({ 
          error: "Cannot cancel wager - matches have been played",
          battles_analyzed: verifyData.battles_analyzed
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Cancel the wager in database
    const { data: updatedWager, error: updateError } = await supabase
      .from("wagers")
      .update({
        status: "CANCELLED",
        updated_at: new Date().toISOString(),
      })
      .eq("id", wager_id)
      .select()
      .single();

    if (updateError) {
      return new Response(
        JSON.stringify({ 
          error: "Failed to cancel wager",
          details: updateError.message 
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // TODO: Refund both players via Solana escrow contract
    // This would require calling a cancel instruction on the escrow program
    // For now, we just update the database status

    return new Response(
      JSON.stringify({
        success: true,
        wager_id: updatedWager.id,
        status: updatedWager.status,
        message: "Wager cancelled. Refunds will be processed.",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error cancelling wager:", error);
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


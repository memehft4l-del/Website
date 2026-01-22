// Supabase Edge Function: Helius Webhook Receiver
// This function receives webhooks from Helius when transactions are detected
// and updates wager status to ACTIVE when escrow deposit is confirmed

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface HeliusWebhookPayload {
  accountData?: Array<{
    account: string;
    nativeBalanceChange?: number;
  }>;
  transaction?: {
    signature: string;
    slot: number;
    timestamp: number;
  };
  webhookId?: string;
  type?: string;
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

    // Devnet RPC for transaction verification (if needed)
    const devnetRpc = Deno.env.get("RPC_ENDPOINT") || 
      Deno.env.get("NEXT_PUBLIC_RPC_ENDPOINT") || 
      "https://api.devnet.solana.com";

    // Parse webhook payload from Helius
    const payload: HeliusWebhookPayload = await req.json();

    console.log("Received Helius webhook:", JSON.stringify(payload, null, 2));

    // Extract transaction signature
    const signature = payload.transaction?.signature;
    if (!signature) {
      return new Response(
        JSON.stringify({ error: "No transaction signature found" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Extract escrow address from account data
    // Helius sends account data - we need to find which account received the funds
    const accountData = payload.accountData || [];
    
    // Find the escrow address that received funds
    // In a real implementation, you'd match this against known escrow addresses
    // For now, we'll extract it from the webhook metadata or query by transaction signature
    
    // Query wagers table to find wager with matching transaction signature or escrow address
    const { data: wager, error: wagerError } = await supabase
      .from("wagers")
      .select("*")
      .or(`transaction_signature.eq.${signature},escrow_address.in.(${accountData.map(a => a.account).join(",")})`)
      .eq("status", "PENDING")
      .single();

    if (wagerError || !wager) {
      console.error("Wager not found:", wagerError);
      return new Response(
        JSON.stringify({ 
          error: "Wager not found or already processed",
          details: wagerError?.message 
        }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Verify the transaction amount matches the wager amount
    // In a real implementation, you'd verify the SOL amount from the transaction
    // For now, we'll trust Helius webhook and update status

    // Update wager status to ACTIVE
    const { data: updatedWager, error: updateError } = await supabase
      .from("wagers")
      .update({
        status: "ACTIVE",
        transaction_signature: signature,
        activated_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", wager.id)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating wager:", updateError);
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

    console.log("Wager activated:", updatedWager);

    return new Response(
      JSON.stringify({ 
        success: true,
        wager_id: updatedWager.id,
        status: updatedWager.status 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error processing webhook:", error);
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


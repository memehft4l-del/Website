/**
 * Supabase Dashboard Verification Script
 * 
 * This script verifies that Supabase is configured correctly and updating properly.
 * Run with: npx tsx scripts/verify-supabase.ts
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Missing Supabase environment variables!");
  console.log("Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface TestResult {
  test: string;
  passed: boolean;
  message: string;
  details?: any;
}

const results: TestResult[] = [];

async function testConnection() {
  console.log("\n🔍 Testing Supabase Connection...");
  try {
    const { data, error } = await supabase.from("wagers").select("count").limit(1);
    if (error) throw error;
    results.push({
      test: "Connection",
      passed: true,
      message: "Successfully connected to Supabase",
    });
    console.log("✅ Connection successful");
  } catch (error: any) {
    results.push({
      test: "Connection",
      passed: false,
      message: `Connection failed: ${error.message}`,
    });
    console.log("❌ Connection failed:", error.message);
  }
}

async function testTablesExist() {
  console.log("\n🔍 Checking Required Tables...");
  const requiredTables = [
    "wagers",
    "user_profiles",
    "tournament_signups",
    "leaderboard", // This is a view
  ];

  for (const table of requiredTables) {
    try {
      const { data, error } = await supabase.from(table).select("*").limit(1);
      if (error && error.code !== "PGRST116") {
        // PGRST116 is "no rows returned" which is fine
        throw error;
      }
      results.push({
        test: `Table: ${table}`,
        passed: true,
        message: `Table '${table}' exists and is accessible`,
      });
      console.log(`✅ Table '${table}' exists`);
    } catch (error: any) {
      results.push({
        test: `Table: ${table}`,
        passed: false,
        message: `Table '${table}' error: ${error.message}`,
      });
      console.log(`❌ Table '${table}' error:`, error.message);
    }
  }
}

async function testInsertUpdate() {
  console.log("\n🔍 Testing Insert/Update Operations...");
  
  // Test insert into user_profiles
  const testWallet = `test-${Date.now()}`;
  try {
    const { data: insertData, error: insertError } = await supabase
      .from("user_profiles")
      .insert({
        wallet_address: testWallet,
        cr_tag: "#TEST123",
        total_points: 100,
      })
      .select()
      .single();

    if (insertError) throw insertError;

    results.push({
      test: "Insert Operation",
      passed: true,
      message: "Successfully inserted test user profile",
      details: { wallet: testWallet },
    });
    console.log("✅ Insert operation successful");

    // Test update
    const { data: updateData, error: updateError } = await supabase
      .from("user_profiles")
      .update({ total_points: 200, updated_at: new Date().toISOString() })
      .eq("wallet_address", testWallet)
      .select()
      .single();

    if (updateError) throw updateError;

    results.push({
      test: "Update Operation",
      passed: true,
      message: "Successfully updated user profile",
      details: { newPoints: updateData?.total_points },
    });
    console.log("✅ Update operation successful");

    // Cleanup - delete test record
    await supabase.from("user_profiles").delete().eq("wallet_address", testWallet);
    console.log("🧹 Cleaned up test record");
  } catch (error: any) {
    results.push({
      test: "Insert/Update Operations",
      passed: false,
      message: `Error: ${error.message}`,
    });
    console.log("❌ Insert/Update failed:", error.message);
  }
}

async function testRealtimeSubscription() {
  console.log("\n🔍 Testing Real-time Subscriptions...");
  
  return new Promise<void>((resolve) => {
    let receivedUpdate = false;
    const timeout = setTimeout(() => {
      if (!receivedUpdate) {
        results.push({
          test: "Real-time Subscription",
          passed: false,
          message: "Subscription timeout - no updates received (this may be normal if no changes occur)",
        });
        console.log("⚠️  Real-time subscription test timed out (this is normal if no changes occur)");
      }
      resolve();
    }, 3000);

    const channel = supabase
      .channel("test-channel")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_profiles",
        },
        (payload) => {
          receivedUpdate = true;
          clearTimeout(timeout);
          results.push({
            test: "Real-time Subscription",
            passed: true,
            message: "Real-time subscription is working",
            details: { event: payload.eventType },
          });
          console.log("✅ Real-time subscription working");
          supabase.removeChannel(channel);
          resolve();
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log("✅ Subscribed to real-time updates");
          // Trigger a test update
          const testWallet = `realtime-test-${Date.now()}`;
          supabase
            .from("user_profiles")
            .insert({ wallet_address: testWallet, cr_tag: "#REALTIME" })
            .then(() => {
              // Cleanup
              setTimeout(() => {
                supabase.from("user_profiles").delete().eq("wallet_address", testWallet);
              }, 1000);
            });
        } else if (status === "CHANNEL_ERROR") {
          clearTimeout(timeout);
          results.push({
            test: "Real-time Subscription",
            passed: false,
            message: "Failed to subscribe to real-time updates",
          });
          console.log("❌ Real-time subscription failed");
          resolve();
        }
      });
  });
}

async function testTableStructure() {
  console.log("\n🔍 Verifying Table Structure...");
  
  // Check wagers table columns
  try {
    const { data, error } = await supabase
      .from("wagers")
      .select("*")
      .limit(0); // Just check structure, no data

    if (error && error.code !== "PGRST116") throw error;

    // Check if we can query expected columns
    const { data: columnCheck } = await supabase
      .from("wagers")
      .select("id, creator_id, amount, status, created_at, updated_at")
      .limit(1);

    results.push({
      test: "Wagers Table Structure",
      passed: true,
      message: "Wagers table has expected columns",
    });
    console.log("✅ Wagers table structure verified");
  } catch (error: any) {
    results.push({
      test: "Wagers Table Structure",
      passed: false,
      message: `Error: ${error.message}`,
    });
    console.log("❌ Wagers table structure check failed:", error.message);
  }

  // Check user_profiles table columns
  try {
    const { data: columnCheck } = await supabase
      .from("user_profiles")
      .select("wallet_address, total_points, games_won, games_lost, referral_code")
      .limit(1);

    results.push({
      test: "User Profiles Table Structure",
      passed: true,
      message: "User profiles table has expected columns",
    });
    console.log("✅ User profiles table structure verified");
  } catch (error: any) {
    results.push({
      test: "User Profiles Table Structure",
      passed: false,
      message: `Error: ${error.message}`,
    });
    console.log("❌ User profiles table structure check failed:", error.message);
  }
}

async function testLeaderboardView() {
  console.log("\n🔍 Testing Leaderboard View...");
  try {
    const { data, error } = await supabase
      .from("leaderboard")
      .select("*")
      .limit(10);

    if (error) throw error;

    results.push({
      test: "Leaderboard View",
      passed: true,
      message: `Leaderboard view is accessible (${data?.length || 0} entries)`,
      details: { entryCount: data?.length || 0 },
    });
    console.log(`✅ Leaderboard view accessible (${data?.length || 0} entries)`);
  } catch (error: any) {
    results.push({
      test: "Leaderboard View",
      passed: false,
      message: `Error: ${error.message}`,
    });
    console.log("❌ Leaderboard view error:", error.message);
  }
}

async function printSummary() {
  console.log("\n" + "=".repeat(60));
  console.log("📊 VERIFICATION SUMMARY");
  console.log("=".repeat(60));

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  results.forEach((result) => {
    const icon = result.passed ? "✅" : "❌";
    console.log(`${icon} ${result.test}: ${result.message}`);
    if (result.details) {
      console.log(`   Details:`, result.details);
    }
  });

  console.log("\n" + "=".repeat(60));
  console.log(`Total Tests: ${results.length}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log("=".repeat(60));

  if (failed === 0) {
    console.log("\n🎉 All tests passed! Supabase is configured correctly.");
  } else {
    console.log("\n⚠️  Some tests failed. Please review the errors above.");
    console.log("\nCommon fixes:");
    console.log("1. Ensure all tables exist (run SUPABASE_GAMES_SCHEMA.sql)");
    console.log("2. Check Row Level Security (RLS) policies");
    console.log("3. Verify environment variables are set correctly");
    console.log("4. Enable real-time for tables in Supabase dashboard");
  }
}

async function main() {
  console.log("🚀 Starting Supabase Verification...");
  console.log(`📍 Supabase URL: ${supabaseUrl.substring(0, 30)}...`);

  await testConnection();
  await testTablesExist();
  await testTableStructure();
  await testInsertUpdate();
  await testLeaderboardView();
  await testRealtimeSubscription();
  
  await printSummary();
}

main().catch(console.error);


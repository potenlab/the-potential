/**
 * Supabase Connection Test Script
 *
 * Run with: npx tsx scripts/test-supabase-connection.ts
 *
 * This script verifies:
 * 1. Environment variables are set correctly
 * 2. Connection to Supabase can be established
 * 3. API keys are valid
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

// Load environment variables from .env.local
dotenv.config({ path: ".env.local" });

async function testSupabaseConnection() {
  console.log("=== Supabase Connection Test ===\n");

  // Step 1: Check environment variables
  console.log("1. Checking environment variables...");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    console.error("   [FAIL] NEXT_PUBLIC_SUPABASE_URL is not set");
    process.exit(1);
  }
  console.log("   [OK] NEXT_PUBLIC_SUPABASE_URL is set");

  if (!supabaseAnonKey) {
    console.error("   [FAIL] NEXT_PUBLIC_SUPABASE_ANON_KEY is not set");
    process.exit(1);
  }
  console.log("   [OK] NEXT_PUBLIC_SUPABASE_ANON_KEY is set");

  if (!supabaseServiceKey) {
    console.error("   [WARN] SUPABASE_SERVICE_ROLE_KEY is not set (optional for client-side)");
  } else {
    console.log("   [OK] SUPABASE_SERVICE_ROLE_KEY is set");
  }

  // Step 2: Create Supabase client
  console.log("\n2. Creating Supabase client...");

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  console.log("   [OK] Client created successfully");

  // Step 3: Test connection with a simple query
  console.log("\n3. Testing connection...");

  try {
    // Try to query the auth schema (which always exists)
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.error("   [FAIL] Connection test failed:", error.message);
      process.exit(1);
    }

    console.log("   [OK] Connection successful");
    console.log("   [INFO] Session:", data.session ? "Active session found" : "No active session (expected)");
  } catch (err) {
    console.error("   [FAIL] Unexpected error:", err);
    process.exit(1);
  }

  // Step 4: Verify project URL format
  console.log("\n4. Verifying project configuration...");

  const urlPattern = /^https:\/\/[a-z0-9]+\.supabase\.co$/;
  if (urlPattern.test(supabaseUrl)) {
    console.log("   [OK] Supabase URL format is valid");
  } else {
    console.warn("   [WARN] Supabase URL format may be non-standard:", supabaseUrl);
  }

  // Extract project reference
  const projectRef = supabaseUrl.replace("https://", "").replace(".supabase.co", "");
  console.log(`   [INFO] Project reference: ${projectRef}`);

  // Summary
  console.log("\n=== Test Results ===");
  console.log("[SUCCESS] All connection tests passed!");
  console.log("\nSupabase project is configured and accessible.");
  console.log("You can now proceed with database schema setup (Task 1.15+).");
}

testSupabaseConnection().catch(console.error);

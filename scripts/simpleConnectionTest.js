#!/usr/bin/env node

/**
 * Simple Supabase Connection Test
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, "../.env") });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log("\n🔍 Simple Supabase Connection Test\n");
console.log("=".repeat(60));

// Check env variables
console.log("\n📋 Configuration:");
console.log(`   URL: ${supabaseUrl}`);
console.log(
  `   Key: ${supabaseKey ? supabaseKey.substring(0, 40) + "..." : "NOT SET"}`
);

if (!supabaseUrl || !supabaseKey) {
  console.log("\n❌ Missing environment variables!");
  process.exit(1);
}

// Create client
console.log("\n🔌 Creating Supabase client...");
const supabase = createClient(supabaseUrl, supabaseKey);
console.log("   ✅ Client created");

// Test 1: Auth session
console.log("\n1️⃣  Testing Auth System:");
try {
  const { data: sessionData, error: sessionError } =
    await supabase.auth.getSession();
  if (sessionError) {
    console.log(`   ⚠️  Session error: ${sessionError.message}`);
  } else {
    console.log("   ✅ Auth system is accessible");
    if (sessionData.session) {
      console.log(`   📧 Active session: ${sessionData.session.user.email}`);
    } else {
      console.log("   ℹ️  No active session (not logged in)");
    }
  }
} catch (err) {
  console.log(`   ❌ Auth test failed: ${err.message}`);
}

// Test 2: Try to list tables
console.log("\n2️⃣  Testing Database Access:");
const tablesToCheck = ["profiles", "saved_analyses"];

for (const table of tablesToCheck) {
  try {
    const { data, error, count } = await supabase
      .from(table)
      .select("*", { count: "exact", head: true });

    if (error) {
      if (error.code === "42P01" || error.message.includes("does not exist")) {
        console.log(`   ⚠️  Table "${table}" does not exist`);
        console.log(`   💡 Run supabase_schema.sql in Supabase SQL Editor`);
      } else if (
        error.code === "PGRST116" ||
        error.message.includes("no rows")
      ) {
        console.log(`   ✅ Table "${table}" exists (empty)`);
      } else {
        console.log(`   ⚠️  Table "${table}": ${error.message || error.code}`);
        console.log(`      Error details:`, error);
      }
    } else {
      console.log(`   ✅ Table "${table}" exists with ${count || 0} rows`);
    }
  } catch (err) {
    console.log(`   ❌ Error checking "${table}": ${err.message}`);
  }
}

// Test 3: Check if RLS is enabled
console.log("\n3️⃣  Checking Row Level Security:");
try {
  // Try to insert without auth (should fail if RLS is working)
  const { error: insertError } = await supabase
    .from("profiles")
    .insert({
      id: "00000000-0000-0000-0000-000000000000",
      email: "test@test.com",
    });

  if (insertError) {
    if (
      insertError.code === "42501" ||
      insertError.message.includes("policy")
    ) {
      console.log(
        "   ✅ Row Level Security is enabled (cannot insert without auth)"
      );
    } else if (insertError.code === "42P01") {
      console.log("   ⚠️  Tables not created yet");
    } else {
      console.log(`   ℹ️  Insert blocked: ${insertError.message}`);
    }
  } else {
    console.log("   ⚠️  RLS might not be configured (insert succeeded)");
  }
} catch (err) {
  console.log(`   ℹ️  ${err.message}`);
}

console.log("\n" + "=".repeat(60));
console.log("\n✅ Connection test complete!");
console.log("\n💡 Next steps:");
console.log("   1. If tables don't exist, run supabase_schema.sql");
console.log(
  "   2. Go to https://supabase.com/dashboard/project/" +
    supabaseUrl.split("//")[1].split(".")[0]
);
console.log("   3. Navigate to SQL Editor and run the schema");
console.log("\n");

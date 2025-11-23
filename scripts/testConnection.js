#!/usr/bin/env node

/**
 * Quick Supabase Connection Test
 * Run this with: node scripts/testConnection.js
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

console.log("\n🔍 Supabase Connection Test\n");
console.log("=".repeat(50));

// Step 1: Check env variables
console.log("\n1️⃣  Environment Variables:");
if (!supabaseUrl || supabaseUrl === "your-project-url.supabase.co") {
  console.log("   ❌ VITE_SUPABASE_URL not set");
  process.exit(1);
} else {
  console.log(`   ✅ URL: ${supabaseUrl}`);
}

if (!supabaseKey || supabaseKey === "your-anon-key") {
  console.log("   ❌ VITE_SUPABASE_ANON_KEY not set");
  process.exit(1);
} else {
  console.log(`   ✅ Key: ${supabaseKey.substring(0, 40)}...`);
}

// Step 2: Initialize client
console.log("\n2️⃣  Initializing Supabase Client:");
const supabase = createClient(supabaseUrl, supabaseKey);
console.log("   ✅ Client created");

// Step 3: Test connection
console.log("\n3️⃣  Testing Connection:");
try {
  const { data, error } = await supabase
    .from("profiles")
    .select("count", { count: "exact", head: true });

  if (error) {
    console.log(`   ℹ️  Error object:`, JSON.stringify(error, null, 2));
    if (
      error.message &&
      (error.message.includes("relation") ||
        error.message.includes("does not exist"))
    ) {
      console.log("   ⚠️  Connected, but tables need to be created");
      console.log("   💡 Run the schema from supabase_schema.sql");
    } else if (error.code === "42P01") {
      console.log("   ⚠️  Connected, but tables don't exist");
      console.log("   💡 Run supabase_schema.sql in Supabase SQL Editor");
    } else {
      console.log(
        `   ❌ Error: ${error.message || error.code || "Unknown error"}`
      );
      console.log("   Full error:", error);
      process.exit(1);
    }
  } else {
    console.log("   ✅ Successfully connected to database");
  }
} catch (err) {
  console.log(`   ❌ Connection failed: ${err.message}`);
  process.exit(1);
}

// Step 4: Test auth
console.log("\n4️⃣  Testing Authentication:");
try {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.log(`   ❌ Auth error: ${error.message}`);
  } else {
    console.log("   ✅ Auth system working");
    if (data.session) {
      console.log(`   📧 Logged in as: ${data.session.user.email}`);
    }
  }
} catch (err) {
  console.log(`   ❌ Auth check failed: ${err.message}`);
}

// Step 5: Check tables
console.log("\n5️⃣  Checking Database Schema:");
try {
  const { error: profilesError } = await supabase
    .from("profiles")
    .select("id")
    .limit(1);

  if (profilesError) {
    if (
      profilesError.message.includes("relation") ||
      profilesError.message.includes("does not exist")
    ) {
      console.log('   ❌ "profiles" table not found');
      console.log("   💡 Go to Supabase Dashboard → SQL Editor");
      console.log("   💡 Run the contents of supabase_schema.sql");
    } else {
      console.log(`   ⚠️  Profiles table: ${profilesError.message}`);
    }
  } else {
    console.log('   ✅ "profiles" table exists');
  }

  const { error: analysesError } = await supabase
    .from("saved_analyses")
    .select("id")
    .limit(1);

  if (analysesError) {
    if (
      analysesError.message.includes("relation") ||
      analysesError.message.includes("does not exist")
    ) {
      console.log('   ❌ "saved_analyses" table not found');
    } else {
      console.log(`   ⚠️  Saved analyses table: ${analysesError.message}`);
    }
  } else {
    console.log('   ✅ "saved_analyses" table exists');
  }
} catch (err) {
  console.log(`   ❌ Schema check failed: ${err.message}`);
}

console.log("\n" + "=".repeat(50));
console.log("\n✨ Test Complete!\n");
console.log("📝 Next Steps for Vercel:");
console.log("   1. Go to https://vercel.com/dashboard");
console.log("   2. Select your project");
console.log("   3. Settings → Environment Variables");
console.log("   4. Add:");
console.log(`      VITE_SUPABASE_URL = ${supabaseUrl}`);
console.log(
  `      VITE_SUPABASE_ANON_KEY = ${supabaseKey.substring(0, 40)}...`
);
console.log("   5. Redeploy your site\n");

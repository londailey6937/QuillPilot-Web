#!/usr/bin/env node

/**
 * Supabase Credential Helper
 *
 * This script helps you find and verify your Supabase credentials.
 */

import * as dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, "../.env") });

console.log("\n🔐 Supabase Credential Helper\n");
console.log("=".repeat(70));

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;

console.log("\n📋 Current Configuration:\n");

// URL Check
console.log("1️⃣  VITE_SUPABASE_URL:");
if (!url) {
  console.log("   ❌ NOT SET");
} else if (url === "your-project-url.supabase.co") {
  console.log("   ⚠️  Still has placeholder value");
} else if (url.includes(".supabase.co")) {
  console.log(`   ✅ ${url}`);
  const projectRef = url.split("//")[1]?.split(".")[0];
  console.log(`   📍 Project Reference: ${projectRef}`);
} else {
  console.log(`   ⚠️  Unusual format: ${url}`);
}

// Key Check
console.log("\n2️⃣  VITE_SUPABASE_ANON_KEY:");
if (!key) {
  console.log("   ❌ NOT SET");
} else if (key === "your-anon-key") {
  console.log("   ⚠️  Still has placeholder value");
} else {
  // Check if it's a valid JWT format (should have 3 parts separated by dots)
  const parts = key.split(".");
  console.log(`   Length: ${key.length} characters`);
  console.log(`   Parts: ${parts.length} (should be 3 for JWT)`);

  if (parts.length === 3) {
    console.log(`   ✅ Valid JWT format`);
    console.log(`   First part: ${parts[0].substring(0, 40)}...`);
    console.log(`   Last part length: ${parts[2].length} chars`);

    // The signature part should be fairly long
    if (parts[2].length < 20) {
      console.log(`   ⚠️  WARNING: Signature part seems too short!`);
      console.log(`   💡 Your key might be truncated in the .env file`);
    }
  } else {
    console.log(`   ⚠️  Not a valid JWT format`);
    console.log(`   💡 Should have 3 parts separated by dots`);
  }
}

console.log("\n" + "=".repeat(70));
console.log("\n📖 How to get the correct credentials:\n");
console.log("1. Go to: https://supabase.com/dashboard");
console.log("2. Select your project");
console.log("3. Click on Settings (⚙️) in the sidebar");
console.log("4. Click on 'API' in the settings menu");
console.log("5. Under 'Project API keys', find:");
console.log("   • Project URL (starts with https://xxxxx.supabase.co)");
console.log("   • anon public key (long JWT token starting with eyJ...)");
console.log("\n💾 Update your .env file:\n");
console.log("   VITE_SUPABASE_URL=https://your-project.supabase.co");
console.log("   VITE_SUPABASE_ANON_KEY=eyJ... (the complete key)");
console.log("\n⚠️  IMPORTANT: Make sure to copy the ENTIRE key!");
console.log("   The anon key should be around 300-400 characters long.");
console.log("\n");

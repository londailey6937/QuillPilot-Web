/**
 * Supabase Connection Verification Script
 *
 * This script helps verify that:
 * 1. Environment variables are properly set
 * 2. Supabase client can connect
 * 3. Authentication works
 * 4. Database queries work
 */

import { supabase } from "../src/utils/supabase";

async function verifyConnection() {
  console.log("\n🔍 Verifying Supabase Connection...\n");

  // Step 1: Check environment variables
  console.log("1️⃣  Checking Environment Variables:");
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || supabaseUrl === "") {
    console.error("   ❌ VITE_SUPABASE_URL is not set or empty");
    console.log("   💡 Add it to your Vercel environment variables");
    return false;
  } else {
    console.log(
      `   ✅ VITE_SUPABASE_URL is set: ${supabaseUrl.substring(0, 30)}...`
    );
  }

  if (!supabaseAnonKey || supabaseAnonKey === "") {
    console.error("   ❌ VITE_SUPABASE_ANON_KEY is not set or empty");
    console.log("   💡 Add it to your Vercel environment variables");
    return false;
  } else {
    console.log(
      `   ✅ VITE_SUPABASE_ANON_KEY is set: ${supabaseAnonKey.substring(
        0,
        30
      )}...`
    );
  }

  // Step 2: Test basic connection
  console.log("\n2️⃣  Testing Supabase Connection:");
  try {
    const { data, error } = await supabase
      .from("users")
      .select("count", { count: "exact", head: true });

    if (error) {
      console.error("   ❌ Connection failed:", error.message);
      if (error.message.includes("JWT")) {
        console.log("   💡 Your anon key might be invalid or expired");
      }
      if (
        error.message.includes("relation") ||
        error.message.includes("does not exist")
      ) {
        console.log(
          "   💡 The 'users' table doesn't exist. Have you run the schema?"
        );
      }
      return false;
    } else {
      console.log("   ✅ Successfully connected to Supabase");
    }
  } catch (err: any) {
    console.error("   ❌ Connection error:", err.message);
    return false;
  }

  // Step 3: Test authentication capability
  console.log("\n3️⃣  Testing Authentication Setup:");
  try {
    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();

    if (sessionError) {
      console.error("   ❌ Auth check failed:", sessionError.message);
      return false;
    }

    if (sessionData.session) {
      console.log("   ✅ User is currently signed in");
      console.log(`   📧 Email: ${sessionData.session.user.email}`);
    } else {
      console.log("   ℹ️  No user currently signed in (this is normal)");
      console.log("   ✅ Authentication system is ready");
    }
  } catch (err: any) {
    console.error("   ❌ Auth error:", err.message);
    return false;
  }

  // Step 4: Test database schema
  console.log("\n4️⃣  Testing Database Schema:");
  try {
    // Check if users table exists
    const { error: usersError } = await supabase
      .from("users")
      .select("id")
      .limit(1);

    if (usersError) {
      if (
        usersError.message.includes("relation") ||
        usersError.message.includes("does not exist")
      ) {
        console.error("   ❌ 'users' table not found");
        console.log(
          "   💡 Run the schema from supabase_schema.sql in Supabase SQL Editor"
        );
        return false;
      } else {
        console.error("   ❌ Users table error:", usersError.message);
        return false;
      }
    } else {
      console.log("   ✅ 'users' table exists and is accessible");
    }

    // Check if saved_analyses table exists
    const { error: analysesError } = await supabase
      .from("saved_analyses")
      .select("id")
      .limit(1);

    if (analysesError) {
      if (
        analysesError.message.includes("relation") ||
        analysesError.message.includes("does not exist")
      ) {
        console.error("   ❌ 'saved_analyses' table not found");
        console.log(
          "   💡 Run the schema from supabase_schema.sql in Supabase SQL Editor"
        );
        return false;
      } else {
        console.error(
          "   ❌ Saved analyses table error:",
          analysesError.message
        );
        return false;
      }
    } else {
      console.log("   ✅ 'saved_analyses' table exists and is accessible");
    }
  } catch (err: any) {
    console.error("   ❌ Schema verification error:", err.message);
    return false;
  }

  // Success summary
  console.log(
    "\n✨ All checks passed! Your Supabase connection is working properly.\n"
  );
  console.log("📋 Next steps:");
  console.log("   • Test user signup/signin in your app");
  console.log("   • Verify analysis saving works");
  console.log("   • Check Supabase dashboard for data\n");

  return true;
}

// Run verification
verifyConnection()
  .then((success) => {
    if (!success) {
      console.log("\n❌ Verification failed. Check the errors above.\n");
      console.log("📖 Troubleshooting tips:");
      console.log("   1. Verify environment variables in Vercel:");
      console.log("      - Go to your Vercel project settings");
      console.log("      - Navigate to Environment Variables");
      console.log(
        "      - Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set"
      );
      console.log("   2. Verify database schema:");
      console.log("      - Go to Supabase dashboard → SQL Editor");
      console.log("      - Run the contents of supabase_schema.sql");
      console.log("   3. Check Supabase project status:");
      console.log("      - Ensure your project is not paused");
      console.log("      - Verify the URL and keys are correct\n");
      process.exit(1);
    } else {
      process.exit(0);
    }
  })
  .catch((err) => {
    console.error("\n💥 Unexpected error:", err);
    process.exit(1);
  });

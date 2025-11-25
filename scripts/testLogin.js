import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Error: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set in .env"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.log(
    "Usage: node --env-file=.env scripts/testLogin.js <email> <password>"
  );
  process.exit(1);
}

async function testLogin() {
  console.log(`Attempting to login with ${email}...`);

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("Login failed:", error.message);
    if (error.message.includes("Invalid login credentials")) {
      console.log(
        "This means the user does not exist OR the password is wrong."
      );
    }
  } else {
    console.log("Login successful!");
    console.log("User ID:", data.user.id);
    console.log("Email:", data.user.email);

    // Check if profile exists
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", data.user.id)
      .single();

    if (profileError) {
      console.log(
        "Warning: User exists in Auth but NOT in public.profiles table."
      );
      console.log(
        'This explains why you might not see them in your "users" table view.'
      );
    } else {
      console.log("Profile found in public.profiles table.");
    }
  }
}

testLogin();

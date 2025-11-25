import { createClient } from "@supabase/supabase-js";

// Environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

// Check if Supabase is properly configured
export const isSupabaseConfigured =
  supabaseUrl.startsWith("https://") && supabaseAnonKey.length > 20;

// Create Supabase client
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : createClient("https://placeholder.supabase.co", "placeholder-key");

// ============================================================================
// Types
// ============================================================================

export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  access_level: "free" | "premium" | "professional";
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  subscription_status?: "active" | "canceled" | "past_due" | "trialing";
  subscription_period_end?: string;
  created_at: string;
  updated_at: string;
}

export interface SavedAnalysis {
  id: string;
  user_id: string;
  file_name: string;
  chapter_text?: string;
  editor_html?: string;
  analysis_data?: any;
  domain?: string;
  is_template_mode: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Authentication Functions
// ============================================================================

/**
 * Get the current user session with timeout
 */
export const getCurrentUser = async () => {
  if (!isSupabaseConfigured) return null;

  try {
    // Add timeout to prevent infinite loading
    const sessionPromise = supabase.auth.getSession();
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Session fetch timeout")), 3000)
    );

    const result = await Promise.race([sessionPromise, timeoutPromise]);
    const {
      data: { session },
      error,
    } = result as Awaited<typeof sessionPromise>;

    if (error) throw error;
    return session?.user ?? null;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
};

/**
 * Sign up a new user
 */
export const signUp = async (
  email: string,
  password: string,
  fullName?: string
) => {
  if (!isSupabaseConfigured) {
    throw new Error(
      "Supabase is not configured. Please add credentials to your .env file."
    );
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName || "",
      },
    },
  });

  if (error) throw error;
  return data;
};

/**
 * Sign in an existing user
 */
export const signIn = async (email: string, password: string) => {
  if (!isSupabaseConfigured) {
    throw new Error(
      "Supabase is not configured. Please add credentials to your .env file."
    );
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
};

/**
 * Sign out the current user
 */
export const signOut = async () => {
  if (!isSupabaseConfigured) return;

  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

/**
 * Send password reset email
 */
export const resetPassword = async (email: string) => {
  if (!isSupabaseConfigured) {
    throw new Error(
      "Supabase is not configured. Please add credentials to your .env file."
    );
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });

  if (error) throw error;
};

// ============================================================================
// Profile Functions
// ============================================================================

/**
 * Get the current user's profile with timeout
 */
export const getUserProfile = async (): Promise<Profile | null> => {
  if (!isSupabaseConfigured) return null;

  const user = await getCurrentUser();
  if (!user) return null;

  try {
    const profilePromise = supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Profile fetch timeout")), 3000)
    );

    const result = await Promise.race([profilePromise, timeoutPromise]);
    const { data, error } = result as Awaited<typeof profilePromise>;

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching profile:", error);
    return null;
  }
};

/**
 * Update the current user's profile
 */
export const updateUserProfile = async (updates: Partial<Profile>) => {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase is not configured");
  }

  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", user.id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// ============================================================================
// Saved Analysis Functions
// ============================================================================

/**
 * Save an analysis to the database
 */
export const saveAnalysis = async (
  analysis: Omit<SavedAnalysis, "id" | "user_id" | "created_at" | "updated_at">
) => {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase is not configured");
  }

  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("saved_analyses")
    .insert({
      ...analysis,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Get all saved analyses for the current user
 */
export const getSavedAnalyses = async (): Promise<SavedAnalysis[]> => {
  if (!isSupabaseConfigured) return [];

  const user = await getCurrentUser();
  if (!user) return [];

  try {
    const { data, error } = await supabase
      .from("saved_analyses")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching analyses:", error);
    return [];
  }
};

/**
 * Delete a saved analysis
 */
export const deleteAnalysis = async (id: string) => {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase is not configured");
  }

  const { error } = await supabase.from("saved_analyses").delete().eq("id", id);

  if (error) throw error;
};

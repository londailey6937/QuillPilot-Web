import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

// Check if real credentials are configured
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

// Create a dummy client if no credentials are provided
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient("https://placeholder.supabase.co", "placeholder-key");

// Types for database tables
export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  access_level: "free" | "standard" | "professional";
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

// Helper functions
export const getCurrentUser = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
};

export const getUserProfile = async (): Promise<Profile | null> => {
  const user = await getCurrentUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) {
    console.error("Error fetching profile:", error);
    return null;
  }

  return data;
};

export const updateUserProfile = async (updates: Partial<Profile>) => {
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

export const saveAnalysis = async (
  analysis: Omit<SavedAnalysis, "id" | "user_id" | "created_at" | "updated_at">
) => {
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

export const getSavedAnalyses = async (): Promise<SavedAnalysis[]> => {
  const user = await getCurrentUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("saved_analyses")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Error fetching analyses:", error);
    return [];
  }

  return data || [];
};

export const deleteAnalysis = async (id: string) => {
  const { error } = await supabase.from("saved_analyses").delete().eq("id", id);

  if (error) throw error;
};

// Auth helpers
export const signUp = async (
  email: string,
  password: string,
  fullName?: string
) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) throw error;
  return data;
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const resetPassword = async (email: string) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });

  if (error) throw error;
};

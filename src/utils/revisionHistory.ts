// Revision History Types and Functions
import { supabase } from "./supabase";

export interface DocumentRevision {
  id: string;
  user_id: string;
  file_name: string;
  content: string;
  plain_text: string;
  word_count: number;
  created_at: string;
  note?: string;
  auto_saved: boolean;
}

export interface RevisionMetadata {
  id: string;
  file_name: string;
  word_count: number;
  created_at: string;
  note?: string;
  auto_saved: boolean;
}

/**
 * Save a new revision to Supabase
 */
export async function saveRevision(
  fileName: string,
  content: string,
  plainText: string,
  note?: string,
  autoSaved: boolean = false
): Promise<{ success: boolean; error?: string; revisionId?: string }> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    const wordCount = plainText.trim().split(/\s+/).length;

    const { data, error } = await supabase
      .from("document_revisions")
      .insert({
        user_id: user.id,
        file_name: fileName,
        content,
        plain_text: plainText,
        word_count: wordCount,
        note,
        auto_saved: autoSaved,
      })
      .select()
      .single();

    if (error) {
      console.error("Error saving revision:", error);
      return { success: false, error: error.message };
    }

    return { success: true, revisionId: data.id };
  } catch (error: any) {
    console.error("Error saving revision:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Get all revisions for the current user (metadata only)
 */
export async function getRevisionHistory(
  limit: number = 50
): Promise<{
  success: boolean;
  revisions?: RevisionMetadata[];
  error?: string;
}> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    const { data, error } = await supabase
      .from("document_revisions")
      .select("id, file_name, word_count, created_at, note, auto_saved")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching revisions:", error);
      return { success: false, error: error.message };
    }

    return { success: true, revisions: data as RevisionMetadata[] };
  } catch (error: any) {
    console.error("Error fetching revisions:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Get a specific revision with full content
 */
export async function getRevision(
  revisionId: string
): Promise<{ success: boolean; revision?: DocumentRevision; error?: string }> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    const { data, error } = await supabase
      .from("document_revisions")
      .select("*")
      .eq("id", revisionId)
      .eq("user_id", user.id)
      .single();

    if (error) {
      console.error("Error fetching revision:", error);
      return { success: false, error: error.message };
    }

    return { success: true, revision: data as DocumentRevision };
  } catch (error: any) {
    console.error("Error fetching revision:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete a revision
 */
export async function deleteRevision(
  revisionId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    const { error } = await supabase
      .from("document_revisions")
      .delete()
      .eq("id", revisionId)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error deleting revision:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error deleting revision:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete all auto-saved revisions older than specified days
 */
export async function cleanupOldAutoSaves(
  daysOld: number = 30
): Promise<{ success: boolean; deleted?: number; error?: string }> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const { data, error } = await supabase
      .from("document_revisions")
      .delete()
      .eq("user_id", user.id)
      .eq("auto_saved", true)
      .lt("created_at", cutoffDate.toISOString())
      .select();

    if (error) {
      console.error("Error cleaning up old auto-saves:", error);
      return { success: false, error: error.message };
    }

    return { success: true, deleted: data?.length || 0 };
  } catch (error: any) {
    console.error("Error cleaning up old auto-saves:", error);
    return { success: false, error: error.message };
  }
}

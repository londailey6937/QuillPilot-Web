/**
 * Cloud Sync Utility
 * Auto-save to cloud storage with Supabase integration
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";

export interface CloudDocument {
  id: string;
  user_id: string;
  title: string;
  content: string;
  html_content?: string;
  word_count: number;
  last_modified: string;
  created_at: string;
  is_synced: boolean;
}

export class CloudSync {
  private static supabase: SupabaseClient | null = null;
  private static syncInterval: NodeJS.Timeout | null = null;
  private static readonly SYNC_INTERVAL_MS = 60000; // 1 minute

  /**
   * Initialize Supabase client
   */
  static initialize(supabaseUrl: string, supabaseKey: string): void {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * Check if cloud sync is available
   */
  static isAvailable(): boolean {
    return this.supabase !== null;
  }

  /**
   * Save document to cloud
   */
  static async saveToCloud(
    documentId: string,
    title: string,
    content: string,
    htmlContent: string,
    wordCount: number
  ): Promise<boolean> {
    if (!this.supabase) {
      console.error("Cloud sync not initialized");
      return false;
    }

    try {
      const {
        data: { user },
      } = await this.supabase.auth.getUser();

      if (!user) {
        console.error("User not authenticated");
        return false;
      }

      const document: Partial<CloudDocument> = {
        id: documentId,
        user_id: user.id,
        title,
        content,
        html_content: htmlContent,
        word_count: wordCount,
        last_modified: new Date().toISOString(),
        is_synced: true,
      };

      const { error } = await this.supabase
        .from("documents")
        .upsert(document, { onConflict: "id" });

      if (error) {
        console.error("Failed to save to cloud:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Cloud sync error:", error);
      return false;
    }
  }

  /**
   * Load document from cloud
   */
  static async loadFromCloud(
    documentId: string
  ): Promise<CloudDocument | null> {
    if (!this.supabase) return null;

    try {
      const { data, error } = await this.supabase
        .from("documents")
        .select("*")
        .eq("id", documentId)
        .single();

      if (error) {
        console.error("Failed to load from cloud:", error);
        return null;
      }

      return data as CloudDocument;
    } catch (error) {
      console.error("Cloud load error:", error);
      return null;
    }
  }

  /**
   * Get all documents for current user
   */
  static async getUserDocuments(): Promise<CloudDocument[]> {
    if (!this.supabase) return [];

    try {
      const {
        data: { user },
      } = await this.supabase.auth.getUser();

      if (!user) return [];

      const { data, error } = await this.supabase
        .from("documents")
        .select("*")
        .eq("user_id", user.id)
        .order("last_modified", { ascending: false });

      if (error) {
        console.error("Failed to fetch documents:", error);
        return [];
      }

      return data as CloudDocument[];
    } catch (error) {
      console.error("Fetch documents error:", error);
      return [];
    }
  }

  /**
   * Delete document from cloud
   */
  static async deleteFromCloud(documentId: string): Promise<boolean> {
    if (!this.supabase) return false;

    try {
      const { error } = await this.supabase
        .from("documents")
        .delete()
        .eq("id", documentId);

      if (error) {
        console.error("Failed to delete from cloud:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Cloud delete error:", error);
      return false;
    }
  }

  /**
   * Start auto-sync
   */
  static startAutoSync(
    getDocument: () => {
      id: string;
      title: string;
      content: string;
      htmlContent: string;
      wordCount: number;
    }
  ): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(async () => {
      const doc = getDocument();
      if (doc.content) {
        await this.saveToCloud(
          doc.id,
          doc.title,
          doc.content,
          doc.htmlContent,
          doc.wordCount
        );
      }
    }, this.SYNC_INTERVAL_MS);
  }

  /**
   * Stop auto-sync
   */
  static stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  /**
   * Check if document needs sync (local newer than cloud)
   */
  static async needsSync(
    documentId: string,
    localLastModified: Date
  ): Promise<boolean> {
    const cloudDoc = await this.loadFromCloud(documentId);
    if (!cloudDoc) return true;

    const cloudDate = new Date(cloudDoc.last_modified);
    return localLastModified > cloudDate;
  }

  /**
   * Resolve sync conflicts (keep newest)
   */
  static async resolveConflict(
    documentId: string,
    localContent: string,
    localLastModified: Date
  ): Promise<{
    resolved: boolean;
    useLocal: boolean;
    content: string;
  }> {
    const cloudDoc = await this.loadFromCloud(documentId);

    if (!cloudDoc) {
      return { resolved: true, useLocal: true, content: localContent };
    }

    const cloudDate = new Date(cloudDoc.last_modified);

    if (localLastModified > cloudDate) {
      // Local is newer
      return { resolved: true, useLocal: true, content: localContent };
    } else {
      // Cloud is newer
      return { resolved: true, useLocal: false, content: cloudDoc.content };
    }
  }
}

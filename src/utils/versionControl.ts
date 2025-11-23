/**
 * Version Control Utility
 * Git-like version tracking for documents with automatic snapshots
 */

export interface DocumentVersion {
  id: string;
  timestamp: number;
  content: string;
  htmlContent?: string;
  wordCount: number;
  changeDescription?: string;
  isAutoSave: boolean;
}

export class VersionControl {
  private static readonly STORAGE_KEY_PREFIX = "quillpilot_versions_";
  private static readonly MAX_VERSIONS = 50;
  private static readonly AUTO_SAVE_INTERVAL = 5 * 60 * 1000; // 5 minutes

  /**
   * Save a new version of the document
   */
  static saveVersion(
    documentId: string,
    content: string,
    htmlContent: string,
    wordCount: number,
    changeDescription?: string,
    isAutoSave: boolean = false
  ): DocumentVersion {
    const versions = this.getVersions(documentId);

    const newVersion: DocumentVersion = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      content,
      htmlContent,
      wordCount,
      changeDescription,
      isAutoSave,
    };

    versions.unshift(newVersion);

    // Keep only the most recent MAX_VERSIONS
    if (versions.length > this.MAX_VERSIONS) {
      versions.splice(this.MAX_VERSIONS);
    }

    localStorage.setItem(
      this.STORAGE_KEY_PREFIX + documentId,
      JSON.stringify(versions)
    );

    return newVersion;
  }

  /**
   * Get all versions for a document
   */
  static getVersions(documentId: string): DocumentVersion[] {
    const stored = localStorage.getItem(this.STORAGE_KEY_PREFIX + documentId);
    return stored ? JSON.parse(stored) : [];
  }

  /**
   * Get a specific version
   */
  static getVersion(
    documentId: string,
    versionId: string
  ): DocumentVersion | null {
    const versions = this.getVersions(documentId);
    return versions.find((v) => v.id === versionId) || null;
  }

  /**
   * Restore a previous version
   */
  static restoreVersion(
    documentId: string,
    versionId: string
  ): DocumentVersion | null {
    const version = this.getVersion(documentId, versionId);
    if (!version) return null;

    // Save current state before restoring
    const currentVersions = this.getVersions(documentId);
    if (currentVersions.length > 0) {
      const current = currentVersions[0];
      this.saveVersion(
        documentId,
        current.content,
        current.htmlContent || "",
        current.wordCount,
        "Auto-save before restore",
        true
      );
    }

    return version;
  }

  /**
   * Delete a version
   */
  static deleteVersion(documentId: string, versionId: string): void {
    const versions = this.getVersions(documentId);
    const filtered = versions.filter((v) => v.id !== versionId);
    localStorage.setItem(
      this.STORAGE_KEY_PREFIX + documentId,
      JSON.stringify(filtered)
    );
  }

  /**
   * Clear all versions for a document
   */
  static clearVersions(documentId: string): void {
    localStorage.removeItem(this.STORAGE_KEY_PREFIX + documentId);
  }

  /**
   * Get version comparison (word count difference)
   */
  static compareVersions(
    version1: DocumentVersion,
    version2: DocumentVersion
  ): { wordDifference: number; timeDifference: number } {
    return {
      wordDifference: version2.wordCount - version1.wordCount,
      timeDifference: version2.timestamp - version1.timestamp,
    };
  }

  /**
   * Check if auto-save is needed
   */
  static shouldAutoSave(documentId: string): boolean {
    const versions = this.getVersions(documentId);
    if (versions.length === 0) return true;

    const lastVersion = versions[0];
    const timeSinceLastSave = Date.now() - lastVersion.timestamp;

    return timeSinceLastSave >= this.AUTO_SAVE_INTERVAL;
  }

  /**
   * Get formatted version history
   */
  static getVersionHistory(documentId: string): Array<{
    version: DocumentVersion;
    relativeTime: string;
    wordDiff?: number;
  }> {
    const versions = this.getVersions(documentId);

    return versions.map((version, index) => {
      const relativeTime = this.formatRelativeTime(version.timestamp);
      const wordDiff =
        index < versions.length - 1
          ? version.wordCount - versions[index + 1].wordCount
          : undefined;

      return {
        version,
        relativeTime,
        wordDiff,
      };
    });
  }

  /**
   * Format timestamp as relative time
   */
  private static formatRelativeTime(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    return `${days} day${days > 1 ? "s" : ""} ago`;
  }

  /**
   * Export version history as JSON
   */
  static exportVersionHistory(documentId: string): string {
    const versions = this.getVersions(documentId);
    return JSON.stringify(versions, null, 2);
  }

  /**
   * Import version history from JSON
   */
  static importVersionHistory(documentId: string, jsonData: string): boolean {
    try {
      const versions: DocumentVersion[] = JSON.parse(jsonData);
      localStorage.setItem(
        this.STORAGE_KEY_PREFIX + documentId,
        JSON.stringify(versions)
      );
      return true;
    } catch (error) {
      console.error("Failed to import version history:", error);
      return false;
    }
  }
}

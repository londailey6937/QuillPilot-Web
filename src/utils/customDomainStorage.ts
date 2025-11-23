/**
 * Custom Domain Storage - STUB
 * Placeholder for backwards compatibility during migration to genres
 */

import type { SavedCustomGenre } from "../../types";

export function loadCustomDomains(): SavedCustomGenre[] {
  return [];
}

export function saveCustomDomain(name: string, concepts: any[]): void {
  // Stub
}

export function getCustomDomain(name: string): SavedCustomGenre | null {
  return null;
}

export function convertToConceptDefinitions(genre: SavedCustomGenre): any[] {
  return [];
}

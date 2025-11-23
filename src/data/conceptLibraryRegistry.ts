/**
 * Concept Library Registry - DEPRECATED
 * This file is kept for backwards compatibility during migration to genre-based system
 * TODO: Remove once all imports are updated to use genreRegistry
 */

// Re-export Genre as Domain for backwards compatibility
export type { Genre as Domain } from "./genreRegistry";

// Empty concept definition for backwards compatibility
export interface ConceptDefinition {
  name: string;
  category?: string;
  importance?: string;
}

export interface ConceptLibrary {
  concepts: ConceptDefinition[];
}

// Empty registry for backwards compatibility
export const CONCEPT_LIBRARIES: Record<string, ConceptLibrary> = {};

export function getAvailableDomains() {
  return [];
}

export function getLibraryByDomain(domain: string): ConceptLibrary {
  return { concepts: [] };
}

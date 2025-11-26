/**
 * Core Data Types for Chapter Checker
 * Defines the structure for concepts, chapters, analyses, and recommendations
 */

// ============================================================================
// ACCESS CONTROL & PRICING TIERS
// ============================================================================

export type AccessLevel = "free" | "premium" | "professional";

// ============================================================================
// TESTER ACCESS CONTROL
// ============================================================================

// Emails with full access to all tiers for testing
// Add additional tester emails here as needed
export const TESTER_EMAILS = [
  "londailey6937@gmail.com", // Primary admin/developer
  // Add additional tester emails below:
  // "tester@example.com",
];

// Check if user has tester access
export const isTesterEmail = (email: string | undefined): boolean => {
  if (!email) return false;
  return TESTER_EMAILS.includes(email.toLowerCase());
};

// Check if user can actually use a feature (not just see it)
export const canUseFeature = (
  userEmail: string | undefined,
  requiredTier: AccessLevel,
  userTier: AccessLevel
): boolean => {
  // Testers can use all features
  if (isTesterEmail(userEmail)) return true;

  // For non-testers, features are restricted to free tier only
  // They can see premium/professional UI but can't actually use features
  const tierLevel = { free: 1, premium: 2, professional: 3 };
  return (
    tierLevel[userTier] >= tierLevel[requiredTier] && requiredTier === "free"
  );
};

export interface AccessFeatures {
  // Free tier - Level 1
  spacingAnalysis: boolean;
  dualCodingAnalysis: boolean;

  // Premium tier - Level 2
  fullAnalysis: boolean; // All 10 learning principles
  exportResults: boolean;
  conceptGraphs: boolean;
  customGenres: boolean; // Create and save custom genres

  // Professional tier - Level 3
  writerMode: boolean;
  unlimitedAnalyses: boolean;
  prioritySupport: boolean;

  // Upload limits
  maxPages: number; // Maximum page count for uploads
}

export const ACCESS_TIERS: Record<AccessLevel, AccessFeatures> = {
  free: {
    spacingAnalysis: true,
    dualCodingAnalysis: true,
    fullAnalysis: false,
    exportResults: false,
    conceptGraphs: false,
    customGenres: false,
    writerMode: false,
    unlimitedAnalyses: false,
    prioritySupport: false,
    maxPages: 200, // Multiple chapters or small book
  },
  premium: {
    spacingAnalysis: true,
    dualCodingAnalysis: true,
    fullAnalysis: true,
    exportResults: true,
    conceptGraphs: true,
    customGenres: true,
    writerMode: false,
    unlimitedAnalyses: false,
    prioritySupport: false,
    maxPages: 650, // Full textbook (typical undergraduate textbook)
  },
  professional: {
    spacingAnalysis: true,
    dualCodingAnalysis: true,
    fullAnalysis: true,
    exportResults: true,
    conceptGraphs: true,
    customGenres: true,
    writerMode: true,
    unlimitedAnalyses: true,
    prioritySupport: true,
    maxPages: 1000, // Large comprehensive single text (reference books, handbooks, long-form content)
  },
};

// Custom Genre Storage
export interface SavedConceptData {
  name: string;
  category?: string;
  importance?: string;
}

export interface SavedCustomGenre {
  name: string;
  concepts: SavedConceptData[];
  createdAt: string;
}

// ============================================================================
// CONCEPT & KNOWLEDGE STRUCTURE
// ============================================================================

export interface Concept {
  id: string;
  name: string;
  definition: string;
  importance: "core" | "supporting" | "detail";
  category?: string; // Mathematical category (e.g., "Algebra Fundamentals", "Calculus")
  firstMentionPosition: number; // Character position in chapter
  mentions: ConceptMention[];
  relatedConcepts: string[]; // IDs of related concepts
  prerequisites: string[]; // Concept IDs that must come first
  applications: string[]; // Real-world uses
  commonMisconceptions: string[];
  emoji?: string;
}

export interface ConceptMention {
  position: number; // Character position
  matchedText?: string; // Exact text matched in source
  context: string; // Surrounding text (200 chars)
  depth: "shallow" | "moderate" | "deep"; // How thoroughly explained
  isRevisit: boolean;
  associatedConcepts: string[]; // Other concepts mentioned nearby
  isAlias?: boolean; // True when match came from an alias term
}

export interface ConceptGraph {
  concepts: Concept[];
  relationships: ConceptRelationship[];
  hierarchy: ConceptHierarchy;
  sequence: string[]; // Order of first mentions
}

export interface ConceptRelationship {
  source: string; // Concept ID
  target: string; // Concept ID
  type: "prerequisite" | "related" | "contrasts" | "extends" | "example";
  strength: number; // 0-1, how strongly related
}

export interface ConceptHierarchy {
  core: Concept[];
  supporting: Concept[];
  detail: Concept[];
}

// ============================================================================
// CHAPTER STRUCTURE
// ============================================================================

export interface Chapter {
  id: string;
  title: string;
  content: string;
  wordCount: number;
  sections: Section[];
  conceptGraph: ConceptGraph;
  metadata: ChapterMetadata;
}

export interface Section {
  id: string;
  heading: string;
  content: string;
  startPosition: number;
  endPosition: number;
  wordCount: number;
  conceptsIntroduced: string[]; // Concept IDs
  conceptsRevisited: string[];
  depth: number; // Nesting level
}

export interface ChapterMetadata {
  readingLevel: "beginner" | "intermediate" | "advanced";
  genre: string; // e.g., "fantasy", "mystery", "romance"
  targetAudience: string;
  estimatedReadingTime: number; // minutes
  createdAt: Date;
  lastAnalyzed: Date;
  embeddedImageCount?: number; // # of images detected during upload
  hasHtmlContent?: boolean; // whether original upload preserved HTML
  sourceHtml?: string; // original HTML content (with images) when available
  originalFormat?: "html" | "text"; // track original data format
}

// ============================================================================
// LEARNING PRINCIPLE EVALUATION
// ============================================================================

export interface PrincipleEvaluation {
  principle: LearningPrinciple;
  score: number; // 0-100
  weight: number; // How important for this genre
  findings: Finding[];
  suggestions: Suggestion[];
  evidence: Evidence[];
}

export type LearningPrinciple =
  | "deepProcessing"
  | "spacedRepetition"
  | "retrievalPractice"
  | "interleaving"
  | "dualCoding"
  | "generativeLearning"
  | "metacognition"
  | "schemaBuilding"
  | "cognitiveLoad"
  | "emotionAndRelevance";

export interface Finding {
  type: "positive" | "warning" | "neutral" | "critical";
  message: string;
  severity: number; // 0-1
  location?: {
    sectionId: string;
    position: number;
  };
  evidence: string; // Quote or reference from text
}

export interface Suggestion {
  id: string;
  principle: LearningPrinciple;
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  implementation: string; // How to implement
  expectedImpact: string; // What will improve
  relatedConcepts: string[]; // Concept IDs this affects
  examples?: string[];
}

export interface Evidence {
  type: "count" | "metric" | "pattern" | "absence";
  metric: string; // e.g., "concept_revisits", "question_count"
  value: number | string;
  threshold?: number; // Ideal value
  quality: "strong" | "moderate" | "weak";
}

// ============================================================================
// LEARNING PATTERN DETECTION
// ============================================================================

export type PatternType =
  | "workedExample"
  | "practiceProblem"
  | "definitionExample"
  | "formula"
  | "procedure"
  | "comparison";

export interface PatternMatch {
  type: PatternType;
  confidence: number; // 0-1, how confident we are in this detection
  startPosition: number;
  endPosition: number;
  context: string; // Surrounding text sample
  title?: string; // e.g., "Example 3.2: Calculating pH"
  metadata?: {
    // Pattern-specific metadata
    steps?: number; // For procedures/worked examples
    concepts?: string[]; // Related concept IDs
    difficulty?: "easy" | "medium" | "hard";
    hasAnswer?: boolean; // For practice problems
    variableCount?: number; // For formulas
    comparisonItems?: string[]; // For comparisons
    // Chemistry-specific metadata
    isBalanced?: boolean; // For chemical equations
    problemType?: string; // e.g., "stoichiometry", "nomenclature", "lewis-structure"
    procedureType?: string; // e.g., "laboratory", "mechanism"
    isWorkedExample?: boolean; // If equation is part of worked example
  };
}

export interface PatternAnalysis {
  totalPatterns: number;
  patternCounts: Record<PatternType, number>;
  patterns: PatternMatch[];
  coverage: number; // % of chapter with learning patterns
  distribution: {
    // Distribution across chapter sections
    sectionId: string;
    patternCount: number;
  }[];
}

// ============================================================================
// ANALYSIS RESULTS
// ============================================================================

export interface AnalysisMetrics {
  totalWords: number;
  readingTime: number;
  averageSectionLength: number;
  conceptDensity: number;
  readabilityScore: number;
  complexityScore: number;
  timestamp?: Date;
}

export interface ChapterAnalysis {
  chapterId: string;
  overallScore: number;
  principleScores: PrincipleScore[];
  recommendations: Recommendation[];
  conceptGraph: ConceptGraph;
  metrics: AnalysisMetrics;
  timestamp?: Date;
  visualization?: AnalysisVisualization;
  // Added fields from AnalysisEngine
  principles?: PrincipleEvaluation[];
  conceptAnalysis?: ConceptAnalysisResult;
  structureAnalysis?: StructureAnalysisResult;
  visualizations?: AnalysisVisualization;
  patternAnalysis?: PatternAnalysis; // Learning patterns detected
  characterAnalysis?: any; // Character arc analysis data
  proseQuality?: any; // Prose quality metrics
  emotionHeatmap?: any; // Emotional pacing heatmap
  povConsistency?: any; // POV consistency tracking
  clicheDetection?: any; // Cliché detection results
  filteringWords?: any; // Filtering words detection
  backstoryDensity?: any; // Backstory density analysis
  dialogueNarrativeRatio?: any; // Dialogue-to-narrative balance
  sceneSequel?: any; // Scene vs sequel structure
  conflictTracking?: any; // Conflict tracking
  sensoryBalance?: any; // Sensory details balance
}

export interface ConceptMapData {
  nodes: {
    id: string;
    label: string;
    importance: "core" | "supporting" | "detail";
    size: number;
    color: string;
    firstMention: number;
  }[];
  links: {
    source: string;
    target: string;
    type: "prerequisite" | "related" | "contrasts" | "extends" | "example";
    strength: number;
  }[];
  clusters: any[];
}

export interface CognitiveLoadPoint {
  sectionId: string;
  position: number;
  load: number;
  factors: {
    novelConcepts: number;
    conceptDensity: number;
    sentenceComplexity: number;
    technicalTerms: number;
  };
}

export interface InterleavingData {
  conceptSequence: string[];
  blockingSegments: BlockingSegment[];
  blockingRatio: number;
  topicSwitches: number;
  avgBlockSize: number;
  recommendation: string;
}

export interface ReviewScheduleData {
  concepts: {
    conceptId: string;
    mentions: number;
    spacing: number[];
    isOptimal: boolean;
  }[];
  optimalSpacing: number;
  currentAvgSpacing: number;
}

export interface PrincipleVisualization {
  principles: {
    name: string;
    displayName: string;
    score: number;
    weight: number;
  }[];
  overallWeightedScore: number;
  strongestPrinciples: string[];
  weakestPrinciples: string[];
}

export interface AnalysisVisualization {
  conceptMap: ConceptMapData;
  cognitiveLoadCurve: CognitiveLoadPoint[];
  interleavingPattern: InterleavingData;
  reviewSchedule: ReviewScheduleData;
  principleScores: PrincipleVisualization;
}

export interface HierarchyVisualization {
  nodes: Array<{
    id: string;
    label: string;
    level: "core" | "supporting" | "detail";
    size: number;
  }>;
  edges: Array<{
    source: string;
    target: string;
    type: string;
  }>;
}

export interface FlowVisualization {
  sequence: string[];
  connections: Array<{
    from: string;
    to: string;
    strength: number;
  }>;
}

export interface MetricsVisualization {
  scores: Record<string, number>;
  patterns: Array<{
    name: string;
    value: number;
    target: number;
  }>;
}

export interface ConceptAnalysisResult {
  totalConceptsIdentified: number;
  coreConceptCount: number;
  conceptDensity: number; // Concepts per 1000 words
  novelConceptsPerSection: number[];
  reviewPatterns: ReviewPattern[];
  hierarchyBalance: number; // 0-1, how well balanced
  orphanConcepts: string[]; // Concepts with no connections
}

export interface ReviewPattern {
  conceptId: string;
  mentions: number;
  firstAppearance: number; // Character position
  spacing: number[]; // Gaps between mentions
  avgSpacing: number;
  isOptimal: boolean;
  recommendation?: string;
}

export interface StructureAnalysisResult {
  sectionCount: number;
  avgSectionLength: number;
  sectionLengthVariance: number;
  pacing: "slow" | "moderate" | "fast";
  scaffolding: ScaffoldingAnalysis;
  transitionQuality: number; // 0-1
  conceptualization: "shallow" | "moderate" | "deep";
}

export interface ScaffoldingAnalysis {
  hasIntroduction: boolean;
  hasProgression: boolean;
  hasSummary: boolean;
  hasReview: boolean;
  scaffoldingScore: number; // 0-1
}

export interface Recommendation {
  id: string;
  priority: "high" | "medium" | "low";
  category: "restructure" | "enhance" | "add" | "clarify" | "remove";
  title: string;
  description: string;
  affectedSections: string[]; // Section IDs
  affectedConcepts: string[]; // Concept IDs
  estimatedEffort: "low" | "medium" | "high";
  expectedOutcome: string;
  actionItems: string[];
}

// ============================================================================
// VISUALIZATIONS
// ============================================================================

// NOTE: Duplicate AnalysisVisualization definition above with PrincipleVisualization.
// To avoid conflicting redeclarations, we consolidate to the richer version.
export interface AnalysisVisualization {
  conceptMap: ConceptMapData;
  cognitiveLoadCurve: CognitiveLoadPoint[];
  interleavingPattern: InterleavingData;
  reviewSchedule: ReviewScheduleData;
  principleScores: PrincipleVisualization; // unified visualization shape
}

export interface ConceptMapData {
  nodes: ConceptNode[];
  links: ConceptLink[];
  clusters: any[]; // keep loose to prevent conflicting type redeclarations
}

export interface ConceptNode {
  id: string;
  label: string;
  importance: "core" | "supporting" | "detail";
  size: number; // Based on mention frequency
  color: string; // Based on introduction order or domain
  firstMention: number; // Position in chapter
}

export interface ConceptLink {
  source: string; // Node ID
  target: string; // Node ID
  type: "prerequisite" | "related" | "contrasts" | "extends" | "example";
  strength: number; // Line thickness
}

export interface ConceptCluster {
  id: string;
  conceptIds: string[];
  theme: string; // e.g., "Foundational", "Application"
  centroid: { x: number; y: number };
}

export interface CognitiveLoadPoint {
  sectionId: string;
  position: number; // Character position
  load: number; // 0-1, estimated cognitive load
  factors: {
    novelConcepts: number;
    conceptDensity: number;
    sentenceComplexity: number;
    technicalTerms: number;
  };
}

export interface InterleavingData {
  conceptSequence: string[]; // Concept IDs in order
  blockingSegments: BlockingSegment[];
  blockingRatio: number; // 0-1, how much is "blocked"
  topicSwitches: number;
  avgBlockSize: number;
  recommendation: string;
}

export interface BlockingSegment {
  startPosition: number;
  endPosition: number;
  conceptId: string;
  length: number;
  issue: string;
}

export interface ReviewScheduleData {
  concepts: ReviewConcept[];
  optimalSpacing: number; // Ideal gap between mentions
  currentAvgSpacing: number;
}

export interface ReviewConcept {
  conceptId: string;
  mentions: number;
  spacing: number[];
  isOptimal: boolean;
}

export interface PrincipleScore {
  principleId: string;
  principle: string;
  score: number;
  weight: number;
  details: string[];
  suggestions: Suggestion[];
  timestamp?: Date;
}

export interface PrincipleScoreDisplay {
  name: string;
  displayName: string;
  score: number;
  weight: number;
}

// ============================================================================
// CHARACTER MANAGEMENT (Tier 3 - Professional)
// ============================================================================

export type CharacterRole =
  | "protagonist"
  | "antagonist"
  | "deuteragonist"
  | "love-interest"
  | "mentor"
  | "sidekick"
  | "foil"
  | "supporting"
  | "minor";

export interface Character {
  id: string;
  name: string;
  role: CharacterRole;
  traits: string[]; // e.g., ["brave", "impulsive", "loyal"]
  background: string; // Character backstory/history
  goals: string; // What the character wants
  conflicts: string; // Internal/external conflicts
  arc: string; // Character development arc
  relationships: CharacterRelationship[]; // Connections to other characters
  linkedNames: string[]; // Alternative names/aliases used in text (e.g., "John", "Johnny", "Mr. Smith")
  notes: string; // Free-form writer notes
  createdAt: string;
  updatedAt: string;
}

export interface CharacterRelationship {
  characterId: string; // ID of the related character
  type:
    | "ally"
    | "enemy"
    | "family"
    | "romantic"
    | "mentor"
    | "rival"
    | "neutral";
  description: string; // Brief description of the relationship
}

export interface CharacterMapping {
  textOccurrence: string; // The actual text string found in the document
  characterId: string; // ID of the character it maps to
  position: number; // Character position in text where mapping was created
}

// ============================================================================
// UTILITIES
// ============================================================================

export interface AnalysisConfig {
  genre: string;
  readingLevel: "beginner" | "intermediate" | "advanced";
  focusPrinciples?: LearningPrinciple[];
  enableVisualization: boolean;
  conceptExtractionThreshold: number; // Confidence threshold (0-1)
  detailedReport: boolean;
}

export interface ExportData {
  format: "json" | "markdown" | "html";
  includeVisualizations: boolean;
  includeSuggestions: boolean;
  includeEvidence: boolean;
}

// Type guards
export function isPrincipleEvaluation(obj: any): obj is PrincipleEvaluation {
  return "principle" in obj && "score" in obj && "findings" in obj;
}

export function isChapterAnalysis(obj: any): obj is ChapterAnalysis {
  return "chapterId" in obj && "principles" in obj && "overallScore" in obj;
}

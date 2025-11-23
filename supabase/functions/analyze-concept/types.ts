export interface ConceptMention {
  position: number;
  matchedText?: string;
  context: string;
  depth: "shallow" | "moderate" | "deep";
  isRevisit: boolean;
  associatedConcepts: string[];
  isAlias?: boolean;
}

export interface Concept {
  id: string;
  name: string;
  definition: string;
  importance: "core" | "supporting" | "detail";
  firstMentionPosition: number;
  mentions: ConceptMention[];
  relatedConcepts: string[];
  prerequisites: string[];
  applications: string[];
  commonMisconceptions: string[];
}

export interface ConceptRelationship {
  source: string;
  target: string;
  type: "prerequisite" | "related" | "contrasts" | "extends" | "example";
  strength: number;
}

export interface ConceptHierarchy {
  core: Concept[];
  supporting: Concept[];
  detail: Concept[];
}

export interface ConceptGraph {
  concepts: Concept[];
  relationships: ConceptRelationship[];
  hierarchy: ConceptHierarchy;
  sequence: string[];
}

export interface ChapterMetadata {
  readingLevel: "beginner" | "intermediate" | "advanced";
  domain: string;
  targetAudience: string;
  estimatedReadingTime: number;
  createdAt: Date;
  lastAnalyzed: Date;
  embeddedImageCount?: number;
  hasHtmlContent?: boolean;
  sourceHtml?: string;
  originalFormat?: "html" | "text";
}

export interface Section {
  id: string;
  heading: string;
  content: string;
  startPosition: number;
  endPosition: number;
  wordCount: number;
  conceptsIntroduced: string[];
}

export interface Chapter {
  id: string;
  title: string;
  content: string;
  sections: Section[];
  metadata: ChapterMetadata;
  wordCount: number;
}

export interface Finding {
  type: "positive" | "warning" | "critical" | "neutral";
  message: string;
  severity: number; // 0 to 1
  evidence?: string;
  location?: {
    start: number;
    end: number;
  };
}

export interface Suggestion {
  id: string;
  principle: string;
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  implementation: string;
  expectedImpact: string;
  relatedConcepts: string[];
  examples: string[];
}

export interface Evidence {
  type: "count" | "metric" | "quote" | "pattern";
  metric: string;
  value: number | string;
  threshold?: number;
  quality: "strong" | "moderate" | "weak";
  context?: string;
}

export interface PrincipleEvaluation {
  principle: string;
  score: number; // 0 to 100
  weight: number; // 0 to 1
  findings: Finding[];
  suggestions: Suggestion[];
  evidence: Evidence[];
}

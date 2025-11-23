import {
  ChapterAnalysis,
  ConceptAnalysisResult,
  Finding,
  LearningPrinciple,
  PrincipleEvaluation,
  Recommendation,
  StructureAnalysisResult,
  Suggestion,
  AnalysisVisualization,
} from "@/types";
import {
  DualCodingAnalyzer,
  VisualSuggestion,
} from "@/utils/dualCodingAnalyzer";
import {
  analyzeParagraphSpacing,
  extractParagraphs,
  ParagraphSummary,
  SpacingTone,
} from "@/utils/spacingInsights";

interface TierOneAnalysisOptions {
  plainText: string;
  htmlContent?: string | null;
  fileName?: string;
}

interface ExportPrincipleScore {
  principleId: string;
  principleKey: LearningPrinciple;
  principle: string;
  score: number;
  weight: number;
  details: string[];
  suggestions: Suggestion[];
}

const EMPTY_CONCEPT_GRAPH = {
  concepts: [],
  relationships: [],
  hierarchy: { core: [], supporting: [], detail: [] },
  sequence: [],
};

const EMPTY_CONCEPT_ANALYSIS: ConceptAnalysisResult = {
  totalConceptsIdentified: 0,
  coreConceptCount: 0,
  conceptDensity: 0,
  novelConceptsPerSection: [],
  reviewPatterns: [],
  hierarchyBalance: 0,
  orphanConcepts: [],
};

const VISUAL_ACTIONS: Record<string, string> = {
  diagram: "Draft a quick diagram that labels each component you describe.",
  flowchart:
    "Lay out the sequence as a flowchart so readers can follow each step.",
  graph: "Chart the values to expose the comparison or trend you reference.",
  "concept-map": "Map the related ideas to show how they connect.",
  illustration: "Add a labeled illustration to anchor the dense terminology.",
};

const VISUAL_LABELS: Record<string, string> = {
  diagram: "Diagram",
  flowchart: "Flowchart",
  graph: "Graph",
  "concept-map": "Concept map",
  illustration: "Illustration",
};

export function buildTierOneAnalysisSummary({
  plainText,
  htmlContent,
  fileName,
}: TierOneAnalysisOptions): ChapterAnalysis | null {
  const normalizedText = plainText?.trim();
  if (!normalizedText) {
    return null;
  }

  const paragraphs = extractParagraphs(normalizedText);
  const spacingInsights = paragraphs.map((paragraph) => ({
    paragraph,
    assessment: analyzeParagraphSpacing(paragraph.wordCount),
  }));

  const compactEntries = spacingInsights.filter(
    (entry) => entry.assessment.tone === "compact"
  );
  const extendedEntries = spacingInsights.filter(
    (entry) => entry.assessment.tone === "extended"
  );
  const compactParagraphs = compactEntries.map((entry) => entry.paragraph);
  const extendedParagraphs = extendedEntries.map((entry) => entry.paragraph);
  const balancedCount = spacingInsights.length
    ? spacingInsights.length - compactEntries.length - extendedEntries.length
    : 0;

  const spacingScore = clampScore(
    78 +
      (balancedCount / Math.max(1, spacingInsights.length)) * 20 -
      extendedEntries.length * 6 -
      compactEntries.length * 3,
    35,
    98
  );

  const visualsSource = htmlContent?.trim()?.length
    ? htmlContent!
    : normalizedText;
  const visualSuggestions: VisualSuggestion[] =
    DualCodingAnalyzer.analyzeForVisuals(visualsSource);

  const highPriorityVisuals = visualSuggestions.filter(
    (suggestion) => suggestion.priority === "high"
  ).length;
  const dualCodingScore = clampScore(
    90 -
      highPriorityVisuals * 8 -
      (visualSuggestions.length - highPriorityVisuals) * 4,
    30,
    97
  );

  const spacingFindings = spacingInsights
    .filter((entry) => entry.assessment.tone !== "balanced")
    .map((entry) => toSpacingFinding(entry.paragraph, entry.assessment.tone));

  const spacingSuggestions = buildSpacingSuggestions(
    compactParagraphs,
    extendedParagraphs
  );

  const dualCodingFindings = visualSuggestions.map((suggestion, index) => ({
    type: (suggestion.priority === "high"
      ? "critical"
      : "warning") as Finding["type"],
    message: `${formatVisualLabel(suggestion.visualType)} needed: ${
      suggestion.reason
    }`,
    severity: suggestion.priority === "high" ? 0.75 : 0.45,
    evidence: suggestion.paragraph,
    location: {
      sectionId: `visual-${index + 1}`,
      position: suggestion.position,
    },
  }));

  const dualCodingSuggestions = visualSuggestions.map((suggestion, index) => ({
    id: `dual-coding-${index + 1}`,
    principle: "dualCoding" as LearningPrinciple,
    priority: suggestion.priority,
    title: `${formatVisualLabel(suggestion.visualType)} for contextual clarity`,
    description: suggestion.reason,
    implementation:
      VISUAL_ACTIONS[suggestion.visualType] ||
      "Insert a helpful visual aid to pair with this section.",
    expectedImpact: "Helps students pair the text with a reinforcing visual.",
    relatedConcepts: [] as string[],
    examples: suggestion.paragraph ? [suggestion.paragraph] : [],
  }));

  const principleScores: ExportPrincipleScore[] = [
    {
      principleId: "spacing",
      principleKey: "spacedRepetition",
      principle: "Spacing & Chunking",
      score: spacingScore,
      weight: 1,
      details: spacingFindings.map((finding) => finding.message),
      suggestions: spacingSuggestions,
    },
    {
      principleId: "dualCoding",
      principleKey: "dualCoding",
      principle: "Dual Coding",
      score: dualCodingScore,
      weight: 1,
      details: dualCodingFindings.map((finding) => finding.message),
      suggestions: dualCodingSuggestions,
    },
  ];

  const principleEvaluations: PrincipleEvaluation[] = [
    {
      principle: "spacedRepetition",
      score: spacingScore,
      weight: 1,
      findings: spacingFindings,
      suggestions: spacingSuggestions,
      evidence: spacingFindings.map((finding) => ({
        type: "metric",
        metric: "paragraph_length",
        value: extractWordCountFromFinding(finding.message),
        threshold: finding.message.includes("long") ? 160 : 60,
        quality: "moderate",
      })),
    },
    {
      principle: "dualCoding",
      score: dualCodingScore,
      weight: 1,
      findings: dualCodingFindings,
      suggestions: dualCodingSuggestions,
      evidence: dualCodingFindings.map((finding) => ({
        type: "pattern",
        metric: "visual_gap",
        value: finding.evidence || "",
        quality: finding.type === "critical" ? "strong" : "moderate",
      })),
    },
  ];

  const recommendations = buildRecommendations(
    compactParagraphs,
    extendedParagraphs,
    visualSuggestions
  );

  const wordCount = normalizedText.split(/\s+/).filter(Boolean).length;

  const structureAnalysis = buildStructureAnalysis(
    paragraphs.length,
    wordCount
  );
  const visualization = buildVisualization(principleScores);

  const analysis = {
    chapterId: `tier1-${Date.now()}`,
    overallScore: Math.round((spacingScore + dualCodingScore) / 2),
    recommendations,
    conceptGraph: EMPTY_CONCEPT_GRAPH,
    metrics: {
      totalWords: wordCount,
      readingTime: Math.max(1, Math.round(wordCount / 220)),
      averageSectionLength: spacingInsights.length
        ? Math.round(wordCount / spacingInsights.length)
        : wordCount,
      conceptDensity: 0,
      readabilityScore: 0,
      complexityScore: 0,
    },
    timestamp: new Date(),
    principles: principleEvaluations,
    conceptAnalysis: EMPTY_CONCEPT_ANALYSIS,
    structureAnalysis,
    visualizations: visualization,
  } as ChapterAnalysis;

  (analysis as any).principleScores = principleScores;
  return analysis;
}

function clampScore(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Math.round(value)));
}

function toSpacingFinding(
  paragraph: ParagraphSummary,
  tone: SpacingTone
): Finding {
  const isExtended = tone === "extended";
  const message = isExtended
    ? `Paragraph ${paragraph.id + 1} runs ${
        paragraph.wordCount
      } words—split it or add transitions to reset attention.`
    : `Paragraph ${paragraph.id + 1} is only ${
        paragraph.wordCount
      } words—add an example or explanation to fully develop the idea.`;

  return {
    type: (isExtended ? "warning" : "neutral") as Finding["type"],
    message,
    severity: isExtended ? 0.6 : 0.35,
    evidence: truncate(paragraph.text, 160),
    location: {
      sectionId: `paragraph-${paragraph.id + 1}`,
      position: paragraph.startIndex,
    },
  };
}

function buildSpacingSuggestions(
  compactParagraphs: ParagraphSummary[],
  extendedParagraphs: ParagraphSummary[]
): Suggestion[] {
  const suggestions: Suggestion[] = [];

  if (extendedParagraphs.length) {
    suggestions.push({
      id: "spacing-split",
      principle: "spacedRepetition" as LearningPrinciple,
      priority: extendedParagraphs.length >= 2 ? "high" : "medium",
      title: "Split dense paragraphs",
      description: "Large blocks above 160 words slow recall.",
      implementation:
        "Introduce mini-headings or new paragraphs where ideas shift to keep segments within 60-160 words.",
      expectedImpact: "Improves pacing and supports spaced retrieval.",
      relatedConcepts: [] as string[],
      examples: extendedParagraphs
        .slice(0, 2)
        .map((paragraph) => truncate(paragraph.text, 120)),
    });
  }

  if (compactParagraphs.length) {
    suggestions.push({
      id: "spacing-expand",
      principle: "spacedRepetition" as LearningPrinciple,
      priority: "medium",
      title: "Add support to short paragraphs",
      description: "Compact sections under 60 words feel abrupt.",
      implementation:
        "Layer in analogies, examples, or definitions so each paragraph earns its place.",
      expectedImpact:
        "Gives readers enough material to encode the idea before moving on.",
      relatedConcepts: [] as string[],
      examples: compactParagraphs
        .slice(0, 2)
        .map((paragraph) => truncate(paragraph.text, 120)),
    });
  }

  return suggestions;
}

function buildRecommendations(
  compactParagraphs: ParagraphSummary[],
  extendedParagraphs: ParagraphSummary[],
  visualSuggestions: VisualSuggestion[]
): Recommendation[] {
  const recs: Recommendation[] = [];

  if (extendedParagraphs.length) {
    recs.push({
      id: "rec-spacing-balance",
      priority: extendedParagraphs.length >= 2 ? "high" : "medium",
      category: "restructure",
      title: "Balance pacing across dense sections",
      description: `Paragraphs ${listParagraphNumbers(
        extendedParagraphs
      )} exceed 160 words. Split them into tighter segments to restore the target spacing cadence.`,
      affectedSections: [],
      affectedConcepts: [],
      estimatedEffort: extendedParagraphs.length >= 3 ? "high" : "medium",
      expectedOutcome:
        "Readers encounter natural pauses, which boosts retention.",
      actionItems: [
        "Insert subheadings or callouts where sub-topics shift.",
        "Limit each paragraph to one primary claim plus a supporting example.",
      ],
    });
  }

  if (compactParagraphs.length) {
    recs.push({
      id: "rec-spacing-depth",
      priority: "medium",
      category: "enhance",
      title: "Deepen abbreviated paragraphs",
      description: `Paragraphs ${listParagraphNumbers(
        compactParagraphs
      )} fall below the 60-word guidance. Add examples or bridges to slow the pacing slightly.`,
      affectedSections: [],
      affectedConcepts: [],
      estimatedEffort: "low",
      expectedOutcome: "Readers gain enough context before advancing.",
      actionItems: [
        "Add clarifying sentences that tie the idea to prior knowledge.",
        "Include one concrete example per short paragraph.",
      ],
    });
  }

  if (visualSuggestions.length) {
    const highPriority = visualSuggestions.filter(
      (suggestion) => suggestion.priority === "high"
    ).length;

    recs.push({
      id: "rec-dual-coding",
      priority: highPriority ? "high" : "medium",
      category: "add",
      title: "Layer visuals onto process-dense sections",
      description: `Detected ${visualSuggestions.length} sections that warrant diagrams or charts ( ${highPriority} high-priority ). Add visuals near the highlighted excerpts.`,
      affectedSections: [],
      affectedConcepts: [],
      estimatedEffort: visualSuggestions.length > 3 ? "high" : "medium",
      expectedOutcome:
        "Pairs abstract explanations with cues learners can quickly reference.",
      actionItems: [
        "Storyboard the described process or system before illustrating it.",
        "Add captions explaining what to notice in each visual.",
      ],
    });
  }

  return recs;
}

function buildStructureAnalysis(
  paragraphCount: number,
  wordCount: number
): StructureAnalysisResult {
  return {
    sectionCount: Math.max(1, paragraphCount),
    avgSectionLength: paragraphCount
      ? Math.round(wordCount / paragraphCount)
      : wordCount,
    sectionLengthVariance: 0,
    pacing:
      paragraphCount > 8 ? "fast" : paragraphCount < 4 ? "slow" : "moderate",
    scaffolding: {
      hasIntroduction: paragraphCount > 0,
      hasProgression: paragraphCount > 2,
      hasSummary: paragraphCount > 3,
      hasReview: paragraphCount > 4,
      scaffoldingScore: paragraphCount > 4 ? 0.6 : 0.4,
    },
    transitionQuality: paragraphCount > 5 ? 0.55 : 0.45,
    conceptualization:
      wordCount > 1500 ? "deep" : wordCount > 800 ? "moderate" : "shallow",
  } as StructureAnalysisResult;
}

function buildVisualization(
  principleScores: ExportPrincipleScore[]
): AnalysisVisualization {
  const totalWeight =
    principleScores.reduce((sum, score) => sum + score.weight, 0) || 1;
  const weightedScore = principleScores.reduce(
    (sum, score) => sum + score.score * score.weight,
    0
  );

  return {
    conceptMap: { nodes: [], links: [], clusters: [] },
    cognitiveLoadCurve: [],
    interleavingPattern: {
      conceptSequence: [],
      blockingSegments: [],
      blockingRatio: 0,
      topicSwitches: 0,
      avgBlockSize: 0,
      recommendation: "",
    },
    reviewSchedule: {
      concepts: [],
      optimalSpacing: 0,
      currentAvgSpacing: 0,
    },
    principleScores: {
      principles: principleScores.map((score) => ({
        name: score.principleId,
        displayName: score.principle,
        score: score.score,
        weight: score.weight,
      })),
      overallWeightedScore: Math.round(weightedScore / totalWeight),
      strongestPrinciples: principleScores
        .filter((score) => score.score >= 70)
        .map((score) => score.principleKey),
      weakestPrinciples: principleScores
        .filter((score) => score.score < 60)
        .map((score) => score.principleKey),
    },
  } as AnalysisVisualization;
}

function listParagraphNumbers(paragraphs: ParagraphSummary[]): string {
  const numbers = paragraphs
    .map((paragraph) => paragraph.id + 1)
    .sort((a, b) => a - b);
  return numbers.join(", ");
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.slice(0, maxLength).trim()}…`;
}

function extractWordCountFromFinding(message: string): number {
  const match = message.match(/(\d+)\s+words/);
  return match ? Number(match[1]) : 0;
}

function formatVisualLabel(type: string): string {
  return VISUAL_LABELS[type] || "Visual";
}

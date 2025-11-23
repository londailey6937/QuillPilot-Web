/**
 * Simplified Analysis Engine for MVP
 * Focuses on pacing (spacing) and dual-coding analysis only
 * Removed concept extraction for creative writing focus
 */

import type {
  Chapter,
  ChapterAnalysis,
  ConceptGraph,
  PrincipleEvaluation,
  PrincipleScore,
  AnalysisMetrics,
  Section,
  LearningPrinciple,
} from "../types";

import {
  analyzeParagraphSpacing,
  extractParagraphs,
} from "@/utils/spacingInsights";
import { DualCodingAnalyzer } from "@/utils/dualCodingAnalyzer";
import { analyzeCharacters } from "@/utils/characterAnalyzer";
import type { CharacterAnalysisResult } from "@/utils/characterAnalyzer";
import { analyzeThemes } from "@/utils/themeAnalyzer";
import type { ThemeAnalysisResult } from "@/utils/themeAnalyzer";
import { analyzeTropes } from "@/utils/tropeAnalyzer";
import type { TropeAnalysisResult } from "@/utils/tropeAnalyzer";
import { analyzeFictionElements } from "@/utils/fictionElementsAnalyzer";
import type { FictionElementsResult } from "@/utils/fictionElementsAnalyzer";

export class AnalysisEngine {
  /**
   * Main entry point: Analyze a chapter with simplified MVP logic
   */
  static async analyzeChapter(
    chapter: Chapter,
    onProgress?: (step: string, detail?: string) => void,
    genre: string = "general"
  ): Promise<ChapterAnalysis> {
    try {
      onProgress?.("analyzing-pacing", "Analyzing paragraph pacing");

      // Extract paragraphs
      const paragraphs = extractParagraphs(chapter.content);

      // Count paragraph types
      let compactCount = 0;
      let balancedCount = 0;
      let extendedCount = 0;

      paragraphs.forEach((para) => {
        const wordCount = para.wordCount;
        if (wordCount < 60) compactCount++;
        else if (wordCount > 160) extendedCount++;
        else balancedCount++;
      });

      onProgress?.("analyzing-visuals", "Analyzing show vs tell");

      // Analyze dual-coding for each paragraph
      let suggestionCount = 0;
      paragraphs.forEach((para, index) => {
        const prevPara = index > 0 ? paragraphs[index - 1].text : "";
        const nextPara =
          index < paragraphs.length - 1 ? paragraphs[index + 1].text : "";
        const suggestions = DualCodingAnalyzer.analyzeParagraph(
          para.text,
          index,
          prevPara,
          nextPara
        );
        suggestionCount += suggestions.length;
      });

      onProgress?.("analyzing-characters", "Analyzing character development");

      // Analyze character arcs
      const characterAnalysis: CharacterAnalysisResult = analyzeCharacters(
        chapter.content
      );

      onProgress?.("analyzing-themes", "Detecting themes and symbols");

      // Analyze themes and symbolism
      const themeAnalysis: ThemeAnalysisResult = analyzeThemes(chapter.content);

      onProgress?.(
        "analyzing-tropes",
        "Identifying genre tropes and conventions"
      );

      // Analyze genre-specific tropes
      const tropeAnalysis: TropeAnalysisResult = analyzeTropes(
        chapter.content,
        genre
      );

      onProgress?.(
        "analyzing-fiction-elements",
        "Analyzing 12 core fiction elements"
      );

      // Analyze comprehensive fiction elements
      const fictionElements: FictionElementsResult = analyzeFictionElements(
        chapter.content
      );

      onProgress?.("building-report", "Generating analysis report");

      // Create spacing analysis object for scoring
      const spacingAnalysis = {
        compact: compactCount,
        balanced: balancedCount,
        extended: extendedCount,
      };

      // Create dual-coding analysis object for scoring
      const dualCodingAnalysis = {
        suggestionCount,
        totalParagraphs: paragraphs.length,
      };

      // Create simplified metrics
      const metrics: AnalysisMetrics = {
        totalWords: chapter.wordCount,
        readingTime: Math.ceil(chapter.wordCount / 250), // 250 wpm average
        averageSectionLength:
          chapter.wordCount / Math.max(1, chapter.sections.length),
        conceptDensity: 0, // Not used in MVP
        readabilityScore: 50, // Placeholder
        complexityScore: 50, // Placeholder
        timestamp: new Date(),
      };

      // Create empty concept graph (not used in MVP)
      const conceptGraph: ConceptGraph = {
        concepts: [],
        relationships: [],
        hierarchy: { core: [], supporting: [], detail: [] },
        sequence: [],
      };

      // Create simplified principle scores focused on pacing and visuals
      const principleScores: PrincipleScore[] = [
        {
          principleId: "pacing",
          principle: "Pacing & Flow",
          score: this.calculatePacingScore(spacingAnalysis),
          weight: 1.0,
          details: [
            `${spacingAnalysis.compact} compact paragraphs`,
            `${spacingAnalysis.balanced} balanced paragraphs`,
            `${spacingAnalysis.extended} extended paragraphs`,
          ],
          suggestions: [],
        },
        {
          principleId: "dualCoding",
          principle: "Show vs Tell",
          score: this.calculateDualCodingScore(dualCodingAnalysis),
          weight: 1.0,
          details: [
            `${dualCodingAnalysis.suggestionCount} areas could use more sensory details`,
          ],
          suggestions: [],
        },
        {
          principleId: "characterDevelopment",
          principle: "Character Development",
          score: characterAnalysis.averageDevelopment,
          weight: 1.0,
          details: [
            `${characterAnalysis.totalCharacters} characters detected`,
            `${characterAnalysis.protagonists.length} protagonist(s): ${
              characterAnalysis.protagonists.join(", ") || "none"
            }`,
            ...characterAnalysis.characters
              .slice(0, 3)
              .map(
                (c) =>
                  `${c.name}: ${c.arcType} arc (${c.totalMentions} mentions)`
              ),
          ],
          suggestions: characterAnalysis.recommendations.map((rec, i) => ({
            id: `char-${i}`,
            principle: "characterDevelopment" as LearningPrinciple,
            priority: "medium" as const,
            title: "Character Development",
            description: rec,
            implementation: "Review character arcs and emotional trajectories",
            expectedImpact: "Stronger reader connection and engagement",
            relatedConcepts: [],
          })),
        },
        {
          principleId: "themeDepth",
          principle: "Theme Depth",
          score: themeAnalysis.thematicDensity,
          weight: 1.0,
          details: [
            `${themeAnalysis.primaryThemes.length} primary themes detected`,
            `Dominant theme: ${themeAnalysis.dominantTheme || "none"}`,
            `${themeAnalysis.symbolicPatterns.length} symbolic patterns found`,
            ...themeAnalysis.primaryThemes
              .slice(0, 3)
              .map(
                (t) =>
                  `${t.theme}: ${t.frequency} mentions (${t.intensity}% intensity)`
              ),
          ],
          suggestions: themeAnalysis.recommendations.map((rec, i) => ({
            id: `theme-${i}`,
            principle: "themeDepth" as LearningPrinciple,
            priority: "medium" as const,
            title: "Theme Development",
            description: rec,
            implementation: "Review thematic elements and symbolic patterns",
            expectedImpact: "Deeper reader engagement and narrative resonance",
            relatedConcepts: [],
          })),
        },
        {
          principleId: "genreTropes",
          principle: "Genre Conventions",
          score: tropeAnalysis.conventionScore,
          weight: 1.0,
          details: [
            `Genre: ${tropeAnalysis.genre}`,
            `Convention adherence: ${tropeAnalysis.conventionScore}/100`,
            `Subversion score: ${tropeAnalysis.subversionScore}/100`,
            `Trope overuse: ${tropeAnalysis.tropeOveruseScore}/100`,
            `${tropeAnalysis.detectedTropes.length} tropes detected`,
            `${tropeAnalysis.storyBeats.filter((b) => b.detected).length}/${
              tropeAnalysis.storyBeats.length
            } story beats present`,
            ...tropeAnalysis.detectedTropes
              .slice(0, 3)
              .map((t) => `${t.name}: ${t.strength}% strength`),
          ],
          suggestions: tropeAnalysis.recommendations.map((rec, i) => ({
            id: `trope-${i}`,
            principle: "genreTropes" as LearningPrinciple,
            priority:
              tropeAnalysis.tropeOveruseScore > 60
                ? ("high" as const)
                : ("medium" as const),
            title: "Genre Conventions",
            description: rec,
            implementation: "Review genre tropes and narrative conventions",
            expectedImpact:
              "Better alignment with reader expectations and genre standards",
            relatedConcepts: [],
          })),
        },
        // Fiction Elements - add top 3 strongest elements as individual scores
        ...fictionElements.elements
          .sort((a, b) => b.score - a.score)
          .slice(0, 3)
          .map((element, idx) => ({
            principleId: `fictionElement${idx}` as any,
            principle: element.element,
            score: element.score,
            weight: 0.8, // Slightly lower weight than core metrics
            details: [
              `Presence: ${element.presence}`,
              ...element.details,
              ...element.insights.slice(0, 2),
            ],
            suggestions: element.insights.slice(0, 3).map((insight, i) => ({
              id: `element-${element.element}-${i}`,
              principle: `fictionElement${idx}` as any,
              priority:
                element.score < 40 ? ("high" as const) : ("medium" as const),
              title: `${element.element} Development`,
              description: insight,
              implementation: `Focus on strengthening ${element.element.toLowerCase()}`,
              expectedImpact: `Improved narrative depth and ${element.element.toLowerCase()}`,
              relatedConcepts: [],
            })),
          })),
        {
          principleId: "fictionBalance",
          principle: "Fiction Elements Balance",
          score: fictionElements.overallBalance,
          weight: 1.0,
          details: [
            `Overall balance: ${fictionElements.overallBalance}/100`,
            `Strengths: ${
              fictionElements.strengths.join(", ") || "None identified"
            }`,
            `Focus areas: ${
              fictionElements.weaknesses.join(", ") || "All strong"
            }`,
            `${
              fictionElements.elements.filter((e) => e.presence === "strong")
                .length
            }/12 elements strong`,
          ],
          suggestions: fictionElements.recommendations.map((rec, i) => ({
            id: `balance-${i}`,
            principle: "fictionBalance" as LearningPrinciple,
            priority:
              fictionElements.overallBalance < 50
                ? ("high" as const)
                : ("medium" as const),
            title: "Balance Fiction Elements",
            description: rec,
            implementation: "Review and strengthen weaker narrative elements",
            expectedImpact: "More cohesive and well-rounded story",
            relatedConcepts: [],
          })),
        },
      ];

      // Calculate overall score
      const overallScore =
        principleScores.reduce((sum, ps) => sum + ps.score * ps.weight, 0) /
        principleScores.reduce((sum, ps) => sum + ps.weight, 0);

      // Convert principleScores to principles format for Dashboard compatibility
      const principles: PrincipleEvaluation[] = principleScores.map((ps) => ({
        principle: ps.principleId as LearningPrinciple,
        score: ps.score,
        weight: ps.weight,
        findings: ps.details.map((detail) => ({
          type: "neutral" as const,
          message: detail,
          severity: 0.5,
          evidence: detail,
        })),
        suggestions: ps.suggestions,
        evidence: [],
      }));

      // Add conceptAnalysis for Dashboard compatibility
      const conceptAnalysis = {
        totalConceptsIdentified: 0,
        coreConceptCount: 0,
        conceptDensity: 0,
        hierarchyBalance: 0,
        novelConceptsPerSection: [],
        reviewPatterns: [],
        orphanConcepts: [],
      };

      // Add visualizations for Dashboard compatibility
      const visualizations = {
        conceptMap: {
          nodes: [],
          links: [],
          clusters: [],
        },
        cognitiveLoadCurve: [],
        interleavingPattern: {
          conceptSequence: [],
          blockingSegments: [],
          interleavingSegments: [],
          blockingRatio: 0,
          topicSwitches: 0,
          avgBlockSize: 0,
          recommendation: "",
        },
        reviewSchedule: {
          concepts: [],
          timeline: [],
          optimalSpacing: 0,
          currentAvgSpacing: 0,
        },
        principleScores: {
          principles: principleScores.map((ps) => ({
            name: ps.principleId,
            displayName: ps.principle,
            score: ps.score,
            weight: ps.weight,
          })),
          overallWeightedScore: Math.round(overallScore),
          strongestPrinciples: [],
          weakestPrinciples: [],
        },
      };

      const analysis: ChapterAnalysis = {
        chapterId: chapter.id,
        overallScore: Math.round(overallScore),
        principleScores,
        principles, // Add this for Dashboard compatibility
        conceptAnalysis, // Add this for Dashboard compatibility
        visualizations, // Add this for Dashboard compatibility
        recommendations: [],
        conceptGraph,
        metrics,
        timestamp: new Date(),
      };

      onProgress?.("complete", "Analysis complete");

      return analysis;
    } catch (error) {
      console.error("[AnalysisEngine] Error during analysis:", error);
      throw error;
    }
  }

  /**
   * Calculate pacing score from spacing analysis
   */
  private static calculatePacingScore(spacingAnalysis: any): number {
    const total =
      spacingAnalysis.compact +
      spacingAnalysis.balanced +
      spacingAnalysis.extended;

    if (total === 0) return 50;

    // Good pacing has variety but leans toward balanced
    const balancedRatio = spacingAnalysis.balanced / total;
    const varietyScore = Math.min(
      spacingAnalysis.compact,
      spacingAnalysis.balanced,
      spacingAnalysis.extended
    )
      ? 100
      : 70;

    // Best score if 40-60% balanced
    const balanceScore =
      balancedRatio >= 0.4 && balancedRatio <= 0.6
        ? 100
        : balancedRatio >= 0.3 && balancedRatio <= 0.7
        ? 85
        : 70;

    return Math.round((varietyScore + balanceScore) / 2);
  }

  /**
   * Calculate dual-coding (show vs tell) score
   */
  private static calculateDualCodingScore(dualCodingAnalysis: any): number {
    // Lower suggestion count = better showing
    const suggestionCount = dualCodingAnalysis.suggestionCount || 0;
    const totalParagraphs = dualCodingAnalysis.totalParagraphs || 1;

    const suggestionRatio = suggestionCount / totalParagraphs;

    // Score based on ratio of paragraphs needing more description
    if (suggestionRatio < 0.1) return 95;
    if (suggestionRatio < 0.2) return 85;
    if (suggestionRatio < 0.3) return 75;
    if (suggestionRatio < 0.4) return 65;
    if (suggestionRatio < 0.5) return 55;
    return 45;
  }

  /**
   * Helper: Count words in text
   */
  private static countWords(text: string): number {
    return text.trim().split(/\s+/).length;
  }
}

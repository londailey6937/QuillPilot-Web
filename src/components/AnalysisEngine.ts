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
import { analyzeProse } from "@/utils/proseQualityAnalyzer";
import type { ProseQualityResult } from "@/utils/proseQualityAnalyzer";
import {
  analyzeEmotionHeatmap,
  analyzePOVConsistency,
  detectCliches,
  detectFilteringWords,
  analyzeBackstoryDensity,
} from "@/utils/visualAnalysisEnhancements";
import type {
  EmotionHeatmapResult,
  POVConsistencyResult,
  ClicheDetectionResult,
  FilteringWordsResult,
  BackstoryDensityResult,
} from "@/utils/visualAnalysisEnhancements";
import {
  analyzeDialogueNarrativeRatio,
  analyzeSceneSequel,
  analyzeConflictTracking,
  analyzeSensoryBalance,
} from "@/utils/advancedMetrics";
import type {
  DialogueNarrativeRatio,
  SceneSequelResult,
  ConflictTrackingResult,
  SensoryBalanceResult,
} from "@/utils/advancedMetrics";

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

      onProgress?.("analyzing-prose-quality", "Analyzing prose quality");

      // Analyze prose quality (word frequency, dialogue, passive voice, etc.)
      const proseQuality: ProseQualityResult = analyzeProse(chapter.content);

      onProgress?.(
        "analyzing-visual-enhancements",
        "Analyzing emotions, POV, and style"
      );

      // Visual analysis enhancements
      const emotionHeatmap: EmotionHeatmapResult = analyzeEmotionHeatmap(
        chapter.content
      );
      const povConsistency: POVConsistencyResult = analyzePOVConsistency(
        chapter.content
      );
      const clicheDetection: ClicheDetectionResult = detectCliches(
        chapter.content
      );
      const filteringWords: FilteringWordsResult = detectFilteringWords(
        chapter.content
      );
      const backstoryDensity: BackstoryDensityResult = analyzeBackstoryDensity(
        chapter.content
      );

      onProgress?.("analyzing-advanced-metrics", "Analyzing advanced metrics");

      // Advanced metrics analysis
      const dialogueNarrativeRatio: DialogueNarrativeRatio =
        analyzeDialogueNarrativeRatio(chapter.content, genre);
      const sceneSequel: SceneSequelResult = analyzeSceneSequel(
        chapter.content
      );
      const conflictTracking: ConflictTrackingResult = analyzeConflictTracking(
        chapter.content
      );
      const sensoryBalance: SensoryBalanceResult = analyzeSensoryBalance(
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
        // Prose Quality Metrics
        {
          principleId: "wordChoice" as any,
          principle: "Word Choice & Variety",
          score: Math.min(
            100,
            (proseQuality.wordFrequency.unique /
              proseQuality.wordFrequency.total) *
              300
          ),
          weight: 0.7,
          details: [
            `Total words: ${proseQuality.wordFrequency.total.toLocaleString()}`,
            `Unique words: ${proseQuality.wordFrequency.unique.toLocaleString()}`,
            `Vocabulary richness: ${(
              (proseQuality.wordFrequency.unique /
                proseQuality.wordFrequency.total) *
              100
            ).toFixed(1)}%`,
            proseQuality.wordFrequency.overusedWords.length > 0
              ? `${proseQuality.wordFrequency.overusedWords.length} potentially overused words detected`
              : "No significantly overused words detected",
          ],
          suggestions:
            proseQuality.wordFrequency.overusedWords.length > 3
              ? [
                  {
                    id: "word-variety-1",
                    principle: "wordChoice" as any,
                    priority: "medium" as const,
                    title: "Expand Vocabulary",
                    description: `Consider varying these frequently used words: ${proseQuality.wordFrequency.overusedWords
                      .slice(0, 5)
                      .map((w) => w.word)
                      .join(", ")}`,
                    implementation:
                      "Use a thesaurus to find synonyms for overused words",
                    expectedImpact: "More engaging and varied prose",
                    relatedConcepts: [],
                  },
                ]
              : [],
        },
        {
          principleId: "dialogueQuality" as any,
          principle: "Dialogue & Attribution",
          score:
            proseQuality.dialogue.totalDialogueLines > 0
              ? Math.min(
                  100,
                  (proseQuality.dialogue.taggedLines /
                    proseQuality.dialogue.totalDialogueLines) *
                    100
                )
              : 50,
          weight: 0.8,
          details: [
            `Dialogue lines: ${proseQuality.dialogue.totalDialogueLines}`,
            `Tagged: ${proseQuality.dialogue.taggedLines}`,
            `Untagged: ${proseQuality.dialogue.untaggedLines}`,
            `Unique speakers: ${proseQuality.dialogue.speakers.size}`,
          ],
          suggestions:
            proseQuality.dialogue.untaggedLines > 5
              ? [
                  {
                    id: "dialogue-1",
                    principle: "dialogueQuality" as any,
                    priority: "medium" as const,
                    title: "Add Dialogue Attribution",
                    description: `${proseQuality.dialogue.untaggedLines} dialogue lines lack clear speaker attribution`,
                    implementation:
                      "Add dialogue tags or action beats to clarify who is speaking",
                    expectedImpact:
                      "Clearer dialogue flow and speaker identification",
                    relatedConcepts: [],
                  },
                ]
              : [],
        },
        {
          principleId: "voiceStrength" as any,
          principle: "Active Voice Usage",
          score: Math.max(0, 100 - proseQuality.passiveVoice.percentage * 2),
          weight: 0.6,
          details: [
            `Passive voice instances: ${proseQuality.passiveVoice.count}`,
            `Passive voice rate: ${proseQuality.passiveVoice.percentage.toFixed(
              1
            )}% of sentences`,
            proseQuality.passiveVoice.percentage < 10
              ? "Excellent active voice usage"
              : proseQuality.passiveVoice.percentage < 20
              ? "Good, but could strengthen some sentences"
              : "Consider revising to active voice for stronger prose",
          ],
          suggestions:
            proseQuality.passiveVoice.count > 10
              ? [
                  {
                    id: "passive-1",
                    principle: "voiceStrength" as any,
                    priority:
                      proseQuality.passiveVoice.percentage > 25
                        ? ("high" as const)
                        : ("medium" as const),
                    title: "Reduce Passive Voice",
                    description: `${proseQuality.passiveVoice.count} instances of passive voice detected. Active voice creates stronger, more engaging prose.`,
                    implementation:
                      "Review sentences with 'was/were [verb]' and rewrite with active subjects",
                    expectedImpact: "More direct and powerful writing",
                    relatedConcepts: [],
                  },
                ]
              : [],
        },
        {
          principleId: "adverbUsage" as any,
          principle: "Adverb Economy",
          score: Math.max(
            0,
            100 - Math.min(100, proseQuality.adverbs.density * 2)
          ),
          weight: 0.5,
          details: [
            `Total adverbs: ${proseQuality.adverbs.count}`,
            `Density: ${proseQuality.adverbs.density.toFixed(
              1
            )} per 1000 words`,
            `Weak adverbs (very, really, etc.): ${proseQuality.adverbs.weakAdverbs}`,
            proseQuality.adverbs.density < 15
              ? "Good adverb usage"
              : "Consider replacing some adverbs with stronger verbs",
          ],
          suggestions:
            proseQuality.adverbs.weakAdverbs > 5
              ? [
                  {
                    id: "adverb-1",
                    principle: "adverbUsage" as any,
                    priority: "low" as const,
                    title: "Reduce Weak Adverbs",
                    description: `${proseQuality.adverbs.weakAdverbs} weak adverbs (very, really, quite, etc.) detected`,
                    implementation:
                      "Replace weak adverb + verb combinations with single strong verbs",
                    expectedImpact: "More concise and impactful writing",
                    relatedConcepts: [],
                  },
                ]
              : [],
        },
        {
          principleId: "sentenceVariety" as any,
          principle: "Sentence Variety",
          score: proseQuality.sentenceVariety.varietyScore,
          weight: 0.7,
          details: [
            `Average sentence length: ${proseQuality.sentenceVariety.averageLength.toFixed(
              1
            )} words`,
            `Short sentences (< 10 words): ${proseQuality.sentenceVariety.shortSentences}`,
            `Medium sentences (10-20 words): ${proseQuality.sentenceVariety.mediumSentences}`,
            `Long sentences (> 20 words): ${proseQuality.sentenceVariety.longSentences}`,
            `Variety score: ${proseQuality.sentenceVariety.varietyScore.toFixed(
              0
            )}/100`,
          ],
          suggestions:
            proseQuality.sentenceVariety.varietyScore < 60
              ? [
                  {
                    id: "variety-1",
                    principle: "sentenceVariety" as any,
                    priority: "medium" as const,
                    title: "Improve Sentence Variety",
                    description:
                      "Sentence length could be more varied. Mix short, punchy sentences with longer, flowing ones.",
                    implementation:
                      "Aim for 30% short, 50% medium, 20% long sentences",
                    expectedImpact: "Better reading rhythm and engagement",
                    relatedConcepts: [],
                  },
                ]
              : [],
        },
        {
          principleId: "readability" as any,
          principle: "Readability",
          score: Math.min(
            100,
            Math.max(
              0,
              100 - Math.abs(proseQuality.readability.fleschKincaid - 8) * 5
            )
          ),
          weight: 0.6,
          details: [
            `Flesch-Kincaid Grade Level: ${proseQuality.readability.fleschKincaid.toFixed(
              1
            )}`,
            `Reading Ease: ${proseQuality.readability.fleschReading.toFixed(
              0
            )}/100`,
            `${proseQuality.readability.interpretation}`,
            `Avg sentence length: ${proseQuality.readability.averageSentenceLength.toFixed(
              1
            )} words`,
            `Avg syllables per word: ${proseQuality.readability.averageSyllablesPerWord.toFixed(
              2
            )}`,
          ],
          suggestions:
            proseQuality.readability.fleschKincaid > 12 ||
            proseQuality.readability.fleschKincaid < 6
              ? [
                  {
                    id: "readability-1",
                    principle: "readability" as any,
                    priority: "low" as const,
                    title:
                      proseQuality.readability.fleschKincaid > 12
                        ? "Simplify Complex Prose"
                        : "Add Complexity",
                    description:
                      proseQuality.readability.fleschKincaid > 12
                        ? "Prose may be too complex. Consider shorter sentences and simpler words."
                        : "Prose may be too simple. Consider varying sentence structure and vocabulary.",
                    implementation:
                      "Target 8th-10th grade reading level for most fiction",
                    expectedImpact: "Optimal readability for target audience",
                    relatedConcepts: [],
                  },
                ]
              : [],
        },
        // Visual Analysis Enhancements
        {
          principleId: "emotionalPacing" as any,
          principle: "Emotional Pacing",
          score: Math.min(100, emotionHeatmap.averageIntensity * 2),
          weight: 0.8,
          details: [
            `Average emotional intensity: ${emotionHeatmap.averageIntensity.toFixed(
              0
            )}/100`,
            `Emotional peaks: ${emotionHeatmap.peaks.length}`,
            `Low-tension valleys: ${emotionHeatmap.valleys.length}`,
            `Dominant emotions: ${Array.from(
              emotionHeatmap.emotionBreakdown.entries()
            )
              .sort((a, b) => b[1] - a[1])
              .slice(0, 3)
              .map(([e]) => e)
              .join(", ")}`,
            ...emotionHeatmap.pacingIssues.slice(0, 2),
          ],
          suggestions:
            emotionHeatmap.pacingIssues.length > 0
              ? emotionHeatmap.pacingIssues.map((issue, i) => ({
                  id: `emotion-${i}`,
                  principle: "emotionalPacing" as any,
                  priority: "medium" as const,
                  title: "Improve Emotional Pacing",
                  description: issue,
                  implementation:
                    "Vary emotional intensity throughout manuscript",
                  expectedImpact: "More engaging, dynamic story",
                  relatedConcepts: [],
                }))
              : [],
        },
        {
          principleId: "povConsistency" as any,
          principle: "POV Consistency",
          score: povConsistency.consistency,
          weight: 0.9,
          details: [
            `Dominant POV: ${povConsistency.dominantPOV}`,
            `POV shifts: ${povConsistency.shiftCount}`,
            `Consistency score: ${povConsistency.consistency.toFixed(0)}/100`,
            `Potential head-hops: ${povConsistency.potentialHeadHops.length}`,
            ...povConsistency.recommendations.slice(0, 2),
          ],
          suggestions:
            povConsistency.potentialHeadHops.length > 0 ||
            povConsistency.consistency < 80
              ? [
                  {
                    id: "pov-1",
                    principle: "povConsistency" as any,
                    priority:
                      povConsistency.potentialHeadHops.length > 3
                        ? ("high" as const)
                        : ("medium" as const),
                    title: "Maintain POV Consistency",
                    description:
                      povConsistency.recommendations[0] || "Review POV shifts",
                    implementation:
                      "Stick to one character's perspective within each scene",
                    expectedImpact:
                      "Clearer narrative voice and reader immersion",
                    relatedConcepts: [],
                  },
                ]
              : [],
        },
        {
          principleId: "clicheAvoidance" as any,
          principle: "Originality (Cliché Avoidance)",
          score: Math.max(0, 100 - Math.min(100, clicheDetection.density * 20)),
          weight: 0.6,
          details: [
            `Clichés detected: ${clicheDetection.count}`,
            `Density: ${clicheDetection.density.toFixed(2)} per 1000 words`,
            clicheDetection.count === 0
              ? "No common clichés detected"
              : `Most common: ${Array.from(clicheDetection.categories.entries())
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 2)
                  .map(([cat, cnt]) => `${cat} (${cnt})`)
                  .join(", ")}`,
          ],
          suggestions:
            clicheDetection.count > 5
              ? [
                  {
                    id: "cliche-1",
                    principle: "clicheAvoidance" as any,
                    priority: "low" as const,
                    title: "Replace Clichés with Fresh Language",
                    description: `${clicheDetection.count} clichés detected. Replace with original descriptions and metaphors.`,
                    implementation:
                      "Review flagged phrases and create unique alternatives",
                    expectedImpact: "More original, engaging prose",
                    relatedConcepts: [],
                  },
                ]
              : [],
        },
        {
          principleId: "directProse" as any,
          principle: "Direct Prose (Filtering Words)",
          score: Math.max(0, 100 - Math.min(100, filteringWords.density * 5)),
          weight: 0.7,
          details: [
            `Filtering words: ${filteringWords.count}`,
            `Density: ${filteringWords.density.toFixed(1)} per 1000 words`,
            `Most common types: ${Array.from(filteringWords.byType.entries())
              .sort((a, b) => b[1] - a[1])
              .slice(0, 3)
              .map(([type, cnt]) => `${type} (${cnt})`)
              .join(", ")}`,
            filteringWords.density < 10
              ? "Strong, direct prose"
              : "Consider removing filter words for immediacy",
          ],
          suggestions:
            filteringWords.count > 20
              ? [
                  {
                    id: "filtering-1",
                    principle: "directProse" as any,
                    priority: "medium" as const,
                    title: "Eliminate Filtering Words",
                    description: `${filteringWords.count} filtering words weaken your prose. Show directly instead of filtering through perception verbs.`,
                    implementation:
                      "Replace 'She saw the door open' with 'The door opened'",
                    expectedImpact: "More immediate, engaging narrative",
                    relatedConcepts: [],
                  },
                ]
              : [],
        },
        {
          principleId: "backstoryBalance" as any,
          principle: "Backstory Balance",
          score: Math.max(
            0,
            100 - Math.min(100, backstoryDensity.percentage * 2)
          ),
          weight: 0.7,
          details: [
            `Backstory sections: ${backstoryDensity.sections.length}`,
            `Total backstory: ${backstoryDensity.percentage.toFixed(
              1
            )}% of manuscript`,
            `Opening chapters backstory: ${backstoryDensity.openingChaptersBackstory.toFixed(
              1
            )}%`,
            `Heavy sections: ${
              backstoryDensity.sections.filter((s) => s.severity === "heavy")
                .length
            }`,
            ...backstoryDensity.warnings.slice(0, 2),
          ],
          suggestions:
            backstoryDensity.warnings.length > 0
              ? backstoryDensity.warnings.map((warning, i) => ({
                  id: `backstory-${i}`,
                  principle: "backstoryBalance" as any,
                  priority:
                    backstoryDensity.openingChaptersBackstory > 30
                      ? ("high" as const)
                      : ("medium" as const),
                  title: "Reduce Backstory Density",
                  description: warning,
                  implementation:
                    "Weave backstory gradually through action and dialogue",
                  expectedImpact: "Better pacing and reader engagement",
                  relatedConcepts: [],
                }))
              : [],
        },
        // Fiction Elements - add all 12 elements as individual scores
        ...fictionElements.elements
          .sort((a, b) => b.score - a.score)
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
            `Strong: ${fictionElements.elements
              .filter((e) => e.score >= 70)
              .map((e) => e.element)
              .join(", ")}`,
            `Needs work: ${fictionElements.elements
              .filter((e) => e.score < 60)
              .map((e) => e.element)
              .join(", ")}`,
          ],
          suggestions: [],
        },
        // Advanced Metrics
        {
          principleId: "dialogueNarrativeBalance" as any,
          principle: "Dialogue-to-Narrative Balance",
          score:
            dialogueNarrativeRatio.balance === "excellent"
              ? 90
              : dialogueNarrativeRatio.balance === "good"
              ? 75
              : 55,
          weight: 0.8,
          details: [
            `Dialogue: ${dialogueNarrativeRatio.dialoguePercentage.toFixed(
              1
            )}% (target: ${dialogueNarrativeRatio.genreTarget.idealDialogue}%)`,
            `Description: ${dialogueNarrativeRatio.descriptionPercentage.toFixed(
              1
            )}% (target: ${
              dialogueNarrativeRatio.genreTarget.idealDescription
            }%)`,
            `Action: ${dialogueNarrativeRatio.actionPercentage.toFixed(
              1
            )}% (target: ${dialogueNarrativeRatio.genreTarget.idealAction}%)`,
            `Genre: ${dialogueNarrativeRatio.genreTarget.genre}`,
          ],
          suggestions: dialogueNarrativeRatio.recommendations.map((rec, i) => ({
            id: `dialogue-ratio-${i}`,
            principle: "dialogueNarrativeBalance" as any,
            priority: "medium" as const,
            title: "Balance Dialogue and Narrative",
            description: rec,
            implementation:
              "Adjust proportion of dialogue, description, and action",
            expectedImpact: `Better pacing for ${dialogueNarrativeRatio.genreTarget.genre} genre`,
            relatedConcepts: [],
          })),
        },
        {
          principleId: "sceneSequelStructure" as any,
          principle: "Scene vs Sequel Structure",
          score:
            sceneSequel.balance === "excellent"
              ? 90
              : sceneSequel.balance === "good"
              ? 75
              : 50,
          weight: 0.8,
          details: [
            `Scenes: ${sceneSequel.sceneCount}`,
            `Sequels: ${sceneSequel.sequelCount}`,
            `Scene:Sequel ratio: ${sceneSequel.sceneToSequelRatio.toFixed(
              1
            )}:1`,
            `Avg scene length: ${sceneSequel.averageSceneLength.toFixed(
              0
            )} words`,
            `Avg sequel length: ${sceneSequel.averageSequelLength.toFixed(
              0
            )} words`,
          ],
          suggestions: sceneSequel.recommendations.map((rec, i) => ({
            id: `scene-sequel-${i}`,
            principle: "sceneSequelStructure" as any,
            priority:
              sceneSequel.balance === "unbalanced"
                ? ("high" as const)
                : ("medium" as const),
            title: "Balance Scene and Sequel",
            description: rec,
            implementation:
              "Add action scenes or reflection/decision points as needed",
            expectedImpact: "Better pacing rhythm and character development",
            relatedConcepts: [],
          })),
        },
        {
          principleId: "conflictPresence" as any,
          principle: "Conflict Tracking",
          score: Math.min(
            100,
            40 +
              conflictTracking.conflictDensity * 10 +
              conflictTracking.averageIntensity / 2
          ),
          weight: 1.0,
          details: [
            `Total conflicts: ${conflictTracking.totalConflicts}`,
            `Internal: ${conflictTracking.internalCount}`,
            `External: ${conflictTracking.externalCount}`,
            `Interpersonal: ${conflictTracking.interpersonalCount}`,
            `Conflict density: ${conflictTracking.conflictDensity.toFixed(
              1
            )} per 1000 words`,
            `Average intensity: ${conflictTracking.averageIntensity.toFixed(
              0
            )}/100`,
            `Low-conflict sections: ${conflictTracking.lowConflictSections.length}`,
          ],
          suggestions: conflictTracking.recommendations.map((rec, i) => ({
            id: `conflict-${i}`,
            principle: "conflictPresence" as any,
            priority:
              conflictTracking.conflictDensity < 1
                ? ("high" as const)
                : ("medium" as const),
            title: "Strengthen Conflict",
            description: rec,
            implementation:
              "Add obstacles, tensions, and challenges throughout",
            expectedImpact: "Increased tension and reader engagement",
            relatedConcepts: [],
          })),
        },
        {
          principleId: "sensoryRichness" as any,
          principle: "Sensory Balance",
          score:
            sensoryBalance.balance === "excellent"
              ? 90
              : sensoryBalance.balance === "good"
              ? 75
              : sensoryBalance.balance === "visual-heavy"
              ? 60
              : 50,
          weight: 0.7,
          details: [
            `Total sensory details: ${sensoryBalance.total}`,
            `Sight: ${sensoryBalance.sightPercentage.toFixed(1)}%`,
            `Sound: ${sensoryBalance.soundPercentage.toFixed(1)}%`,
            `Touch: ${sensoryBalance.touchPercentage.toFixed(1)}%`,
            `Smell: ${sensoryBalance.smellPercentage.toFixed(1)}%`,
            `Taste: ${sensoryBalance.tastePercentage.toFixed(1)}%`,
          ],
          suggestions: sensoryBalance.recommendations.map((rec, i) => ({
            id: `sensory-${i}`,
            principle: "sensoryRichness" as any,
            priority:
              sensoryBalance.balance === "visual-heavy"
                ? ("medium" as const)
                : ("low" as const),
            title: "Balance Sensory Details",
            description: rec,
            implementation: "Add underutilized senses throughout scenes",
            expectedImpact: "Richer, more immersive world-building",
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
        characterAnalysis, // Add character analysis for trajectory chart
        proseQuality, // Add prose quality metrics
        emotionHeatmap, // Emotional pacing heatmap
        povConsistency, // POV tracking
        clicheDetection, // Cliché detection
        filteringWords, // Filtering words
        backstoryDensity, // Backstory analysis
        dialogueNarrativeRatio, // Dialogue vs narrative balance
        sceneSequel, // Scene vs sequel structure
        conflictTracking, // Conflict presence and density
        sensoryBalance, // Sensory details balance
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

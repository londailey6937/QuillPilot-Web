import React, { useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import {
  ChapterAnalysis,
  Concept,
  ConceptNode,
  ConceptLink,
  PrincipleEvaluation,
  ConceptRelationship,
} from "@/types";
import type { ReviewPattern, InterleavingData } from "@/types";
// import { ConceptList } from "./ConceptList"; // Removed in MVP
// import ConceptRelationshipsSection from "./ConceptRelationshipsSection"; // Removed in MVP
// import PatternAnalysisSection from "./PatternAnalysisSection"; // Removed in MVP
// import { PrerequisiteOrderCard } from "./PrerequisiteOrderCard"; // Removed in MVP
// import { GeneralConceptGenerator } from "./GeneralConceptGenerator"; // Removed in MVP
import type { GeneralConcept } from "@/utils/generalConceptExtractor";

// Friendly display names for principle enum codes to avoid raw concatenation (e.g., "dualCoding") in UI copy
const PRINCIPLE_NAME_MAP: Record<string, string> = {
  deepProcessing: "Deep Processing",
  spacedRepetition: "Spaced Repetition",
  retrievalPractice: "Retrieval Practice",
  interleaving: "Interleaving",
  dualCoding: "Show vs Tell",
  generativeLearning: "Generative Learning",
  metacognition: "Metacognition",
  schemaBuilding: "Schema Building",
  cognitiveLoad: "Cognitive Load",
  emotionAndRelevance: "Emotion & Relevance",
  pacing: "Pacing & Flow",
  characterDevelopment: "Character Development",
  themeDepth: "Theme Depth",
  genreTropes: "Genre Conventions",
  fictionElement0: "Fiction Element (Top)",
  fictionElement1: "Fiction Element (2nd)",
  fictionElement2: "Fiction Element (3rd)",
  fictionElement3: "Fiction Element (4th)",
  fictionElement4: "Fiction Element (5th)",
  fictionElement5: "Fiction Element (6th)",
  fictionElement6: "Fiction Element (7th)",
  fictionElement7: "Fiction Element (8th)",
  fictionElement8: "Fiction Element (9th)",
  fictionElement9: "Fiction Element (10th)",
  fictionElement10: "Fiction Element (11th)",
  fictionElement11: "Fiction Element (12th)",
  fictionBalance: "Fiction Elements Balance",
  wordChoice: "Word Choice & Variety",
  dialogueQuality: "Dialogue & Attribution",
  voiceStrength: "Active Voice Usage",
  adverbUsage: "Adverb Economy",
  sentenceVariety: "Sentence Variety",
  readability: "Readability",
  emotionalPacing: "Emotional Pacing",
  povConsistency: "POV Consistency",
  clicheAvoidance: "Originality (Cliché Avoidance)",
  directProse: "Direct Prose (Filtering Words)",
  backstoryBalance: "Backstory Balance",
  dialogueNarrativeBalance: "Dialogue-to-Narrative Balance",
  sceneSequelStructure: "Scene vs Sequel Structure",
  conflictPresence: "Conflict Tracking",
  sensoryRichness: "Sensory Balance",
};

/**
 * Character Arc Trajectory Chart
 * Shows emotional journey of major characters across story progression
 */
const CharacterArcTrajectory: React.FC<{ characterAnalysis: any }> = ({
  characterAnalysis,
}) => {
  // Filter to major characters only (protagonist or major role with enough mentions)
  const majorCharacters = characterAnalysis.characters.filter(
    (char: any) =>
      (char.role === "protagonist" || char.role === "major") &&
      char.totalMentions >= 5
  );

  if (majorCharacters.length === 0) {
    return null;
  }

  // Prepare data for line chart
  const trajectoryData = [
    { stage: "Early", position: 0 },
    { stage: "Middle", position: 50 },
    { stage: "Late", position: 100 },
  ];

  // Add each character's trajectory to the data
  majorCharacters.forEach((char: any) => {
    trajectoryData[0][char.name] = char.emotionalTrajectory.early;
    trajectoryData[1][char.name] = char.emotionalTrajectory.middle;
    trajectoryData[2][char.name] = char.emotionalTrajectory.late;
  });

  // Color palette for characters
  const colors = [
    "#8b5cf6", // purple
    "#3b82f6", // blue
    "#10b981", // green
    "#f59e0b", // orange
    "#ef4444", // red
    "#ec4899", // pink
  ];

  return (
    <div className="viz-card character-arc-trajectory">
      <h3>Character Emotional Arcs</h3>
      <p className="section-subtitle">
        Emotional trajectory of major characters across the manuscript (0 =
        negative, 50 = neutral, 100 = positive)
      </p>
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={trajectoryData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis
            dataKey="stage"
            stroke="#999"
            tick={{ fill: "#999" }}
            label={{
              value: "Story Progression",
              position: "insideBottom",
              offset: -5,
              style: { fill: "#999" },
            }}
          />
          <YAxis
            stroke="#999"
            tick={{ fill: "#999" }}
            domain={[0, 100]}
            label={{
              value: "Emotional Sentiment",
              angle: -90,
              position: "insideLeft",
              style: { fill: "#999" },
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1a1a1a",
              border: "1px solid #333",
              borderRadius: "8px",
            }}
            labelStyle={{ color: "#fff" }}
          />
          <Legend
            wrapperStyle={{ paddingTop: "20px" }}
            iconType="line"
            formatter={(value) => (
              <span style={{ color: "#ccc" }}>{value}</span>
            )}
          />
          {majorCharacters.map((char: any, idx: number) => (
            <Line
              key={char.name}
              type="monotone"
              dataKey={char.name}
              stroke={colors[idx % colors.length]}
              strokeWidth={2}
              dot={{ r: 5 }}
              activeDot={{ r: 7 }}
              name={`${char.name} (${char.arcType})`}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
      <div className="character-arc-summary">
        {majorCharacters.map((char: any, idx: number) => (
          <div key={char.name} className="character-summary-item">
            <span
              className="character-color-dot"
              style={{ backgroundColor: colors[idx % colors.length] }}
            ></span>
            <strong>{char.name}</strong>
            <span className="character-role">({char.role})</span>
            <span className="character-arc-type">Arc: {char.arcType}</span>
            <span className="character-development">
              Development: {char.developmentScore}/100
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Prose Quality Dashboard
 * Visualizations for word frequency, dialogue, passive voice, adverbs, sentence variety, and readability
 */
const ProseQualityDashboard: React.FC<{ proseQuality: any }> = ({
  proseQuality,
}) => {
  const [selectedMetric, setSelectedMetric] = useState<string>("overview");

  return (
    <div className="prose-quality-dashboard">
      <h3>Prose Quality Analysis</h3>
      <p className="section-subtitle">
        Deep dive into writing mechanics and style
      </p>

      {/* Overview Cards */}
      <div className="prose-overview-grid">
        <div className="prose-metric-card">
          <div className="metric-icon">📚</div>
          <div className="metric-value">
            {proseQuality.wordFrequency.unique.toLocaleString()}
          </div>
          <div className="metric-label">Unique Words</div>
          <div className="metric-detail">
            {(
              (proseQuality.wordFrequency.unique /
                proseQuality.wordFrequency.total) *
              100
            ).toFixed(1)}
            % vocabulary richness
          </div>
        </div>

        <div className="prose-metric-card">
          <div className="metric-icon">💬</div>
          <div className="metric-value">
            {proseQuality.dialogue.totalDialogueLines}
          </div>
          <div className="metric-label">Dialogue Lines</div>
          <div className="metric-detail">
            {proseQuality.dialogue.speakers.size} unique speakers
          </div>
        </div>

        <div className="prose-metric-card">
          <div className="metric-icon">⚡</div>
          <div className="metric-value">
            {proseQuality.passiveVoice.percentage.toFixed(1)}%
          </div>
          <div className="metric-label">Passive Voice</div>
          <div className="metric-detail">
            {proseQuality.passiveVoice.count} instances
          </div>
        </div>

        <div className="prose-metric-card">
          <div className="metric-icon">✍️</div>
          <div className="metric-value">
            {proseQuality.adverbs.density.toFixed(0)}
          </div>
          <div className="metric-label">Adverbs per 1K</div>
          <div className="metric-detail">
            {proseQuality.adverbs.weakAdverbs} weak adverbs
          </div>
        </div>

        <div className="prose-metric-card">
          <div className="metric-icon">📊</div>
          <div className="metric-value">
            {proseQuality.sentenceVariety.varietyScore.toFixed(0)}
          </div>
          <div className="metric-label">Variety Score</div>
          <div className="metric-detail">
            Avg: {proseQuality.sentenceVariety.averageLength.toFixed(1)} words
          </div>
        </div>

        <div className="prose-metric-card">
          <div className="metric-icon">🎯</div>
          <div className="metric-value">
            {proseQuality.readability.fleschKincaid.toFixed(1)}
          </div>
          <div className="metric-label">Grade Level</div>
          <div className="metric-detail">
            {proseQuality.readability.interpretation.split(" - ")[0]}
          </div>
        </div>
      </div>

      {/* Sentence Length Distribution Chart */}
      <div className="viz-card sentence-distribution">
        <h4>Sentence Length Distribution</h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={[
              {
                name: "Short (< 10)",
                count: proseQuality.sentenceVariety.shortSentences,
                fill: "#10b981",
              },
              {
                name: "Medium (10-20)",
                count: proseQuality.sentenceVariety.mediumSentences,
                fill: "#3b82f6",
              },
              {
                name: "Long (> 20)",
                count: proseQuality.sentenceVariety.longSentences,
                fill: "#8b5cf6",
              },
            ]}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="name" stroke="#999" tick={{ fill: "#999" }} />
            <YAxis stroke="#999" tick={{ fill: "#999" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1a1a1a",
                border: "1px solid #333",
                borderRadius: "8px",
              }}
              labelStyle={{ color: "#fff" }}
            />
            <Bar dataKey="count" radius={[8, 8, 0, 0]}>
              {[0, 1, 2].map((index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    index === 0
                      ? "#10b981"
                      : index === 1
                      ? "#3b82f6"
                      : "#8b5cf6"
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="sentence-variety-note">
          <p>
            <strong>Ideal Mix:</strong> 30% short (punchy), 50% medium
            (standard), 20% long (flowing)
          </p>
          <p>
            <strong>Current:</strong>{" "}
            {(
              (proseQuality.sentenceVariety.shortSentences /
                proseQuality.sentenceVariety.sentences.length) *
              100
            ).toFixed(0)}
            % short,{" "}
            {(
              (proseQuality.sentenceVariety.mediumSentences /
                proseQuality.sentenceVariety.sentences.length) *
              100
            ).toFixed(0)}
            % medium,{" "}
            {(
              (proseQuality.sentenceVariety.longSentences /
                proseQuality.sentenceVariety.sentences.length) *
              100
            ).toFixed(0)}
            % long
          </p>
        </div>
      </div>

      {/* Top Overused Words */}
      {proseQuality.wordFrequency.overusedWords.length > 0 && (
        <div className="viz-card overused-words">
          <h4>Potentially Overused Words</h4>
          <p className="section-subtitle">
            Words that appear frequently - consider varying with synonyms
          </p>
          <div className="word-frequency-grid">
            {proseQuality.wordFrequency.overusedWords
              .slice(0, 20)
              .map((word: any) => (
                <div key={word.word} className="word-freq-item">
                  <span className="word-text">{word.word}</span>
                  <span className="word-count">{word.count}×</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Dialogue Speakers Breakdown */}
      {proseQuality.dialogue.speakers.size > 0 && (
        <div className="viz-card dialogue-breakdown">
          <h4>Dialogue Attribution</h4>
          <div className="dialogue-stats">
            <div className="dialogue-stat">
              <div className="stat-value">
                {proseQuality.dialogue.totalDialogueLines}
              </div>
              <div className="stat-label">Total Lines</div>
            </div>
            <div className="dialogue-stat">
              <div className="stat-value">
                {proseQuality.dialogue.taggedLines}
              </div>
              <div className="stat-label">Tagged</div>
            </div>
            <div className="dialogue-stat warning">
              <div className="stat-value">
                {proseQuality.dialogue.untaggedLines}
              </div>
              <div className="stat-label">Untagged</div>
            </div>
            <div className="dialogue-stat">
              <div className="stat-value">
                {proseQuality.dialogue.speakers.size}
              </div>
              <div className="stat-label">Speakers</div>
            </div>
          </div>
          {proseQuality.dialogue.speakers.size > 0 && (
            <div className="speakers-list">
              <h5>Speaker Frequency:</h5>
              <div className="speaker-grid">
                {(
                  Array.from(proseQuality.dialogue.speakers.entries()) as [
                    string,
                    number
                  ][]
                )
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 10)
                  .map(([speaker, count]: [string, number]) => (
                    <div key={speaker} className="speaker-item">
                      <span className="speaker-name">{speaker}</span>
                      <span className="speaker-count">{count} lines</span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Visual Analysis Enhancements Dashboard
 * Shows emotion heatmap, POV consistency, clichés, filtering words, and backstory
 */
const VisualAnalysisDashboard: React.FC<{ analysis: any }> = ({ analysis }) => {
  if (
    !analysis.emotionHeatmap &&
    !analysis.povConsistency &&
    !analysis.clicheDetection &&
    !analysis.filteringWords &&
    !analysis.backstoryDensity
  ) {
    return null;
  }

  return (
    <div className="visual-analysis-dashboard">
      <h3>Advanced Style Analysis</h3>
      <p className="section-subtitle">
        Emotional pacing, POV consistency, originality, and style insights
      </p>

      {/* Emotion Heatmap */}
      {analysis.emotionHeatmap && (
        <div className="viz-card emotion-heatmap">
          <h4>Emotional Intensity Heatmap</h4>
          <p className="section-subtitle">
            Track emotional tension throughout the manuscript
          </p>
          <div style={{ width: "100%", overflowX: "auto" }}>
            <div
              style={{
                minWidth: Math.max(
                  800,
                  analysis.emotionHeatmap.dataPoints.length * 20
                ),
              }}
            >
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analysis.emotionHeatmap.dataPoints}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis
                    dataKey="position"
                    stroke="#999"
                    tick={{ fill: "#999" }}
                    label={{
                      value: "Page Number (approx. 350 words/page)",
                      position: "insideBottom",
                      offset: -5,
                      style: { fill: "#999" },
                    }}
                    tickFormatter={(value) => `p${Math.ceil(value / 2500)}`}
                  />
                  <YAxis
                    stroke="#999"
                    tick={{ fill: "#999" }}
                    domain={[0, 100]}
                    label={{
                      value: "Emotional Intensity",
                      angle: -90,
                      position: "insideLeft",
                      style: { fill: "#999" },
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1a1a1a",
                      border: "1px solid #333",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "#fff" }}
                    labelFormatter={(value) =>
                      `Page ${Math.ceil(Number(value) / 2500)}`
                    }
                    formatter={(value: any, name: string) => [
                      `${value}/100`,
                      "Intensity",
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="intensity"
                    stroke="#f59e0b"
                    strokeWidth={3}
                    dot={false}
                    name="Emotional Intensity"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="emotion-insights">
            <div className="insight-grid">
              <div className="insight-item">
                <strong>Average Intensity:</strong>{" "}
                {analysis.emotionHeatmap.averageIntensity.toFixed(0)}/100
              </div>
              <div className="insight-item">
                <strong>Peaks:</strong> {analysis.emotionHeatmap.peaks.length}
              </div>
              <div className="insight-item">
                <strong>Valleys:</strong>{" "}
                {analysis.emotionHeatmap.valleys.length}
              </div>
            </div>
            {analysis.emotionHeatmap.pacingIssues.length > 0 && (
              <div className="pacing-issues">
                <h5>⚠️ Pacing Suggestions:</h5>
                <ul>
                  {analysis.emotionHeatmap.pacingIssues.map(
                    (issue: string, idx: number) => (
                      <li key={idx}>{issue}</li>
                    )
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* POV Consistency */}
      {analysis.povConsistency && (
        <div className="viz-card pov-consistency">
          <h4>Point of View Consistency</h4>
          <div className="pov-stats-grid">
            <div className="pov-stat-card">
              <div className="stat-icon">👁️</div>
              <div className="stat-value">
                {analysis.povConsistency.dominantPOV}
              </div>
              <div className="stat-label">Dominant POV</div>
            </div>
            <div className="pov-stat-card">
              <div className="stat-icon">🔄</div>
              <div className="stat-value">
                {analysis.povConsistency.shiftCount}
              </div>
              <div className="stat-label">POV Shifts</div>
            </div>
            <div className="pov-stat-card">
              <div className="stat-icon">✓</div>
              <div className="stat-value">
                {analysis.povConsistency.consistency.toFixed(0)}%
              </div>
              <div className="stat-label">Consistency</div>
            </div>
            <div className="pov-stat-card warning">
              <div className="stat-icon">⚠️</div>
              <div className="stat-value">
                {analysis.povConsistency.potentialHeadHops.length}
              </div>
              <div className="stat-label">Potential Head-Hops</div>
            </div>
          </div>
          {analysis.povConsistency.recommendations.length > 0 && (
            <div className="pov-recommendations">
              <h5>Recommendations:</h5>
              <ul>
                {analysis.povConsistency.recommendations.map(
                  (rec: string, idx: number) => (
                    <li key={idx}>{rec}</li>
                  )
                )}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Cliché Detection */}
      {analysis.clicheDetection && analysis.clicheDetection.count > 0 && (
        <div className="viz-card cliche-detection">
          <h4>Cliché Detection</h4>
          <div className="cliche-summary">
            <strong>{analysis.clicheDetection.count}</strong> clichés detected (
            {analysis.clicheDetection.density.toFixed(2)} per 1000 words)
          </div>
          <div className="cliche-list">
            {analysis.clicheDetection.instances
              .slice(0, 10)
              .map((cliche: any, idx: number) => (
                <div
                  key={idx}
                  className={`cliche-item severity-${cliche.severity}`}
                >
                  <div className="cliche-phrase">"{cliche.cliche}"</div>
                  <div className="cliche-alternative">
                    <strong>Try instead:</strong> {cliche.alternative}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Filtering Words */}
      {analysis.filteringWords && analysis.filteringWords.count > 0 && (
        <div className="viz-card filtering-words">
          <h4>Filtering Words Detected</h4>
          <div className="filtering-summary">
            <strong>{analysis.filteringWords.count}</strong> filtering words
            found ({analysis.filteringWords.density.toFixed(1)} per 1000 words)
          </div>
          <div className="filtering-types">
            {(
              Array.from(analysis.filteringWords.byType.entries()) as [
                string,
                number
              ][]
            )
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5)
              .map(([type, count]: [string, number]) => (
                <div key={type} className="filtering-type-item">
                  <span className="type-name">{type}</span>
                  <span className="type-count">{count}</span>
                </div>
              ))}
          </div>
          <div className="filtering-tip">
            <strong>💡 Tip:</strong> Remove filtering words for more immediate,
            engaging prose. Instead of "She saw the door open," write "The door
            opened."
          </div>
        </div>
      )}

      {/* Backstory Density */}
      {analysis.backstoryDensity && (
        <div className="viz-card backstory-density">
          <h4>Backstory Distribution</h4>
          <div className="backstory-stats">
            <div className="backstory-stat">
              <div className="stat-value">
                {analysis.backstoryDensity.percentage.toFixed(1)}%
              </div>
              <div className="stat-label">Total Backstory</div>
            </div>
            <div className="backstory-stat">
              <div className="stat-value">
                {analysis.backstoryDensity.openingChaptersBackstory.toFixed(1)}%
              </div>
              <div className="stat-label">Opening Chapters</div>
            </div>
            <div className="backstory-stat">
              <div className="stat-value">
                {analysis.backstoryDensity.sections.length}
              </div>
              <div className="stat-label">Backstory Sections</div>
            </div>
          </div>
          {analysis.backstoryDensity.distribution && (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={analysis.backstoryDensity.distribution.map(
                  (value: number, idx: number) => ({
                    section: `${idx * 10}-${(idx + 1) * 10}%`,
                    backstory: value,
                  })
                )}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis
                  dataKey="section"
                  stroke="#999"
                  tick={{ fill: "#999" }}
                />
                <YAxis stroke="#999" tick={{ fill: "#999" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1a1a",
                    border: "1px solid #333",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "#fff" }}
                />
                <Bar dataKey="backstory" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
          {analysis.backstoryDensity.warnings.length > 0 && (
            <div className="backstory-warnings">
              <h5>⚠️ Warnings:</h5>
              <ul>
                {analysis.backstoryDensity.warnings.map(
                  (warning: string, idx: number) => (
                    <li key={idx}>{warning}</li>
                  )
                )}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Advanced Metrics Dashboard
 * Shows dialogue-to-narrative ratio, scene vs sequel, conflict tracking, and sensory balance
 */
export const AdvancedMetricsDashboard: React.FC<{
  analysis: ChapterAnalysis;
}> = ({ analysis }) => {
  if (
    !analysis.dialogueNarrativeRatio &&
    !analysis.sceneSequel &&
    !analysis.conflictTracking &&
    !analysis.sensoryBalance
  ) {
    return null;
  }

  return (
    <div className="advanced-metrics-dashboard">
      <h3 className="dashboard-title">📊 Advanced Manuscript Metrics</h3>

      {/* Dialogue-to-Narrative Ratio */}
      {analysis.dialogueNarrativeRatio && (
        <div className="metric-section dialogue-narrative-section">
          <h4>💬 Dialogue-to-Narrative Balance</h4>
          <div className="balance-cards">
            <div className="balance-card dialogue-card">
              <div className="card-label">Dialogue</div>
              <div className="card-value">
                {analysis.dialogueNarrativeRatio.dialoguePercentage.toFixed(1)}%
              </div>
              <div className="card-target">
                Target:{" "}
                {analysis.dialogueNarrativeRatio.genreTarget.idealDialogue}%
              </div>
            </div>
            <div className="balance-card description-card">
              <div className="card-label">Description</div>
              <div className="card-value">
                {analysis.dialogueNarrativeRatio.descriptionPercentage.toFixed(
                  1
                )}
                %
              </div>
              <div className="card-target">
                Target:{" "}
                {analysis.dialogueNarrativeRatio.genreTarget.idealDescription}%
              </div>
            </div>
            <div className="balance-card action-card">
              <div className="card-label">Action</div>
              <div className="card-value">
                {analysis.dialogueNarrativeRatio.actionPercentage.toFixed(1)}%
              </div>
              <div className="card-target">
                Target:{" "}
                {analysis.dialogueNarrativeRatio.genreTarget.idealAction}%
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={[
                {
                  name: "Your Manuscript",
                  dialogue: analysis.dialogueNarrativeRatio.dialoguePercentage,
                  description:
                    analysis.dialogueNarrativeRatio.descriptionPercentage,
                  action: analysis.dialogueNarrativeRatio.actionPercentage,
                },
                {
                  name: `${analysis.dialogueNarrativeRatio.genreTarget.genre} Target`,
                  dialogue:
                    analysis.dialogueNarrativeRatio.genreTarget.idealDialogue,
                  description:
                    analysis.dialogueNarrativeRatio.genreTarget
                      .idealDescription,
                  action:
                    analysis.dialogueNarrativeRatio.genreTarget.idealAction,
                },
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis
                label={{
                  value: "Percentage (%)",
                  angle: -90,
                  position: "insideLeft",
                }}
              />
              <Tooltip />
              <Legend />
              <Bar dataKey="dialogue" fill="#3b82f6" name="Dialogue" />
              <Bar dataKey="description" fill="#10b981" name="Description" />
              <Bar dataKey="action" fill="#f59e0b" name="Action" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Scene vs Sequel Structure */}
      {analysis.sceneSequel && (
        <div className="metric-section scene-sequel-section">
          <h4>⚡ Scene vs Sequel Structure</h4>
          <div className="scene-sequel-stats">
            <div className="stat-card scene-stat">
              <div className="stat-label">Scenes (Action)</div>
              <div className="stat-value">
                {analysis.sceneSequel.sceneCount}
              </div>
              <div className="stat-detail">
                Avg: {analysis.sceneSequel.averageSceneLength.toFixed(0)} words
              </div>
            </div>
            <div className="stat-card sequel-stat">
              <div className="stat-label">Sequels (Reflection)</div>
              <div className="stat-value">
                {analysis.sceneSequel.sequelCount}
              </div>
              <div className="stat-detail">
                Avg: {analysis.sceneSequel.averageSequelLength.toFixed(0)} words
              </div>
            </div>
            <div className="stat-card ratio-stat">
              <div className="stat-label">Ratio</div>
              <div className="stat-value">
                {analysis.sceneSequel.sceneToSequelRatio.toFixed(1)}:1
              </div>
              <div className="stat-detail">
                {analysis.sceneSequel.balance === "excellent"
                  ? "✅ Excellent"
                  : analysis.sceneSequel.balance === "good"
                  ? "👍 Good"
                  : "⚠️ Unbalanced"}
              </div>
            </div>
          </div>
          {analysis.sceneSequel.recommendations.length > 0 && (
            <div className="recommendations-list">
              <h5>💡 Recommendations:</h5>
              <ul>
                {analysis.sceneSequel.recommendations.map(
                  (rec: string, idx: number) => (
                    <li key={idx}>{rec}</li>
                  )
                )}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Conflict Tracking */}
      {analysis.conflictTracking && (
        <div className="metric-section conflict-section">
          <h4>⚔️ Conflict Tracking</h4>
          <div className="conflict-overview">
            <div className="conflict-stat total">
              <span className="stat-label">Total Conflicts:</span>
              <span className="stat-value">
                {analysis.conflictTracking.totalConflicts}
              </span>
            </div>
            <div className="conflict-stat density">
              <span className="stat-label">Density:</span>
              <span className="stat-value">
                {analysis.conflictTracking.conflictDensity.toFixed(1)} per 1K
                words
              </span>
            </div>
            <div className="conflict-stat intensity">
              <span className="stat-label">Avg Intensity:</span>
              <span className="stat-value">
                {analysis.conflictTracking.averageIntensity.toFixed(0)}/100
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={[
                {
                  name: "Internal",
                  count: analysis.conflictTracking.internalCount,
                  fill: "#8b5cf6",
                },
                {
                  name: "External",
                  count: analysis.conflictTracking.externalCount,
                  fill: "#ef4444",
                },
                {
                  name: "Interpersonal",
                  count: analysis.conflictTracking.interpersonalCount,
                  fill: "#f59e0b",
                },
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis
                label={{ value: "Count", angle: -90, position: "insideLeft" }}
              />
              <Tooltip />
              <Bar dataKey="count" />
            </BarChart>
          </ResponsiveContainer>
          {analysis.conflictTracking.lowConflictSections.length > 0 && (
            <div className="low-conflict-warning">
              ⚠️ {analysis.conflictTracking.lowConflictSections.length}{" "}
              section(s) with minimal conflict detected
            </div>
          )}
        </div>
      )}

      {/* Sensory Balance */}
      {analysis.sensoryBalance && (
        <div className="metric-section sensory-section">
          <h4>👁️ Sensory Balance</h4>
          <div className="sensory-grid">
            <div className="sensory-card sight">
              <span className="sense-emoji">👁️</span>
              <span className="sense-label">Sight</span>
              <span className="sense-value">
                {analysis.sensoryBalance.sightPercentage.toFixed(1)}%
              </span>
              <span className="sense-count">
                ({analysis.sensoryBalance.sightCount})
              </span>
            </div>
            <div className="sensory-card sound">
              <span className="sense-emoji">👂</span>
              <span className="sense-label">Sound</span>
              <span className="sense-value">
                {analysis.sensoryBalance.soundPercentage.toFixed(1)}%
              </span>
              <span className="sense-count">
                ({analysis.sensoryBalance.soundCount})
              </span>
            </div>
            <div className="sensory-card touch">
              <span className="sense-emoji">✋</span>
              <span className="sense-label">Touch</span>
              <span className="sense-value">
                {analysis.sensoryBalance.touchPercentage.toFixed(1)}%
              </span>
              <span className="sense-count">
                ({analysis.sensoryBalance.touchCount})
              </span>
            </div>
            <div className="sensory-card smell">
              <span className="sense-emoji">👃</span>
              <span className="sense-label">Smell</span>
              <span className="sense-value">
                {analysis.sensoryBalance.smellPercentage.toFixed(1)}%
              </span>
              <span className="sense-count">
                ({analysis.sensoryBalance.smellCount})
              </span>
            </div>
            <div className="sensory-card taste">
              <span className="sense-emoji">👅</span>
              <span className="sense-label">Taste</span>
              <span className="sense-value">
                {analysis.sensoryBalance.tastePercentage.toFixed(1)}%
              </span>
              <span className="sense-count">
                ({analysis.sensoryBalance.tasteCount})
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart
              data={[
                {
                  sense: "Sight",
                  value: analysis.sensoryBalance.sightPercentage,
                },
                {
                  sense: "Sound",
                  value: analysis.sensoryBalance.soundPercentage,
                },
                {
                  sense: "Touch",
                  value: analysis.sensoryBalance.touchPercentage,
                },
                {
                  sense: "Smell",
                  value: analysis.sensoryBalance.smellPercentage,
                },
                {
                  sense: "Taste",
                  value: analysis.sensoryBalance.tastePercentage,
                },
              ]}
            >
              <PolarGrid />
              <PolarAngleAxis dataKey="sense" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar
                name="Sensory Balance"
                dataKey="value"
                stroke="#8b5cf6"
                fill="#8b5cf6"
                fillOpacity={0.6}
              />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
          <div className="sensory-status">
            Balance Status:{" "}
            {analysis.sensoryBalance.balance === "excellent"
              ? "✅ Excellent - All senses well-represented"
              : analysis.sensoryBalance.balance === "good"
              ? "👍 Good - Minor adjustments suggested"
              : analysis.sensoryBalance.balance === "visual-heavy"
              ? "⚠️ Visual-Heavy - Add more variety"
              : "⚠️ Needs Variety - Expand sensory range"}
          </div>
        </div>
      )}
    </div>
  );
};

// Definitions and examples for each learning principle
const PRINCIPLE_DEFINITIONS: Record<
  string,
  { definition: string; example: string }
> = {
  deepProcessing: {
    definition:
      "Engaging with material at a meaningful level through elaboration, connecting to prior knowledge, and asking 'why' questions rather than surface-level memorization.",
    example:
      "Instead of memorizing 'mitochondria = powerhouse of cell,' explain how ATP production enables cellular processes and why certain cells have more mitochondria.",
  },
  spacedRepetition: {
    definition:
      "Distributing practice and review over time with increasing intervals, leveraging the spacing effect to combat forgetting and strengthen long-term retention.",
    example:
      "Review key concepts after 1 day, then 3 days, then 1 week, rather than cramming all practice into a single session.",
  },
  retrievalPractice: {
    definition:
      "Actively recalling information from memory without looking at notes, which strengthens neural pathways and reveals gaps in understanding.",
    example:
      "Close the book and write down everything you remember about photosynthesis, then check for accuracy—don't just re-read highlighted passages.",
  },
  interleaving: {
    definition:
      "Mixing different topics or problem types during practice rather than blocking similar items together, improving discrimination and transfer.",
    example:
      "Practice problems alternating between derivatives, integrals, and limits, rather than doing 20 derivative problems in a row.",
  },
  dualCoding: {
    definition:
      "Combining verbal and visual representations of information to create multiple memory pathways and deepen understanding through complementary formats.",
    example:
      "Pair a written explanation of the water cycle with a diagram showing evaporation, condensation, and precipitation with arrows indicating flow.",
  },
  generativeLearning: {
    definition:
      "Creating new content, making predictions, or explaining concepts in your own words to actively construct understanding rather than passively receiving information.",
    example:
      "Before reading about natural selection, predict how trait frequencies might change in a population, then compare your reasoning to the actual mechanism.",
  },
  metacognition: {
    definition:
      "Thinking about your own thinking—monitoring comprehension, planning learning strategies, evaluating what you know and don't know, and adjusting approaches accordingly.",
    example:
      "After each section, pause to ask: 'What's still confusing? What strategy should I try? Can I explain this concept to someone else?'",
  },
  schemaBuilding: {
    definition:
      "Organizing information into connected mental frameworks that show relationships between concepts, building from foundational ideas to complex applications.",
    example:
      "Create a concept map showing how cell structure, organelles, metabolism, and reproduction all connect to the central theme of maintaining life.",
  },
  cognitiveLoad: {
    definition:
      "Managing the amount of information processed simultaneously, reducing extraneous load from distractions while optimizing germane load for learning-relevant processing.",
    example:
      "Introduce the basic equation first, work through examples, then add special cases—rather than presenting all variations and exceptions simultaneously.",
  },
  emotionAndRelevance: {
    definition:
      "Connecting content to personal experiences, goals, and emotions to increase motivation, attention, and memory formation through meaningful engagement.",
    example:
      "Relate chemical reactions to cooking food you love, or connect economic principles to managing your own budget and financial goals.",
  },
};

// ============================================================================
// CHAPTER OVERVIEW TIMELINE
// ============================================================================

export const ChapterOverviewTimeline: React.FC<{
  analysis: ChapterAnalysis;
}> = ({ analysis }) => {
  const allSections = analysis.visualizations?.cognitiveLoadCurve || [];
  const [zoom, setZoom] = useState(1);

  // Filter out TOC and front matter sections, but only filter out 'Page N' if other headings exist
  let sections = allSections.filter((sec: any) => {
    const heading = (sec.heading || sec.sectionId || "").toLowerCase();
    return (
      !heading.includes("table of contents") &&
      !heading.includes("contents") &&
      !heading.match(/^(toc|contents|index)$/i)
    );
  });
  // If after filtering, all headings are 'Page N', allow them
  if (
    sections.length === 0 &&
    allSections.length > 0 &&
    allSections.every((sec: any) =>
      (sec.heading || sec.sectionId || "").toLowerCase().match(/^page \d+$/i)
    )
  ) {
    sections = allSections;
  }

  const blockingSegments =
    analysis.visualizations?.interleavingPattern.blockingSegments || [];

  // Build section issue severity map
  const sectionIssues: Record<
    string,
    { load: number; hasBlocking: boolean; sectionName: string }
  > = {};

  sections.forEach((sec: any) => {
    sectionIssues[sec.sectionId] = {
      load: sec.load,
      hasBlocking: false,
      sectionName: sec.heading || sec.sectionId,
    };
  });

  // Mark sections with blocking issues
  blockingSegments.forEach((block: any) => {
    if (block.sectionId && sectionIssues[block.sectionId]) {
      sectionIssues[block.sectionId].hasBlocking = true;
    }
  });

  // Determine color for each section based on issues
  const getSectionColor = (load: number, hasBlocking: boolean): string => {
    if (load > 0.8 || hasBlocking) return "var(--danger-600)"; // red: high load or blocking
    if (load > 0.6) return "#bfa100"; // dark yellow for moderate load
    return "var(--success-600)"; // green: good
  };

  const getSectionLabel = (load: number, hasBlocking: boolean): string => {
    if (load > 0.8 && hasBlocking) return "High load + blocking";
    if (load > 0.8) return "High cognitive load";
    if (hasBlocking) return "Blocking detected";
    if (load > 0.6) return "Moderate load";
    return "Well-balanced";
  };

  if (sections.length === 0) return null;

  const isScrollable = sections.length > 60;
  const baseWidth = 26;
  const perWidth = Math.max(8, Math.min(60, Math.round(baseWidth * zoom)));

  return (
    <div className="viz-container chapter-timeline">
      <h3>Chapter Structure Overview</h3>
      <p className="viz-subtitle">
        Navigate sections and identify areas needing attention
      </p>

      {/* Summary Stats */}
      <div className="structure-stats">
        <div className="stat-card">
          <div className="stat-value">{sections.length}</div>
          <div className="stat-label">Sections</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {
              sections.filter((sec: any) => {
                const issue = sectionIssues[sec.sectionId] || {
                  load: 0,
                  hasBlocking: false,
                };
                return issue.load > 0.8 || issue.hasBlocking;
              }).length
            }
          </div>
          <div className="stat-label">High Priority</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {
              sections.filter((sec: any) => {
                const issue = sectionIssues[sec.sectionId] || {
                  load: 0,
                  hasBlocking: false,
                };
                return (
                  issue.load > 0.6 && issue.load <= 0.8 && !issue.hasBlocking
                );
              }).length
            }
          </div>
          <div className="stat-label">Moderate Load</div>
        </div>
        <div className="stat-card stat-success">
          <div className="stat-value">
            {
              sections.filter((sec: any) => {
                const issue = sectionIssues[sec.sectionId] || {
                  load: 0,
                  hasBlocking: false,
                };
                return issue.load <= 0.6 && !issue.hasBlocking;
              }).length
            }
          </div>
          <div className="stat-label">Well-Balanced</div>
        </div>
      </div>

      {/* Line Graph */}
      <div
        style={{
          width: "100%",
          overflowX: sections.length > 60 ? "auto" : "visible",
          overflowY: "visible",
          marginBottom: "16px",
          // Make scrollbar always visible and easier to use
          scrollbarWidth: "thin",
          scrollbarColor: "#ef8432 #f5e6d3",
          WebkitOverflowScrolling: "touch",
        }}
        className="chart-scroll-container"
      >
        <ResponsiveContainer
          width={sections.length > 60 ? sections.length * 15 : "100%"}
          height={320}
        >
          <LineChart
            data={sections.map((sec: any, idx: number) => {
              const issue = sectionIssues[sec.sectionId] || {
                load: 0,
                hasBlocking: false,
                sectionName: sec.heading,
              };
              // Shorten section name to first 2 words
              const fullName = issue.sectionName || `Section ${idx + 1}`;
              const words = fullName.split(/\s+/);
              const shortName =
                words.length > 2
                  ? words.slice(0, 2).join(" ") + "..."
                  : fullName;

              return {
                section: shortName,
                fullSection: fullName,
                sectionIndex: idx + 1,
                load: Math.round(issue.load * 100),
                novelConcepts:
                  sec.factors?.novelConcepts || sec.novelConcepts || 0,
                hasBlocking: issue.hasBlocking,
                position:
                  (sec as any).position ?? (sec as any).startPosition ?? 0,
                sectionId: sec.sectionId,
              };
            })}
            margin={{ top: 5, right: 30, left: 0, bottom: 20 }}
            onClick={(data) => {
              if (data && data.activePayload && data.activePayload[0]) {
                const payload = data.activePayload[0].payload;
                window.dispatchEvent(
                  new CustomEvent("jump-to-position", {
                    detail: {
                      position: payload.position,
                      heading: payload.section,
                      sectionIndex: payload.sectionIndex - 1,
                      sectionId: payload.sectionId,
                    },
                  })
                );
              }
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis hide={true} />
            <YAxis
              label={{ value: "Load %", angle: -90, position: "insideLeft" }}
              domain={[0, 100]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #ccc",
                borderRadius: "8px",
                padding: "8px",
              }}
              formatter={(value: any, name: string) => {
                if (name === "Cognitive Load") return `${value}%`;
                if (name === "New Concepts") return String(value);
                return String(value);
              }}
              labelFormatter={(label: any, payload: any) => {
                if (payload && payload[0]) {
                  const data = payload[0].payload;
                  return `${data.fullSection || data.section}${
                    data.hasBlocking ? " (Blocking Issues)" : ""
                  }`;
                }
                return `Section: ${label}`;
              }}
            />
            <Line
              type="monotone"
              dataKey="load"
              stroke="#ef8432"
              strokeWidth={2}
              name="Cognitive Load"
              dot={(props: any) => {
                const { cx, cy, payload, index } = props;
                const issue = sectionIssues[payload.sectionId] || {
                  load: 0,
                  hasBlocking: false,
                };
                let fill = "#10b981"; // green
                if (issue.load > 0.8 || issue.hasBlocking) {
                  fill = "#ef4444"; // red
                } else if (issue.load > 0.6) {
                  fill = "#bfa100"; // yellow
                }
                return (
                  <circle
                    key={payload.sectionId || `timeline-dot-${index}`}
                    cx={cx}
                    cy={cy}
                    r={issue.hasBlocking ? 6 : 4}
                    fill={fill}
                    stroke="white"
                    strokeWidth={2}
                    style={{ cursor: "pointer" }}
                  />
                );
              }}
              isAnimationActive={true}
            />
            <Line
              type="monotone"
              dataKey="novelConcepts"
              stroke="#82ca9d"
              name="New Concepts"
              dot={false}
              strokeDasharray="5 5"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend for line types - outside scroll area */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "24px",
          marginTop: "12px",
          marginBottom: "16px",
          fontSize: "14px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              width: "24px",
              height: "3px",
              backgroundColor: "#ef8432",
              borderRadius: "2px",
            }}
          />
          <span>Cognitive Load</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              width: "24px",
              height: "3px",
              backgroundColor: "#82ca9d",
              borderRadius: "2px",
              backgroundImage:
                "repeating-linear-gradient(90deg, #82ca9d 0, #82ca9d 5px, transparent 5px, transparent 10px)",
            }}
          />
          <span>New Concepts</span>
        </div>
      </div>

      <p
        style={{
          fontSize: "13px",
          color: "#6b7280",
          fontStyle: "italic",
          marginTop: "8px",
          marginBottom: "20px",
        }}
      >
        {sections.length > 60
          ? `💡 Scroll horizontally to view all ${sections.length} sections. `
          : "💡 "}
        Hover over graph points for section details and click to jump to that
        section.
      </p>

      <div className="timeline-legend" style={{ marginTop: "20px" }}>
        <div className="legend-item">
          <span
            className="legend-dot"
            style={{ backgroundColor: "var(--success-600)" }}
          />
          Well-balanced
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ backgroundColor: "#bfa100" }} />
          <span style={{ color: "#bfa100" }}>Moderate load</span>
        </div>
        <div className="legend-item">
          <span
            className="legend-dot"
            style={{ backgroundColor: "var(--danger-600)" }}
          />
          High load or blocking
        </div>
      </div>

      <div className="why-matters-block">
        <strong>Why this matters:</strong> Managing information density prevents
        reader fatigue. Balanced pacing keeps readers engaged with the story
        instead of overwhelmed by details.
        <br />
        <br />
        <strong>New Concepts & Information Density:</strong> Each new concept
        adds to the reader's mental workload as they track unfamiliar
        information while following the narrative thread. Introducing too many
        new concepts at once (high green dashed line) can overwhelm learners,
        especially when combined with other demands like complex examples or
        prerequisite gaps.
      </div>

      {(() => {
        const loadData = sections.map((sec: any) => {
          const issue = sectionIssues[sec.sectionId] || {
            load: 0,
            hasBlocking: false,
            sectionName: sec.heading,
          };
          return {
            load: issue.load * 100,
            section: issue.sectionName,
            hasBlocking: issue.hasBlocking,
          };
        });
        const maxLoad = Math.max(...loadData.map((d) => d.load));
        const avgLoad =
          loadData.reduce((sum, d) => sum + d.load, 0) / loadData.length;
        const peakSection = loadData.find((d) => d.load === maxLoad);

        return (
          <div className="recommendation-block">
            <strong>Recommendation:</strong>{" "}
            {maxLoad > 80
              ? `Peak load at ${Math.round(maxLoad)}% in "${
                  peakSection?.section || "a section"
                }"—consider breaking dense sections into smaller chunks or adding examples.`
              : maxLoad > 60
              ? `Load is manageable but watch sections above 60%${
                  peakSection ? ` (e.g., "${peakSection.section}")` : ""
                }—add scaffolding or worked examples if needed.`
              : `Excellent! Cognitive load is well-balanced. Current pacing and concept density are optimal for learner comprehension.`}
          </div>
        );
      })()}

      <style>{`
        .chapter-timeline {
          margin-bottom: 24px;
        }
        .structure-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 12px;
          margin: 16px 0;
        }
        .stat-card {
          background: white;
          border: 2px solid #ef8432;
          border-radius: 12px;
          padding: 16px;
          text-align: center;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(239, 132, 50, 0.2);
        }
        .stat-card.stat-success {
          border-color: var(--success-600);
        }
        .stat-card.stat-success:hover {
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
        }
        .stat-value {
          font-size: 32px;
          font-weight: 700;
          color: #2c3e50;
          line-height: 1;
          margin-bottom: 8px;
        }
        .stat-label {
          font-size: 13px;
          color: #64748b;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .timeline-legend {
          display: flex;
          gap: 20px;
          flex-wrap: wrap;
          font-size: 12px;
          margin-top: -36px;
        }
        .legend-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          display: inline-block;
          margin-right: 6px;
        }
        .legend-item {
          display: flex;
          align-items: center;
        }
      `}</style>
    </div>
  );
};

// ============================================================================
// PRINCIPLE SCORES RADAR CHART
// ============================================================================

export const PrincipleScoresRadar: React.FC<{ analysis: ChapterAnalysis }> = ({
  analysis,
}) => {
  const data =
    analysis.visualizations?.principleScores.principles.map((p) => ({
      name: p.displayName, // Use display name for chart labels
      score: p.score,
      fullName: p.displayName,
    })) || [];

  // Determine color for score bands
  const getScoreColor = (score: number) => {
    if (score >= 80) return "var(--success-600)";
    if (score >= 60) return "#bfa100"; // dark yellow for moderate
    return "var(--danger-600)";
  };

  return (
    <div className="viz-container">
      <h3>Writing Metrics</h3>
      <ResponsiveContainer width="100%" height={525}>
        <RadarChart
          data={data}
          margin={{ top: 125, right: 120, bottom: 125, left: 120 }}
        >
          <PolarGrid stroke="#e0e0e0" />
          <PolarAngleAxis
            dataKey="name"
            tick={({ payload, x, y, cx, cy, ...rest }) => {
              const angle = Math.atan2(y - cy, x - cx) * (180 / Math.PI);
              const adjustedAngle =
                angle > 90 || angle < -90 ? angle + 180 : angle;
              return (
                <text
                  x={x}
                  y={y}
                  textAnchor={angle > 90 || angle < -90 ? "end" : "start"}
                  dominantBaseline="middle"
                  fontSize={12}
                  fill="#2c3e50"
                  transform={`rotate(${adjustedAngle}, ${x}, ${y})`}
                >
                  {payload.value}
                </text>
              );
            }}
            tickLine={false}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fontSize: 10 }}
          />
          <Radar
            name="Score"
            dataKey="score"
            stroke="#8884d8"
            fill="#8884d8"
            fillOpacity={0.6}
          />
          <Tooltip
            contentStyle={{ backgroundColor: "#fff", border: "1px solid #ccc" }}
            formatter={(value: any, _name: any, props: any) => {
              const color = getScoreColor(Number(value));
              return [
                <span style={{ color, fontWeight: 600 }}>{`${Math.round(
                  Number(value)
                )}/100`}</span>,
                "Score",
              ];
            }}
            labelFormatter={(label: any) => {
              const item = data.find((d) => d.name === label);
              return item ? item.fullName : label;
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
      <div className="overall-score">
        <strong>
          Overall Score:{" "}
          <span style={{ color: getScoreColor(analysis.overallScore) }}>
            {analysis.overallScore.toFixed(1)}/100
          </span>
        </strong>
      </div>
      <div className="why-matters-block">
        <strong>Why this matters:</strong> These metrics reveal your
        manuscript's pacing rhythm and narrative balance, helping you identify
        areas where readers might disengage or where scenes need more sensory
        depth.
      </div>
      <div className="recommendation-block">
        <strong>Recommendation:</strong>{" "}
        <span style={{ color: getScoreColor(analysis.overallScore) }}>
          {analysis.overallScore >= 80
            ? "Excellent principle coverage—maintain this balanced approach in future chapters."
            : analysis.overallScore >= 60
            ? "Good foundation; focus on strengthening the lowest-scoring principles for maximum impact."
            : "Several principles need attention—prioritize adding interleaving, elaboration, and retrieval practice."}
        </span>
      </div>
    </div>
  );
};

// ============================================================================
// CONCEPT MENTION FREQUENCY
// ============================================================================

export const ConceptMentionFrequency: React.FC<{
  analysis: ChapterAnalysis;
  pageOffsets?: number[];
}> = ({ analysis, pageOffsets }) => {
  const reviewPatterns: ReviewPattern[] =
    analysis.conceptAnalysis?.reviewPatterns.slice(0, 15) || [];
  const data = reviewPatterns.map((pattern) => ({
    concept: pattern.conceptId.replace("concept-", "C"),
    conceptId: pattern.conceptId,
    mentions: pattern.mentions,
    isOptimal: pattern.isOptimal,
    spacing: pattern.spacing,
    avgSpacing: pattern.avgSpacing,
    firstAppearance: pattern.firstAppearance,
    recommendation: pattern.recommendation,
  }));

  // Find a concept with suboptimal spacing (red bar) and enough mentions
  const exampleConcept = data.find((d) => !d.isOptimal && d.mentions >= 3);
  let beforeExample: string[] = [];
  let afterExample: string[] = [];
  if (exampleConcept && pageOffsets && pageOffsets.length > 0) {
    // Find the real Concept object to get mention positions
    const realConcept = analysis.conceptGraph.concepts.find(
      (c) => c.id === exampleConcept.conceptId
    );
    if (
      realConcept &&
      realConcept.mentions &&
      realConcept.mentions.length > 0
    ) {
      // Helper to map position to page number
      const getPageNumber = (pos: number) => {
        for (let i = 0; i < pageOffsets.length; i++) {
          if (pos < pageOffsets[i]) {
            return i + 1; // 1-based page number
          }
        }
        return pageOffsets.length; // Last page if beyond last offset
      };
      beforeExample = realConcept.mentions.slice(0, 5).map((m, i) => {
        const page = getPageNumber(m.position);
        return `Mention ${i + 1}: ...[page ${page}]...`;
      });
    }
    // Simulate ideal spacing: 3-5 mentions with increasing intervals
    afterExample = [
      "Mention 1: ...[page 1]...",
      "Mention 2: ...[page 3]...",
      "Mention 3: ...[page 6]...",
      "Mention 4: ...[page 10]...",
      "Mention 5: ...[page 16]...",
    ];
  }

  return (
    <div className="viz-container">
      <h3>Concept Revisit Frequency</h3>
      <p className="viz-subtitle">
        Concept revisit counts (spacing quality indicated by bar color)
      </p>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="concept" tick={{ fontSize: 10 }} />
          <YAxis
            label={{ value: "Mentions", angle: -90, position: "insideLeft" }}
          />
          <Tooltip
            contentStyle={{ backgroundColor: "#fff", border: "1px solid #ccc" }}
            formatter={(value: any, _name: any, props: any) => {
              const entry = props.payload as any;
              return [
                value,
                entry.isOptimal ? "Optimal spacing" : "Needs adjustment",
              ];
            }}
          />
          <Bar dataKey="mentions" radius={[6, 6, 0, 0]}>
            {data.map((entry, idx) => (
              <Cell
                key={`cell-${idx}`}
                fill={entry.isOptimal ? "#16a34a" : "#dc2626"}
              />
            ))}
          </Bar>
          <Legend
            verticalAlign="bottom"
            height={36}
            content={<RevisitLegend />}
          />
        </BarChart>
      </ResponsiveContainer>
      <div className="accessibility-note" aria-hidden="true">
        <small>
          Legend: Green = optimal spaced revisits; Red = revisit pattern may
          need adjustment.
        </small>
      </div>
      <div className="why-matters-block">
        <strong>Why this matters:</strong> Repetition without strategic pacing
        creates monotony; balanced distribution of key elements maintains reader
        engagement throughout your story.
      </div>
      <div className="recommendation-block">
        <strong>Recommendation:</strong>{" "}
        {(() => {
          const optimalCount = data.filter((d) => d.isOptimal).length;
          const totalCount = data.length;
          const optimalRatio = totalCount > 0 ? optimalCount / totalCount : 0;
          return optimalRatio >= 0.8
            ? "Excellent spacing patterns—most concepts have optimal revisit distribution."
            : optimalRatio >= 0.5
            ? "Good progress; review red-marked concepts and adjust spacing intervals for better retention."
            : "Many concepts need spacing adjustments—ensure 3-5 spaced revisits per concept with increasing intervals.";
        })()}
      </div>
      {exampleConcept && (
        <div className="spacing-examples-block">
          <h4>Example: Improving Spacing for "{exampleConcept.concept}"</h4>
          <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
            <div style={{ minWidth: 220 }}>
              <strong>Current Pattern (from your document):</strong>
              <ul style={{ fontSize: 13, margin: "8px 0 0 0" }}>
                {beforeExample.map((ex, i) => (
                  <li key={i}>{ex}</li>
                ))}
              </ul>
            </div>
            <div style={{ minWidth: 220 }}>
              <strong>Optimal Pattern (spaced revisits):</strong>
              <ul style={{ fontSize: 13, margin: "8px 0 0 0" }}>
                {afterExample.map((ex, i) => (
                  <li key={i}>{ex}</li>
                ))}
              </ul>
            </div>
          </div>
          <div
            style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 8 }}
          >
            <em>
              Spacing intervals and positions are illustrative. For best
              results, distribute mentions with increasing gaps (e.g., 1,000 →
              2,500 → 5,000 words).
            </em>
          </div>
        </div>
      )}
    </div>
  );
};

// Custom bar shape component for coloring
const BarShape = (props: { isOptimal?: boolean }): any => {
  // Destructure into a prefixed variable to avoid unused parameter lint
  const { isOptimal: _isOptimal } = props;
  return ({ x, y, width, height, fill }: any) => {
    return (
      <rect x={x} y={y} width={width} height={height} fill={fill} rx={4} />
    );
  };
};

// Custom legend for revisit frequency
const RevisitLegend: React.FC<any> = () => {
  return (
    <div style={{ display: "flex", gap: "18px", padding: "6px 0" }}>
      <LegendItem color="#16a34a" label="Optimal spacing" />
      <LegendItem color="#dc2626" label="Needs adjustment" />
    </div>
  );
};

const LegendItem: React.FC<{ color: string; label: string }> = ({
  color,
  label,
}) => (
  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
    <span
      style={{
        width: 14,
        height: 14,
        backgroundColor: color,
        borderRadius: 3,
        display: "inline-block",
        boxShadow: "0 0 0 1px rgba(0,0,0,0.15)",
      }}
      aria-hidden="true"
    />
    <span style={{ fontSize: 12 }}>{label}</span>
  </div>
);

// ============================================================================
// CONCEPT MAP VISUALIZATION
// ============================================================================

interface ConceptMapProps {
  nodes: ConceptNode[];
  links: ConceptLink[];
}

export const ConceptMapVisualization: React.FC<ConceptMapProps> = ({
  nodes,
  links,
}) => {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  if (!nodes || nodes.length === 0) {
    return (
      <div className="viz-container">
        <p>No concepts to visualize</p>
      </div>
    );
  }

  // Simple force-directed layout (mock)
  const width = 600;
  const height = 400;
  const centerX = width / 2;
  const centerY = height / 2;

  // Position nodes in a circle (all core concepts, equal positioning)
  const positioned = nodes.map((node, idx) => {
    const angle = (idx / nodes.length) * Math.PI * 2;
    const radius = 120; // All concepts at same radius

    return {
      ...node,
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius,
    };
  });

  return (
    <div className="viz-container">
      <h3>Concept Relationship Map</h3>
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 10 3, 0 6" fill="#888" />
          </marker>
        </defs>

        {/* Links */}
        {links.map((link, idx) => {
          const source = positioned.find((n) => n.id === link.source);
          const target = positioned.find((n) => n.id === link.target);

          if (!source || !target) return null;

          const strokeWidth = link.strength * 3;
          const strokeColor =
            link.type === "prerequisite"
              ? "#e74c3c"
              : link.type === "contrasts"
              ? "#e67e22"
              : "#3498db";

          return (
            <line
              key={idx}
              x1={source.x}
              y1={source.y}
              x2={target.x}
              y2={target.y}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              opacity={0.6}
              markerEnd="url(#arrowhead)"
            />
          );
        })}

        {/* Nodes */}
        {positioned.map((node) => (
          <g
            key={node.id}
            onClick={() => setSelectedNode(node.id)}
            style={{ cursor: "pointer" }}
          >
            <circle
              cx={node.x}
              cy={node.y}
              r={node.size}
              fill={node.color}
              opacity={
                selectedNode === null || selectedNode === node.id ? 1 : 0.3
              }
              stroke={selectedNode === node.id ? "#000" : "#666"}
              strokeWidth={selectedNode === node.id ? 2 : 1}
            />
            <text
              x={node.x}
              y={node.y}
              textAnchor="middle"
              dy="0.3em"
              fontSize="11"
              fontWeight="bold"
              fill="#fff"
              pointerEvents="none"
            >
              {node.label.split(" ").slice(0, 2).join("\n")}
            </text>
          </g>
        ))}
      </svg>

      <div className="concept-map-legend">
        <div className="legend-item">
          <span
            className="legend-color"
            style={{ backgroundColor: "#FF6B6B" }}
          />
          Core Concepts
        </div>
      </div>
      <div className="why-matters-block">
        <strong>Why this matters:</strong> Clear narrative structure helps
        readers follow story threads and thematic connections; readers engage
        with interconnected storytelling, not isolated events.
      </div>
      <div className="recommendation-block">
        <strong>Recommendation:</strong>{" "}
        {(() => {
          const coreCount = nodes.filter((n) => n.importance === "core").length;
          const linkCount = links.length;
          const avgLinks = nodes.length > 0 ? linkCount / nodes.length : 0;
          return coreCount === 0
            ? "No core concepts identified—ensure key foundational ideas are emphasized and connected."
            : avgLinks < 1
            ? "Sparse connections detected—add more explicit relationships between concepts to build mental models."
            : "Good concept structure; consider adding prerequisite links to clarify learning sequence.";
        })()}
      </div>
    </div>
  );
};

// ============================================================================
// BLOCKING ISSUE CARD COMPONENT
// ============================================================================

interface BlockingIssueCardProps {
  conceptName: string;
  longestRun: number;
  occurrences: number;
  lengths: number[];
  sections?: string[];
}

const BlockingIssueCard: React.FC<BlockingIssueCardProps> = ({
  conceptName,
  longestRun,
  occurrences,
  lengths,
  sections = [],
}) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="blocking-card" onClick={() => setExpanded(!expanded)}>
      <div className="blocking-header">
        <h5 className="blocking-concept-name">{conceptName}</h5>
        <div className="blocking-badge">{longestRun} consecutive</div>
      </div>

      {expanded && (
        <div className="blocking-details">
          <div className="blocking-stats">
            <p>
              <strong>Longest run:</strong> {longestRun} consecutive mentions
            </p>
            {occurrences > 1 && (
              <p>
                <strong>Blocking segments:</strong> {occurrences} total (runs:{" "}
                {lengths.slice(0, 3).join(", ")}
                {lengths.length > 3 ? ", …" : ""})
              </p>
            )}
            {sections.length > 0 && (
              <p className="blocking-location">
                📍 <strong>Found in:</strong> {sections.slice(0, 2).join(", ")}
                {sections.length > 2 && ` (+${sections.length - 2} more)`}
              </p>
            )}
          </div>

          <div className="blocking-why-matters">
            <strong>Why this matters:</strong> Repetitive focus (dwelling on the
            same element many times in a row) can feel monotonous to readers and
            reduces narrative variety, making it harder for readers to
            appreciate distinctions between related story elements.
          </div>

          <div className="blocking-suggestion-box">
            <strong>How to fix:</strong> Break these up with contrasting
            concepts or brief application prompts. For example, after 3-4
            mentions of "{conceptName}", introduce a different but related
            concept, then return to "{conceptName}" later. This interleaving
            strengthens learning.
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// INTERLEAVING PATTERN VISUALIZATION
// ============================================================================

export const InterleavingPattern: React.FC<{
  analysis: ChapterAnalysis;
  pageOffsets?: number[];
}> = ({ analysis, pageOffsets }) => {
  // Helper to map position to page number
  const getPageNumber = (pos: number) => {
    if (!pageOffsets || pageOffsets.length === 0) return undefined;
    for (let i = 0; i < pageOffsets.length; i++) {
      if (pos < pageOffsets[i]) {
        return i;
      }
    }
    return pageOffsets.length;
  };

  const pattern = analysis.visualizations?.interleavingPattern;
  const fullSequence = pattern?.conceptSequence || [];

  // Build ID -> Name map from conceptMap nodes
  const idToName: Record<string, string> = {};
  const nodes = analysis.visualizations?.conceptMap.nodes as any[];
  nodes?.forEach((n) => (idToName[n.id] = n.label));

  // Calculate transition matrix (which concepts follow which)
  const transitions: Record<string, Record<string, number>> = {};
  if (pattern && pattern.conceptSequence) {
    for (let i = 1; i < pattern.conceptSequence.length; i++) {
      const from = pattern.conceptSequence[i - 1];
      const to = pattern.conceptSequence[i];
      if (!transitions[from]) transitions[from] = {};
      transitions[from][to] = (transitions[from][to] || 0) + 1;
    }
  }

  // Find top transitions
  const topTransitions: { from: string; to: string; count: number }[] = [];
  Object.keys(transitions).forEach((from) => {
    Object.keys(transitions[from]).forEach((to) => {
      if (from !== to) {
        // Only count switches
        topTransitions.push({ from, to, count: transitions[from][to] });
      }
    });
  });
  topTransitions.sort((a, b) => b.count - a.count);
  const top5Transitions = topTransitions.slice(0, 5);

  // Identify blocking issues
  const blockingSegments = pattern?.blockingSegments || [];
  // Group blocking segments by concept to avoid listing multiple separate runs of same concept without context
  const blockingGroups = Object.values(
    blockingSegments.reduce(
      (
        acc: Record<
          string,
          { conceptId: string; lengths: number[]; sections: string[] }
        >,
        seg: any
      ) => {
        if (!acc[seg.conceptId])
          acc[seg.conceptId] = {
            conceptId: seg.conceptId,
            lengths: [],
            sections: [],
          };
        acc[seg.conceptId].lengths.push(seg.length);
        if (
          seg.sectionHeading &&
          !acc[seg.conceptId].sections.includes(seg.sectionHeading)
        ) {
          acc[seg.conceptId].sections.push(seg.sectionHeading);
        }
        return acc;
      },
      {}
    )
  ).map((g) => ({
    conceptId: g.conceptId,
    longest: Math.max(...g.lengths),
    occurrences: g.lengths.length,
    lengths: g.lengths.sort((a, b) => b - a),
    sections: g.sections,
  }));
  const worstBlocks = blockingGroups
    .sort((a, b) => b.longest - a.longest)
    .slice(0, 3);

  // Generate color map with consistent hashing
  const uniqueConcepts = Array.from(new Set(fullSequence));
  const colorMap: Record<string, string> = {};
  uniqueConcepts.forEach((conceptId, idx) => {
    const hue = (idx / uniqueConcepts.length) * 360;
    colorMap[conceptId] = `hsl(${hue}, 70%, 60%)`;
  });

  // Interleaving quality score
  const interleavingScore = Math.round(
    (1 - (pattern?.blockingRatio || 0)) * 100
  );
  const scoreColor =
    interleavingScore >= 70
      ? "var(--success-600)"
      : interleavingScore >= 50
      ? "var(--warn-600)"
      : "var(--danger-600)";

  return (
    <div className="viz-container">
      <h3>Topic Interleaving Analysis</h3>
      <p className="viz-subtitle">
        Measures how well concepts are mixed vs. presented in isolated blocks.
        <br />
        <em style={{ fontSize: "12px", color: "var(--text-subtle)" }}>
          Note: Learning Principle score also considers interleaving density and
          discrimination practice.
        </em>
      </p>

      <div className="interleaving-metrics-grid">
        <div className="metric-card">
          <div className="metric-label">Basic Interleaving</div>
          <div className="metric-value" style={{ color: scoreColor }}>
            {interleavingScore}%
          </div>
          <div className="metric-note">(1 - blocking ratio)</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Topic Switches</div>
          <div className="metric-value">{pattern?.topicSwitches || 0}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Avg Block Size</div>
          <div className="metric-value">
            {pattern?.avgBlockSize.toFixed(1) || "0.0"}
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Blocking Ratio</div>
          <div className="metric-value" style={{ color: scoreColor }}>
            {((pattern?.blockingRatio || 0) * 100).toFixed(0)}%
          </div>
        </div>
      </div>

      <div className="section-divider">
        <h4>Concept Sequence Visualization</h4>
        <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "12px" }}>
          Each bar represents a concept mention. Vertical groupings indicate
          blocking (repeated focus on one topic).
        </p>

        {/* Interactive sequence grid */}
        <div
          className="chart-scroll-container"
          style={{
            overflowX: "auto",
            paddingBottom: "8px",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "3px",
              minWidth: `${Math.max(fullSequence.length * 10, 320)}px`,
            }}
          >
            {fullSequence.map((conceptId, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: colorMap[conceptId],
                  height: "60px",
                  width: "10px",
                  borderRadius: "4px",
                  cursor: "pointer",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  flex: "0 0 auto",
                }}
                title={`${idx + 1}. ${idToName[conceptId] || conceptId}`}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.15)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 12px rgba(0,0,0,0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
                }}
              />
            ))}
          </div>
        </div>

        {/* Concept legend with counts */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "8px",
            marginTop: "16px",
          }}
        >
          {uniqueConcepts.slice(0, 8).map((conceptId) => {
            const count = fullSequence.filter((id) => id === conceptId).length;
            return (
              <div
                key={conceptId}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 12px",
                  backgroundColor: "#f8fafc",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                }}
              >
                <span
                  style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "4px",
                    backgroundColor: colorMap[conceptId],
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontSize: "13px",
                    flex: 1,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {(idToName[conceptId] || conceptId).substring(0, 25)}
                </span>
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "#64748b",
                    backgroundColor: "white",
                    padding: "2px 8px",
                    borderRadius: "12px",
                  }}
                >
                  {count}
                </span>
              </div>
            );
          })}
        </div>

        {uniqueConcepts.length > 8 && (
          <div
            style={{
              marginTop: "12px",
              fontSize: "13px",
              color: "#64748b",
              fontStyle: "italic",
            }}
          >
            + {uniqueConcepts.length - 8} more concepts not shown
          </div>
        )}
      </div>

      {worstBlocks.length > 0 && (
        <div className="blocking-section">
          <h4 className="blocking-section-title">
            ⚠️ Blocking Issues Detected
          </h4>
          <p className="blocking-section-subtitle">
            Click each concept to see details and recommendations
          </p>
          {worstBlocks.map((group, idx) => {
            const name = idToName[group.conceptId] || group.conceptId;
            // Find the longest run of this concept in the sequence
            let runStart = -1,
              runEnd = -1,
              maxRun = 0,
              curRun = 0,
              curStart = 0;
            for (let i = 0; i < fullSequence.length; i++) {
              if (fullSequence[i] === group.conceptId) {
                if (curRun === 0) curStart = i;
                curRun++;
                if (curRun > maxRun) {
                  maxRun = curRun;
                  runStart = curStart;
                  runEnd = i;
                }
              } else {
                curRun = 0;
              }
            }
            // Simulate runPages as sequential pages for the run (since we lack positions)
            const runLength = runEnd - runStart + 1;
            const runPages = Array.from({ length: runLength }, (_, i) => i + 1);
            // Simulate optimal interleaving: spread mentions across pages
            const optimalPages = [1, 3, 6, 10, 16];
            return (
              <div key={idx}>
                <BlockingIssueCard
                  conceptName={name}
                  longestRun={group.longest}
                  occurrences={group.occurrences}
                  lengths={group.lengths}
                  sections={group.sections}
                />
                {runPages.length >= 3 && (
                  <div
                    className="blocking-example-block"
                    style={{
                      margin: "16px 0 0 0",
                      padding: "12px",
                      background: "#f8fafc",
                      borderRadius: 6,
                    }}
                  >
                    <strong>Example: Improving blocking for "{name}"</strong>
                    <div
                      style={{
                        display: "flex",
                        gap: 32,
                        flexWrap: "wrap",
                        marginTop: 8,
                      }}
                    >
                      <div style={{ minWidth: 220 }}>
                        <strong>Current Pattern (from your document):</strong>
                        <ul style={{ fontSize: 13, margin: "8px 0 0 0" }}>
                          {runPages.slice(0, 5).map((page, i) => (
                            <li key={i}>
                              {page
                                ? `Mention ${i + 1}: ...[page ${page}]...`
                                : `Mention ${i + 1}: ...[unknown page]...`}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div style={{ minWidth: 220 }}>
                        <strong>Optimal Pattern (interleaved):</strong>
                        <ul style={{ fontSize: 13, margin: "8px 0 0 0" }}>
                          {optimalPages.map((page, i) => (
                            <li key={i}>{`Mention ${
                              i + 1
                            }: ...[page ${page}]...`}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "var(--text-muted)",
                        marginTop: 8,
                      }}
                    >
                      <em>
                        For best results, distribute mentions across different
                        pages and sections, not in a single block.
                      </em>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="recommendation-box">
        <strong>Recommendation:</strong>{" "}
        {pattern?.recommendation || "No recommendation available"}
      </div>
      <div className="why-matters-block">
        <strong>Why this matters:</strong> Varied pacing (mixing story elements)
        maintains reader interest and creates dynamic storytelling compared to
        repetitive sequences.
      </div>

      {top5Transitions.length > 0 && (
        <div className="transitions-section">
          <h4>Common Concept Transitions</h4>
          <p className="transitions-subtitle">
            Shows how concepts connect in your chapter
          </p>
          <div className="transitions-list">
            {top5Transitions.map((trans, idx) => (
              <div key={idx} className="transition-item">
                <span className="transition-from">
                  {(idToName[trans.from] || trans.from).substring(0, 18)}
                </span>
                <span className="transition-arrow">→</span>
                <span className="transition-to">
                  {(idToName[trans.to] || trans.to).substring(0, 18)}
                </span>
                <span className="transition-count">({trans.count}×)</span>
              </div>
            ))}
          </div>
          <div className="transitions-why-matters">
            <strong>Why this matters:</strong> Understanding your narrative flow
            patterns helps identify natural connections readers experience.
            High-frequency transitions reveal your story's thematic threads—use
            this to reinforce effective bridges between elements or to spot
            opportunities for more varied storytelling.
          </div>
        </div>
      )}

      <style>{`
        .interleaving-metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 12px;
          margin: 20px 0;
        }
        .metric-card {
          background: var(--bg-panel);
          border: 1px solid var(--border-soft);
          border-radius: 8px;
          padding: 12px;
          text-align: center;
        }
        .metric-label {
          font-size: 11px;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 6px;
        }
        .metric-value {
          font-size: 24px;
          font-weight: bold;
          color: var(--text-main);
        }
        .metric-note {
          font-size: 10px;
          color: var(--text-subtle);
          margin-top: 4px;
          font-style: italic;
        }
        .section-divider {
          margin: 24px 0;
          padding-top: 16px;
          border-top: 1px solid var(--border-soft);
        }
        .section-divider h4 {
          font-size: 15px;
          margin-bottom: 12px;
          color: var(--text-main);
        }
        .interleaving-sequence {
          display: flex;
          border-radius: 6px;
          overflow: hidden;
          margin: 12px 0;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .interleaving-block {
          transition: all 0.3s ease;
          border-right: 1px solid rgba(255,255,255,0.3);
          cursor: pointer;
        }
        .interleaving-block:hover {
          filter: brightness(0.85);
          transform: scaleY(1.1);
        }
        .interleaving-legend {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          font-size: 12px;
          margin-top: 8px;
        }
        .legend-item {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .legend-color {
          width: 14px;
          height: 14px;
          border-radius: 3px;
          display: inline-block;
        }
        .blocking-issues {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .blocking-issue-card {
          background: #fff8f0;
          border-left: 4px solid var(--warn-600);
          padding: 10px 14px;
          border-radius: 4px;
        }
        .blocking-concept {
          font-weight: 600;
          color: var(--text-main);
          margin-bottom: 4px;
        }
        .blocking-detail {
          font-size: 13px;
          color: var(--text-muted);
        }
        .blocking-location {
          margin-top: 6px;
          padding: 4px 8px;
          background: rgba(14, 165, 233, 0.1);
          border-radius: 4px;
          font-size: 12px;
          color: var(--brand-accent);
          display: inline-block;
        }
        .blocking-suggestion {
          margin-top: 6px;
          font-style: italic;
          color: var(--text-subtle);
        }
        .transitions-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .transition-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px;
          background: var(--bg-panel);
          border: 1px solid var(--border-soft);
          border-radius: 4px;
          font-size: 13px;
        }
        .transition-from, .transition-to {
          font-weight: 500;
          color: var(--text-main);
        }
        .transition-arrow {
          color: var(--text-subtle);
          font-weight: bold;
        }
        .transition-count {
          margin-left: auto;
          color: var(--text-muted);
          font-size: 12px;
        }
        .recommendation-box {
          margin-top: 20px;
          padding: 12px 16px;
          background: #f0f9ff;
          border-left: 4px solid var(--brand-accent);
          border-radius: 4px;
          font-size: 14px;
          color: var(--text-main);
        }
        /* Blocking Section Styles */
        .blocking-section {
          margin: 30px 0;
        }
        .blocking-section-title {
          font-size: 20px;
          font-weight: 600;
          color: var(--danger-600);
          margin: 0 0 5px 0;
        }
        .blocking-section-subtitle {
          color: var(--text-muted);
          font-size: 13px;
          margin: 0 0 15px 0;
          font-style: italic;
        }
        .blocking-card {
          border: 1px solid #fecaca;
          border-radius: 8px;
          margin: 10px 0;
          padding: 15px;
          cursor: pointer;
          transition: all 0.3s ease;
          background: #fef2f2;
        }
        .blocking-card:hover {
          box-shadow: 0 2px 8px rgba(220, 38, 38, 0.15);
          border-color: var(--danger-600);
        }
        .blocking-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .blocking-concept-name {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: var(--danger-600);
        }
        .blocking-badge {
          padding: 4px 10px;
          border-radius: 12px;
          background: var(--danger-600);
          color: white;
          font-weight: 600;
          font-size: 12px;
        }
        .blocking-details {
          margin-top: 15px;
          padding-top: 15px;
          border-top: 1px solid #fecaca;
        }
        .blocking-stats p {
          margin: 8px 0;
          font-size: 14px;
          color: var(--text-main);
        }
        .blocking-location {
          margin-top: 8px;
          padding: 6px 10px;
          background: rgba(14, 165, 233, 0.1);
          border-radius: 4px;
          font-size: 13px;
          color: var(--brand-accent);
          display: inline-block;
        }
        .blocking-why-matters {
          margin-top: 12px;
          padding: 10px;
          background: #fffbeb;
          border-left: 3px solid var(--warn-600);
          border-radius: 4px;
          font-size: 13px;
          line-height: 1.5;
          color: var(--text-main);
        }
        .blocking-suggestion-box {
          margin-top: 12px;
          padding: 10px;
          background: #f0f9ff;
          border-left: 3px solid var(--brand-accent);
          border-radius: 4px;
          font-size: 13px;
          line-height: 1.5;
          color: var(--text-main);
        }
        /* Transitions Section Styles */
        .transitions-section {
          margin: 30px 0;
          padding: 20px;
          background: #f8fafc;
          border-radius: 8px;
          border: 1px solid var(--border-soft);
        }
        .transitions-section h4 {
          margin: 0 0 5px 0;
          font-size: 18px;
          font-weight: 600;
          color: var(--text-main);
        }
        .transitions-subtitle {
          color: var(--text-muted);
          font-size: 13px;
          margin: 0 0 15px 0;
          font-style: italic;
        }
        .transitions-why-matters {
          margin-top: 15px;
          padding: 12px;
          background: white;
          border-left: 3px solid var(--brand-navy-600);
          border-radius: 4px;
          font-size: 13px;
          line-height: 1.6;
          color: var(--text-main);
        }
      `}</style>
    </div>
  );
};

// ============================================================================
// REVIEW SCHEDULE TIMELINE
// ============================================================================

export const ReviewScheduleTimeline: React.FC<{
  analysis: ChapterAnalysis;
}> = ({ analysis }) => {
  const schedule = analysis.visualizations?.reviewSchedule;
  const [showAll, setShowAll] = useState(false);

  if (!schedule) {
    return null;
  }

  const sortedConcepts = [...schedule.concepts].sort((a, b) => {
    const devA = a.spacing.length
      ? a.spacing.reduce(
          (s, g) => s + Math.abs(g - schedule.optimalSpacing),
          0
        ) / a.spacing.length
      : 0;
    const devB = b.spacing.length
      ? b.spacing.reduce(
          (s, g) => s + Math.abs(g - schedule.optimalSpacing),
          0
        ) / b.spacing.length
      : 0;
    const priorityA = a.isOptimal ? 0 : 1; // non-optimal first
    const priorityB = b.isOptimal ? 0 : 1;
    return priorityB - priorityA || devB - devA || b.mentions - a.mentions;
  });
  const defaultLimit = 15;
  const concepts = showAll
    ? sortedConcepts
    : sortedConcepts.slice(0, defaultLimit);

  // Build ID -> Name map from conceptMap nodes
  const idToName: Record<string, string> = {};
  const nodes = analysis.visualizations?.conceptMap.nodes as any[];
  nodes?.forEach((n) => (idToName[n.id] = n.label));

  // Find max gap for scaling (use reasonable default if data is skewed)
  const maxGap = Math.max(
    ...concepts.flatMap((c) => c.spacing),
    schedule.optimalSpacing * 2,
    100
  );

  return (
    <div className="viz-container">
      <h3>Concept Review Schedule</h3>
      <p className="viz-subtitle">
        Optimal spacing helps retention through spaced repetition
      </p>
      <div className="review-metrics">
        <div>
          <strong>Optimal Spacing (median):</strong> {schedule.optimalSpacing}{" "}
          words
        </div>
        <div>
          <strong>Current Avg Spacing:</strong> {schedule.currentAvgSpacing}{" "}
          words
        </div>
        <div>
          <strong>Concepts Analyzed:</strong> {schedule.concepts.length}
        </div>
      </div>
      <div className="review-legend">
        <span className="legend-item">
          <span className="legend-color optimal" /> Optimal spacing pattern
        </span>
        <span className="legend-item">
          <span className="legend-color needs-adjustment" /> Needs adjustment
        </span>
      </div>

      <div className="review-timeline">
        {concepts.map((concept) => {
          const conceptName = idToName[concept.conceptId] || concept.conceptId;
          return (
            <div key={concept.conceptId} className="concept-timeline">
              <div className="concept-label" title={conceptName}>
                {conceptName.length > 20
                  ? conceptName.substring(0, 18) + "..."
                  : conceptName}
              </div>
              <div className="mention-bars">
                {concept.spacing.map((gap, idx) => (
                  <div
                    key={idx}
                    className={`gap-bar ${
                      concept.isOptimal ? "optimal" : "needs-adjustment"
                    }`}
                    style={{
                      width: `${Math.min((gap / maxGap) * 100, 100)}%`,
                    }}
                    title={`Gap ${idx + 1}: ${gap} words between mentions`}
                  />
                ))}
              </div>
              <div
                className="mention-count"
                title={`Total mentions of ${conceptName}`}
              >
                {concept.mentions} mentions
              </div>
            </div>
          );
        })}
      </div>

      {!showAll && sortedConcepts.length > defaultLimit && (
        <div className="show-more-container">
          <button className="show-more-btn" onClick={() => setShowAll(true)}>
            Show all {sortedConcepts.length} concepts
          </button>
        </div>
      )}
      <div className="why-matters-block">
        <strong>Why this matters:</strong> Well-timed callbacks reinforce key
        story elements and maintain reader connection; uneven or absent
        references weaken thematic threads and character development.
      </div>
      <div className="recommendation-block">
        <strong>Recommendation:</strong>{" "}
        {(() => {
          const optimalCount = sortedConcepts.filter((c) => c.isOptimal).length;
          const ratio =
            sortedConcepts.length > 0
              ? optimalCount / sortedConcepts.length
              : 0;
          const spacingDiff =
            schedule.currentAvgSpacing - schedule.optimalSpacing;
          return ratio >= 0.7
            ? "Excellent spacing—most concepts follow optimal spaced repetition patterns."
            : spacingDiff > 50
            ? "Gaps too wide—increase concept revisits to maintain activation and prevent forgetting."
            : spacingDiff < -30
            ? "Concepts revisited too frequently—space them out more to leverage forgetting for stronger encoding."
            : "Moderate spacing issues—focus on red-marked concepts and aim for 3-5 strategically spaced revisits.";
        })()}
      </div>

      <style>{`
        .review-timeline {
          margin: 20px 0;
        }
        .review-metrics {
          display: flex;
          gap: 20px;
          font-size: 13px;
          margin-top: 6px;
          flex-wrap: wrap;
        }
        .review-legend {
          display: flex;
          gap: 20px;
          margin-top: 10px;
          font-size: 12px;
          flex-wrap: wrap;
        }
        .legend-item {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .legend-color {
          width: 16px;
          height: 16px;
          border-radius: 3px;
          display: inline-block;
        }
        .legend-color.optimal {
          background: var(--success-600);
        }
        .legend-color.needs-adjustment {
          background: var(--warn-600);
        }
        .concept-timeline {
          display: grid;
          grid-template-columns: 150px 1fr 80px;
          align-items: center;
          margin: 10px 0;
          gap: 15px;
        }
        .concept-label {
          font-weight: bold;
          text-align: left;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .mention-bars {
          flex: 1;
          display: flex;
          gap: 2px;
        }
        .gap-bar {
          height: 20px;
          border-radius: 2px;
          transition: all 0.3s ease;
        }
        .gap-bar.optimal {
          background: var(--success-600);
        }
        .gap-bar.needs-adjustment {
          background: var(--warn-600);
        }
        .gap-bar:hover {
          filter: brightness(0.8);
        }
        .mention-count {
          text-align: right;
          font-size: 12px;
          color: var(--text-main);
          white-space: nowrap;
        }
        .show-more-container { margin-top: 10px; }
        .show-more-btn {
          background: var(--accent-600);
          color: #fff;
          border: none;
          padding: 8px 14px;
          font-size: 13px;
          border-radius: 4px;
          cursor: pointer;
        }
        .show-more-btn:hover { filter: brightness(0.9); }
      `}</style>
    </div>
  );
};

// ============================================================================
// PRINCIPLE FINDINGS COMPONENT
// ============================================================================

export const PrincipleFindings: React.FC<{
  principle: PrincipleEvaluation;
  displayNumber?: number;
}> = ({ principle, displayNumber }) => {
  const [expanded, setExpanded] = useState(false);

  const scoreColor =
    principle.score >= 80
      ? "var(--success-600)"
      : principle.score >= 60
      ? "#f59e0b" /* amber-500 */
      : principle.score >= 40
      ? "var(--warn-600)"
      : "var(--danger-600)";

  const principleInfo = PRINCIPLE_DEFINITIONS[principle.principle];

  return (
    <div className="principle-card" onClick={() => setExpanded(!expanded)}>
      <div className="principle-header">
        <h4>
          {displayNumber && (
            <span
              style={{
                color: "var(--text-subtle)",
                marginRight: "8px",
                fontWeight: 500,
              }}
            >
              {displayNumber}.
            </span>
          )}
          {PRINCIPLE_NAME_MAP[principle.principle] || principle.principle}
        </h4>
        <div className="score-badge" style={{ backgroundColor: scoreColor }}>
          {Math.round(principle.score)}
        </div>
      </div>

      {expanded && (
        <div className="principle-details">
          {principleInfo && (
            <div className="principle-definition">
              <h5>What this means:</h5>
              <p className="definition-text">{principleInfo.definition}</p>
              <p className="example-text">
                <strong>Example:</strong> {principleInfo.example}
              </p>
            </div>
          )}

          <div className="findings">
            <h5>Findings:</h5>
            {principle.findings.map((finding, idx) => (
              <p key={idx} className={`finding finding-${finding.type}`}>
                {finding.message}
              </p>
            ))}
          </div>

          <div className="suggestions">
            <h5>Suggestions:</h5>
            {principle.suggestions.length > 0 ? (
              principle.suggestions.map((suggestion) => (
                <div key={suggestion.id} className="suggestion">
                  <p>
                    <strong>{suggestion.title}</strong> ({suggestion.priority})
                  </p>
                  <p className="suggestion-desc">{suggestion.description}</p>
                </div>
              ))
            ) : (
              <p className="no-suggestions">None</p>
            )}
          </div>

          <div className="evidence">
            <h5>Evidence:</h5>
            {principle.evidence.map((e, idx) => (
              <p key={idx} className="evidence-item">
                {e.metric}:{" "}
                {typeof e.value === "number"
                  ? e.value < 1 && e.value > 0
                    ? e.value.toFixed(2)
                    : e.value < 10
                    ? e.value.toFixed(1)
                    : Math.trunc(e.value)
                  : e.value}{" "}
                {e.threshold !== undefined && typeof e.threshold === "number"
                  ? `(target: ${
                      e.threshold < 1
                        ? e.threshold.toFixed(2)
                        : Math.trunc(e.threshold)
                    })`
                  : e.threshold
                  ? `(target: ${e.threshold})`
                  : ""}
              </p>
            ))}
          </div>
          <div className="why-matters-block">
            <strong>Why this matters:</strong> Craft-aligned revisions transform
            weak passages into engaging storytelling—targeting low scores yields
            the biggest reader impact.
          </div>
          <div className="recommendation-block">
            <strong>Recommendation:</strong>{" "}
            {(() => {
              const displayName =
                PRINCIPLE_NAME_MAP[principle.principle] || principle.principle;
              if (principle.score >= 80)
                return `Strong ${displayName} implementation—maintain this approach.`;
              if (principle.score >= 60)
                return `Good ${displayName} foundation—review suggestions to strengthen further.`;
              return `${displayName} needs attention—prioritize the highest-priority suggestions above.`;
            })()}
          </div>
        </div>
      )}

      <style>{`
        .principle-card {
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          margin: 10px 0;
          padding: 15px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .principle-card:hover {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        .principle-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .principle-header h4 {
          margin: 0;
          flex: 1;
        }
        .score-badge {
          padding: 5px 10px;
          border-radius: 20px;
          color: white;
          font-weight: bold;
          font-size: 14px;
        }
        .principle-details {
          margin-top: 15px;
          padding-top: 15px;
          border-top: 1px solid #f0f0f0;
        }
        .principle-details h5 {
          margin: 10px 0 5px 0;
          color: var(--text-main);
        }
        .finding {
          padding: 5px 0;
          margin: 5px 0;
          font-size: 14px;
        }
        .finding-positive {
          color: var(--success-600);
        }
        .finding-warning {
          color: var(--warn-600);
        }
        .finding-critical {
          color: var(--danger-600);
        }
        .suggestion {
          padding: 8px;
          margin: 8px 0;
          background: #f1f5f9; /* slate-100 */
          border-left: 3px solid var(--brand-accent);
          border-radius: 4px;
        }
        .suggestion p {
          margin: 5px 0;
          font-size: 13px;
        }
        .suggestion-desc {
          color: var(--text-muted);
        }
        .evidence-item {
          font-size: 13px;
          color: var(--text-muted);
          margin: 4px 0;
          font-family: inherit;
          line-height: 1.5;
          letter-spacing: 0.01em;
        }
        .no-suggestions {
          color: var(--success-600);
          font-weight: 600;
          font-size: 14px;
          margin: 5px 0;
        }
        .principle-definition {
          background: #f8fafc;
          padding: 12px;
          border-radius: 6px;
          margin-bottom: 15px;
          border-left: 3px solid var(--brand-navy-600);
        }
        .definition-text {
          font-size: 14px;
          line-height: 1.6;
          color: var(--text-main);
          margin: 5px 0;
        }
        .example-text {
          font-size: 13px;
          line-height: 1.5;
          color: var(--text-muted);
          margin: 8px 0 0 0;
          font-style: italic;
        }
      `}</style>
    </div>
  );
};

// ============================================================================
// MAIN DASHBOARD COMPONENT
// ============================================================================

export const ChapterAnalysisDashboard: React.FC<{
  analysis: ChapterAnalysis;
  concepts: Concept[];
  onConceptClick: (concept: Concept, mentionIndex: number) => void;
  highlightedConceptId?: string | null;
  currentMentionIndex?: number;
  pageOffsets?: number[];
  accessLevel?: "free" | "premium" | "professional";
  hasDomain?: boolean;
  activeDomain?: string | null;
  relationships?: ConceptRelationship[];
  generalConcepts?: GeneralConcept[];
  onGeneralConceptClick?: (position: number, term: string) => void;
}> = ({
  analysis,
  concepts,
  onConceptClick,
  highlightedConceptId,
  currentMentionIndex = 0,
  pageOffsets,
  accessLevel = "professional",
  hasDomain = true,
  activeDomain = null,
  relationships = [],
  generalConcepts,
  onGeneralConceptClick,
}) => {
  // Defensive guards in case analysis shape changes or fields are missing
  const overallScore = analysis.overallScore ?? 0;
  const conceptAnalysis = analysis.conceptAnalysis || {
    totalConceptsIdentified: 0,
    coreConceptCount: 0,
    conceptDensity: 0,
    hierarchyBalance: 0,
  };
  const conceptCount = concepts?.length ?? 0;

  const recommendations = analysis.recommendations || [];
  const principles = analysis.principles || [];
  const shouldShowGeneralConcepts =
    !hasDomain && Array.isArray(generalConcepts) && generalConcepts.length > 0;
  const handleGeneralConceptClick = onGeneralConceptClick ?? (() => undefined);

  // Filter principles based on access level
  const filteredPrinciples =
    accessLevel === "free"
      ? principles.filter(
          (p: any) =>
            p.principle === "spacedRepetition" || p.principle === "dualCoding"
        )
      : principles;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Book Analysis Report</h2>
        <div className="overall-score-display">
          <div className="score-circle">
            <span className="score-number">{overallScore.toFixed(1)}</span>
            <span className="score-label">/100</span>
          </div>
        </div>
      </div>

      <ChapterOverviewTimeline analysis={analysis} />

      <div className="viz-grid">
        <PrincipleScoresRadar analysis={analysis} />
      </div>

      {/* Character Arc Trajectory Chart */}
      {analysis.characterAnalysis && analysis.characterAnalysis.characters && (
        <CharacterArcTrajectory
          characterAnalysis={analysis.characterAnalysis}
        />
      )}

      {/* Prose Quality Visualizations */}
      {analysis.proseQuality && (
        <ProseQualityDashboard proseQuality={analysis.proseQuality} />
      )}

      {/* Visual Analysis Enhancements */}
      <VisualAnalysisDashboard analysis={analysis} />

      {/* Advanced Metrics Dashboard */}
      <AdvancedMetricsDashboard analysis={analysis} />

      {/* General concepts removed in MVP - component not available */}
      {/* {shouldShowGeneralConcepts && (
        <div className="viz-grid general-concepts-grid">
          <GeneralConceptGenerator
            concepts={generalConcepts!}
            onConceptClick={handleGeneralConceptClick}
            className="general-concepts-card"
            style={{ marginTop: 0 }}
          />
        </div>
      )} */}

      <div className="principles-section">
        <h3>Writing Analysis Details</h3>
        <p className="section-subtitle">
          {accessLevel === "free"
            ? "Free tier: Basic pacing and sensory detail analysis. Upgrade for comprehensive manuscript insights."
            : "Click each metric to expand findings and actionable suggestions"}
        </p>
        {filteredPrinciples.length === 0 && (
          <div style={{ padding: "20px", color: "#666", fontStyle: "italic" }}>
            No analysis data available. Please try analyzing again.
          </div>
        )}
        {filteredPrinciples.map((principle: any, index: number) => (
          <PrincipleFindings
            key={principle.principle}
            principle={principle}
            displayNumber={index + 1}
          />
        ))}
      </div>

      {hasDomain && recommendations.length > 0 && (
        <div className="recommendations-section">
          <h3>📋 Writing Recommendations ({recommendations.length})</h3>
          <p className="section-subtitle">
            Prioritized suggestions to strengthen your manuscript
          </p>
          {recommendations.slice(0, 10).map((rec) => (
            <div key={rec.id} className={`recommendation rec-${rec.priority}`}>
              <h4>{rec.title}</h4>
              <p>{rec.description}</p>
              <div className="rec-meta">
                <span className="rec-priority">{rec.priority}</span>
                <span className="rec-effort">{rec.estimatedEffort}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Concept Overview - Hidden in MVP (not used for creative writing) */}
      {false && conceptCount > 0 && (
        <div className="concepts-section">
          <h3>📚 Concept Overview</h3>
          <p className="section-subtitle">
            Summary metrics for identified concepts
          </p>
          {conceptCount > 0 && (
            <div className="concept-stats">
              <div className="stat">
                <strong>{conceptAnalysis.totalConceptsIdentified}</strong>
                <p>Total Concepts</p>
              </div>
              <div className="stat">
                <strong>{conceptAnalysis.coreConceptCount}</strong>
                <p>Core Concepts</p>
                <p className="stat-note">Repeated 3+ times</p>
              </div>
              <div className="stat">
                <strong>{conceptAnalysis.conceptDensity.toFixed(1)}</strong>
                <p>Concepts per 1K words</p>
                <p className="stat-note">Target: 2-4</p>
              </div>
              <div className="stat">
                <strong>
                  {(conceptAnalysis.hierarchyBalance * 100).toFixed(0)}%
                </strong>
                <p>Hierarchy Balance</p>
                <p className="stat-note">Target: 60-80%</p>
                <p className="stat-description">
                  Distribution of concept importance levels
                </p>
              </div>
            </div>
          )}
          {/* Prerequisite Order Card - Removed in MVP */}
          {/* <div className="prereq-card-wrapper">
            <PrerequisiteOrderCard
              concepts={concepts || []}
              conceptSequence={analysis.conceptGraph?.sequence}
              domainSelected={hasDomain}
              activeDomain={activeDomain}
              relationships={relationships}
            />
          </div> */}
        </div>
      )}

      <style>{`
          .dashboard {
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
              sans-serif;
            width: 100%;
            max-width: 100%;
            margin: 0 auto;
          }
          .dashboard-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
          }
          .overall-score-display {
            display: flex;
            justify-content: center;
          }
          .score-circle {
            width: 100px;
            height: 100px;
            border-radius: 50%;
            background: linear-gradient(135deg, var(--brand-navy-600), var(--brand-navy-700));
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            color: #fff;
            font-weight: 600;
            box-shadow: 0 4px 12px rgba(2,6,23,0.25);
          }
          .score-number {
            font-size: 36px;
          }
          .score-label {
            font-size: 12px;
          }
          .viz-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(min(500px, 100%), 1fr));
            gap: 20px;
            margin: 30px 0;
          }
          .viz-container {
            border: 1px solid var(--border-soft);
            border-radius: 8px;
            padding: 20px;
            background: var(--bg-panel);
            max-width: 100%;
          }
          .viz-container h3 {
            margin-top: 0;
          }
          .viz-subtitle {
            color: var(--text-muted);
            font-size: 13px;
            margin: 5px 0 15px 0;
          }
          .section-subtitle {
            color: var(--text-muted);
            font-size: 14px;
            margin: -5px 0 15px 0;
            font-style: italic;
          }
          .principles-section {
            margin: 30px 0;
          }
          .principles-section h3 {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 20px;
            font-weight: bold;
            color: #0f172a;
            margin: 0 0 8px 0;
          }
          .recommendations-section h3,
          .concepts-section h3 {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 20px;
            font-weight: bold;
            color: #0f172a;
            margin: 0 0 8px 0;
          }
          .concept-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
            margin: 20px 0;
          }
          .stat {
            padding: 15px;
            background: #f1f5f9; /* slate-100 */
            border-radius: 8px;
            text-align: center;
            border: 1px solid var(--border-soft);
          }
          .stat strong {
            font-size: 24px;
            color: var(--brand-navy-700);
            display: block;
            font-weight: 600;
          }
          .stat p {
            margin: 5px 0 0 0;
            color: var(--text-muted);
            font-size: 12px;
          }
          .stat-note {
            margin: 2px 0 0 0 !important;
            color: #64748b !important; /* slate-500 */
            font-size: 11px !important;
            font-style: italic;
          }
          .stat-description {
            margin: 4px 0 0 0 !important;
            color: #94a3b8 !important; /* slate-400 */
            font-size: 10px !important;
            line-height: 1.3;
          }
          .recommendation {
            border-left: 4px solid #ccc;
            padding: 15px;
            margin: 10px 0;
            background: #f9f9f9;
            border-radius: 4px;
          }
          .recommendation.rec-high {
            border-left-color: var(--danger-600);
            background: #fef2f2; /* red-50 */
          }
          .recommendation.rec-medium {
            border-left-color: var(--warn-600);
            background: #fffbeb; /* amber-50 */
          }
          .recommendation.rec-low {
            border-left-color: var(--success-600);
            background: #f0fdf4; /* green-50 */
          }
          .recommendation h4 {
            margin: 0 0 5px 0;
          }
          .recommendation p {
            margin: 5px 0;
            color: var(--text-main);
            font-size: 14px;
          }
          .rec-meta {
            display: flex;
            gap: 10px;
            margin-top: 8px;
          }
          .rec-priority,
          .rec-effort {
            display: inline-block;
            padding: 3px 8px;
            background: white;
            border-radius: 3px;
            font-size: 11px;
            font-weight: bold;
            text-transform: uppercase;
          }
          .prereq-card-wrapper {
            margin-top: 1.5rem;
            margin-bottom: 2rem;
          }
          .general-concepts-grid {
            margin-top: -10px;
          }
          .general-concepts-card {
            height: 100%;
            width: 100%;
          }
          @media (max-width: 640px) {
            .prereq-card-wrapper {
              margin-top: 1rem;
              margin-bottom: 1.5rem;
            }
          }
        `}</style>
    </div>
  );
};

export default {
  ChapterOverviewTimeline,
  PrincipleScoresRadar,
  ConceptMentionFrequency,
  ConceptMapVisualization,
  InterleavingPattern,
  ReviewScheduleTimeline,
  PrincipleFindings,
  ChapterAnalysisDashboard,
};

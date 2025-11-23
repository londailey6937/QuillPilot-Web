# Tome IQ - Quick Start Guide

**Experience Learning Science-Powered Document Analysis**

## 🎯 What You Get (Free Tier)

**Start analyzing immediately with powerful features:**

✅ **Professional Document Editor**

- Custom-built editor with rich text formatting (headings, lists, links, tables)
- Full image support (upload & paste)
- Working keyboard shortcuts (Cmd+B/I/U/K/F/Z)
- Inline color-coded analysis indicators
- Real-time spacing and dual-coding insights
- Import DOCX files with formatting preserved

✅ **Core Analysis Features**

- **Spacing & Pacing Analysis**: Paragraph-by-paragraph cognitive load assessment
- **Dual-Coding Suggestions**: AI-powered visual opportunity detection
- Smart sidebar with detailed analysis cards
- Up to 5,000 words per document (~20 pages)
- Save up to 3 analyzed documents

✅ **Smart Content Understanding**

- Auto-detects academic domain (Chemistry, Biology, Finance, etc.)
- Identifies compact, balanced, and extended paragraphs
- Suggests diagrams, flowcharts, and concept maps
- Proves the AI understands your content

## 🚀 Unlock More with Premium

**See what you're missing:**

- 🔒 **Full 10-Principle Analysis** - Complete learning science evaluation
- 🔒 **Export Features** - Save as HTML, DOCX, or JSON
- 🔒 **Concept Graphs** - Visual relationship mapping
- 🔒 **Custom Domains** - Build your own concept libraries
- 🔒 **Unlimited Pages** - Analyze entire textbooks (600+ pages)

---

## Document Size Support

**Free Tier:** Up to 5,000 words (~20 pages) - Perfect for single chapters
**Premium Tier:** Unlimited words - Analyze entire textbooks
**Professional Tier:** Unlimited words + batch processing

Supported formats: `.docx` and `.obt`

## Quick Setup

### 1. Install Dependencies

```bash
npm install recharts
```

**That's it!** All TypeScript types are included.

### 2. Use in Your React App

The simplest setup - just add the component:

```tsx
// App.tsx
import React from "react";
import { ChapterChecker } from "./ChapterChecker";

export default function App() {
  return <ChapterChecker />;
}
```

Done! Users can now:

- Paste or upload chapter text
- Click "Analyze Chapter"
- View interactive visualizations
- Export results as JSON

## Usage Examples

### Example 1: Basic Integration

```tsx
import { ChapterChecker } from "./ChapterChecker";

function MyApp() {
  return (
    <div>
      <h1>Learning Content Analyzer</h1>
      <ChapterChecker />
    </div>
  );
}
```

### Example 2: Programmatic Analysis

Analyze chapters directly without the UI:

```tsx
import { AnalysisEngine } from "./AnalysisEngine";
import ConceptExtractor from "./ConceptExtractor";
import { Chapter, AnalysisConfig } from "./types";

async function analyzeChapter(chapterText: string) {
  // Create chapter object
  const chapter: Chapter = {
    id: `ch-${Date.now()}`,
    title: "My Chapter",
    content: chapterText,
    wordCount: chapterText.split(/\s+/).length,
    sections: parseSections(chapterText),
    conceptGraph: {
      concepts: [],
      relationships: [],
      hierarchy: { core: [], supporting: [], detail: [] },
      sequence: [],
    },
    metadata: {
      readingLevel: "intermediate",
      domain: "education",
      targetAudience: "adult learners",
      estimatedReadingTime: 10,
      createdAt: new Date(),
      lastAnalyzed: new Date(),
    },
  };

  // Configure analysis
  const config: AnalysisConfig = {
    domain: "education",
    readingLevel: "intermediate",
    enableVisualization: true,
    conceptExtractionThreshold: 0.5,
    detailedReport: true,
  };

  // Run analysis
  const analysis = await AnalysisEngine.analyzeChapter(chapter, config);

  // Use results
  console.log(`Score: ${analysis.overallScore}/100`);

  // Show top recommendations
  analysis.recommendations
    .filter((r) => r.priority === "high")
    .forEach((r) => {
      console.log(`\n${r.title}`);
      console.log(r.description);
      console.log("Actions:", r.actionItems);
    });

  return analysis;
}

function parseSections(text: string) {
  return text
    .split(/\n#+\s+/)
    .filter((s) => s.length > 0)
    .map((section, i) => {
      const lines = section.split("\n");
      const heading = lines[0];
      const content = lines.slice(1).join("\n");
      return {
        id: `sec-${i}`,
        heading,
        content,
        startPosition: text.indexOf(section),
        endPosition: text.indexOf(section) + section.length,
        wordCount: content.split(/\s+/).length,
        conceptsIntroduced: [],
        conceptsRevisited: [],
        depth: 1,
      };
    });
}
```

### Example 3: Custom Dashboard

Build your own dashboard with the visualization components:

```tsx
import React, { useState } from "react";
import { AnalysisEngine } from "./AnalysisEngine";
import {
  PrincipleScoresRadar,
  CognitiveLoadCurve,
  ConceptMapVisualization,
  InterleavingPattern,
} from "./VisualizationComponents";
import { ChapterAnalysis } from "./types";

export function CustomDashboard() {
  const [analysis, setAnalysis] = useState<ChapterAnalysis | null>(null);

  const handleAnalyze = async (chapterText: string) => {
    // Your analysis logic here
    const result = await AnalysisEngine.analyzeChapter(chapter, config);
    setAnalysis(result);
  };

  if (!analysis) {
    return <div>Loading analysis...</div>;
  }

  return (
    <div className="dashboard">
      <h1>Chapter Analysis</h1>

      <section className="score-section">
        <h2>Overall: {analysis.overallScore}/100</h2>
      </section>

      <section className="visualizations">
        <PrincipleScoresRadar analysis={analysis} />
        <CognitiveLoadCurve analysis={analysis} />
        <InterleavingPattern analysis={analysis} />
      </section>

      <section className="recommendations">
        <h2>Recommendations</h2>
        {analysis.recommendations
          .filter((r) => r.priority === "high")
          .map((rec) => (
            <div key={rec.id}>
              <h3>{rec.title}</h3>
              <p>{rec.description}</p>
              <ul>
                {rec.actionItems.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
      </section>
    </div>
  );
}
```

### Example 4: Process Batch of Chapters

```tsx
async function analyzeMultipleChapters(chapters: string[]) {
  const results = [];

  for (const chapterText of chapters) {
    const analysis = await analyzeChapter(chapterText);
    results.push({
      score: analysis.overallScore,
      title: extractTitle(chapterText),
      weakestAreas: analysis.visualizations.principleScores.weakestPrinciples,
      topRecommendations: analysis.recommendations.slice(0, 3),
    });
  }

  // Generate summary report
  return {
    totalChapters: chapters.length,
    averageScore: results.reduce((sum, r) => sum + r.score, 0) / results.length,
    chapters: results,
  };
}
```

### Example 5: Stream Analysis Updates

Show real-time progress to users:

```tsx
async function* analyzeWithProgress(chapterText: string) {
  const chapter = createChapter(chapterText);

  yield { status: "Parsing content..." };

  const sections = chapter.sections;
  yield { status: `Found ${sections.length} sections` };

  yield { status: "Extracting concepts..." };
  const conceptGraph = await ConceptExtractor.extractConceptsFromChapter(
    chapter.content,
    sections
  );
  yield {
    status: `Found ${conceptGraph.concepts.length} concepts`,
    conceptGraph,
  };

  yield { status: "Evaluating learning principles..." };
  const analysis = await AnalysisEngine.analyzeChapter(chapter, config);
  yield { status: "Complete", analysis };
}

// Use with streaming
async function streamAnalysis(chapterText: string) {
  for await (const update of analyzeWithProgress(chapterText)) {
    console.log(update.status);
    if (update.analysis) {
      setAnalysis(update.analysis);
    }
  }
}
```

## 🎯 Common Recipes

### Get All High-Priority Recommendations

```typescript
const highPriority = analysis.recommendations.filter(
  (r) => r.priority === "high"
);
highPriority.forEach((rec) => {
  console.log(`${rec.title} (${rec.category})`);
  rec.actionItems.forEach((item) => console.log(`  → ${item}`));
});
```

### Find Weak Principles

```typescript
const weakestPrinciples = analysis.principles
  .sort((a, b) => a.score - b.score)
  .slice(0, 3);

weakestPrinciples.forEach((p) => {
  console.log(`${p.principle}: ${p.score}/100`);
  p.findings.forEach((f) => console.log(`  • ${f.message}`));
});
```

### Extract Concept Relationships

```typescript
const conceptGraph = analysis.visualizations.conceptMap;
const relationships = conceptGraph.links;

relationships
  .filter((r) => r.type === "prerequisite")
  .forEach((r) => {
    const source = conceptGraph.nodes.find((n) => n.id === r.source);
    const target = conceptGraph.nodes.find((n) => n.id === r.target);
    console.log(`${source?.label} → ${target?.label}`);
  });
```

### Calculate Chapter Quality Score by Domain

```typescript
function calculateDomainScore(analysis: ChapterAnalysis, domain: string) {
  const domainWeights: Record<string, Record<string, number>> = {
    science: {
      deepProcessing: 1.0,
      spacedRepetition: 0.9,
      retrievalPractice: 0.9,
      schemaBuilding: 1.0,
      interleaving: 0.7,
    },
    writing: {
      deepProcessing: 0.9,
      generativeLearning: 1.0,
      retrievalPractice: 0.8,
      metacognition: 0.9,
      emotionAndRelevance: 0.8,
    },
  };

  const weights = domainWeights[domain] || {};
  let total = 0;
  let weightSum = 0;

  analysis.principles.forEach((p) => {
    const weight = weights[p.principle] || 0.5;
    total += p.score * weight;
    weightSum += weight;
  });

  return weightSum > 0 ? total / weightSum : analysis.overallScore;
}
```

### Export Analysis Report

```typescript
function generateReport(analysis: ChapterAnalysis): string {
  let report = `# Chapter Analysis Report\n\n`;
  report += `**Overall Score:** ${analysis.overallScore}/100\n\n`;

  report += `## Principle Scores\n\n`;
  analysis.principles.forEach((p) => {
    report += `- **${p.principle}**: ${p.score}/100\n`;
  });

  report += `\n## Key Findings\n\n`;
  analysis.principles
    .filter((p) => p.findings.length > 0)
    .forEach((p) => {
      report += `### ${p.principle}\n`;
      p.findings.slice(0, 3).forEach((f) => {
        report += `- ${f.message}\n`;
      });
    });

  report += `\n## Top Recommendations\n\n`;
  analysis.recommendations
    .filter((r) => r.priority === "high")
    .slice(0, 5)
    .forEach((r) => {
      report += `### ${r.title}\n`;
      report += `${r.description}\n`;
      report += `**Actions:**\n`;
      r.actionItems.forEach((item) => {
        report += `- ${item}\n`;
      });
      report += `\n`;
    });

  return report;
}

// Save as markdown
const report = generateReport(analysis);
const blob = new Blob([report], { type: "text/markdown" });
const url = URL.createObjectURL(blob);
// ... download logic
```

## 🔌 API Integration Example

```typescript
// Backend example (Express.js)
app.post("/api/analyze-chapter", async (req, res) => {
  const { chapterText } = req.body;

  try {
    const analysis = await analyzeChapter(chapterText);
    res.json({
      success: true,
      score: analysis.overallScore,
      principles: analysis.principles.map((p) => ({
        name: p.principle,
        score: p.score,
      })),
      recommendations: analysis.recommendations.map((r) => ({
        title: r.title,
        priority: r.priority,
        actions: r.actionItems,
      })),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Frontend usage
async function analyzeViaAPI(chapterText: string) {
  const response = await fetch("/api/analyze-chapter", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chapterText }),
  });

  const data = await response.json();
  return data;
}
```

## 🎨 Styling Customization

The components use inline styles and CSS. Customize by wrapping:

```tsx
import { ChapterChecker } from "./ChapterChecker";

export function StyledChapterChecker() {
  return (
    <div className="custom-theme">
      <style>{`
        .custom-theme .chapter-textarea {
          font-size: 16px;
          background: #f8f9fa;
          border: 2px solid #007bff;
        }

        .custom-theme .btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
      `}</style>
      <ChapterChecker />
    </div>
  );
}
```

## 📊 Data Export

```typescript
// Export as CSV
function exportAsCSV(analysis: ChapterAnalysis) {
  const rows = [
    ["Principle", "Score", "Weight"],
    ...analysis.principles.map((p) => [p.principle, p.score, p.weight]),
  ];

  const csv = rows
    .map((row) => row.map((cell) => `"${cell}"`).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `analysis-${Date.now()}.csv`;
  link.click();
}

// Export as PDF (requires html2pdf library)
function exportAsPDF(analysis: ChapterAnalysis) {
  const element = document.getElementById("analysis-report");
  const opt = {
    margin: 10,
    filename: `chapter-analysis-${Date.now()}.pdf`,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { orientation: "portrait", unit: "mm", format: "a4" },
  };

  html2pdf().set(opt).from(element).save();
}
```

## ✅ Testing

```typescript
// Unit test example
import { DeepProcessingEvaluator } from "./LearningPrincipleEvaluators";
import { Chapter, ConceptGraph } from "./types";

describe("DeepProcessingEvaluator", () => {
  it("should detect why/how questions", () => {
    const chapter: Chapter = {
      // ... test data with "Why?" questions
    };
    const conceptGraph: ConceptGraph = {
      /* ... */
    };

    const result = DeepProcessingEvaluator.evaluate(chapter, conceptGraph);

    expect(result.score).toBeGreaterThan(50);
    expect(result.findings.some((f) => f.type === "positive")).toBe(true);
  });
});
```

## 🚀 Next Steps

1. ✅ Clone/copy the files
2. ✅ Install recharts
3. ✅ Import Tome IQ into your app
4. ✅ Users can start analyzing!

For advanced usage, see the [full README](./README.md).

---

**Happy analyzing! 🎓**

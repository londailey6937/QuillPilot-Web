import { AnalysisEngine } from "@/components/AnalysisEngine";
import type { Chapter } from "@/types";
import type { Domain } from "@/data/conceptLibraryRegistry";

const sampleText = `Hot code paths dominate performance discussions in many computing texts. When instructors describe how to profile applications, they often highlight the tight loops and critical rendering pipelines that execute thousands of times per second. In this short mock chapter we intentionally repeat several computing concepts such as algorithms, functions, classes, objects, inheritance, and recursion. The goal is to mimic a realistic chapter with more than two hundred words so the analysis pipeline has enough material to chew on.

We also include descriptions of debugging, testing, deployment, and version control practices. These paragraphs mention Git repositories, commits, branches, and pull requests. Later we pivot to asynchronous programming, promises, and async/await. By referencing networking basics like HTTP, REST, and JSON, we ensure the computing concept library remains relevant. Finally, the chapter circles back to hot code hotspots, profiling, and runtime behavior to exercise the new concept entry that was recently added.`;

const buildChapter = (domain: Domain): Chapter => {
  const content = `${sampleText}\n\n${sampleText}`;
  const words = content.split(/\s+/).filter(Boolean).length;
  return {
    id: `chapter-${domain}`,
    title: `Sample ${domain} chapter`,
    content,
    wordCount: words,
    sections: [],
    conceptGraph: {
      concepts: [],
      relationships: [],
      hierarchy: { core: [], supporting: [], detail: [] },
      sequence: [],
    },
    metadata: {
      readingLevel: "intermediate",
      domain,
      targetAudience: "test harness",
      estimatedReadingTime: Math.ceil(words / 200),
      createdAt: new Date(),
      lastAnalyzed: new Date(),
    },
  };
};

const run = async () => {
  const domains: Domain[] = ["computing", "chemistry"];
  for (const domain of domains) {
    console.log(`\nRunning analysis for domain: ${domain}`);
    const chapter = buildChapter(domain);
    const result = await AnalysisEngine.analyzeChapter(
      chapter,
      (step: string, detail?: string) =>
        console.log(`  [${domain}] ${step}: ${detail ?? ""}`),
      domain,
      true,
      []
    );
    console.log(
      `  [${domain}] Completed. Concepts: ${result.conceptGraph.concepts.length}, Overall Score: ${result.overallScore}`
    );
  }
};

run().catch((err) => {
  console.error("Analysis failed", err);
  process.exit(1);
});

import {
  PrincipleEvaluation,
  Finding,
  Suggestion,
  Evidence,
  Chapter,
  ConceptGraph,
  ChapterMetadata,
} from "./types.ts";

export class DualCodingEvaluator {
  static evaluate(
    chapter: Chapter,
    _concepts: ConceptGraph,
    patternAnalysis?: any
  ): PrincipleEvaluation {
    const visualReferences = this.countVisualReferences(
      chapter.content,
      chapter.metadata
    );
    const findings: Finding[] = [];
    const suggestions: Suggestion[] = [];
    const evidence: Evidence[] = [];

    evidence.push({
      type: "count",
      metric: "Visual References",
      value: visualReferences,
      threshold: Math.ceil(chapter.sections.length / 2),
      quality:
        visualReferences > Math.ceil(chapter.sections.length / 2)
          ? "strong"
          : "weak",
    });

    // Chemistry-specific: Lewis structures are visual representations
    if (patternAnalysis) {
      const lewisStructures =
        patternAnalysis.patterns?.filter(
          (p: any) => p.metadata?.problemType === "lewis-structure"
        ).length || 0;

      if (lewisStructures > 0) {
        evidence.push({
          type: "count",
          metric: "Lewis Structures (Visual)",
          value: lewisStructures,
          quality: "strong",
        });

        findings.push({
          type: "positive",
          message: `✓ Chemistry: ${lewisStructures} Lewis structures provide visual bonding representations`,
          severity: 0,
          evidence:
            "Lewis structures dual-code bonding concepts with electron dot diagrams",
        });
      }

      // Chemistry-specific: Chemical equations are visual representations
      const equations =
        patternAnalysis.patterns?.filter(
          (p: any) => p.title === "Chemical Equation"
        ).length || 0;

      if (equations > 0) {
        findings.push({
          type: "positive",
          message: `✓ Chemistry: ${equations} chemical equations visualize molecular transformations`,
          severity: 0,
          evidence:
            "Chemical equations dual-code reactions with symbolic notation and stoichiometric relationships",
        });
      }
    }

    // Generate findings based on visual reference count
    const minExpected = Math.ceil(chapter.sections.length / 2);

    if (visualReferences === 0) {
      findings.push({
        type: "critical",
        message: "No visual aids detected (diagrams, charts, figures)",
        severity: 0.9,
        evidence:
          "Dual coding (visual + verbal) improves comprehension by 89% vs text-only",
      });
    } else if (visualReferences < minExpected) {
      findings.push({
        type: "warning",
        message: `Only ${visualReferences} visual references (expected: ${minExpected} for ${chapter.sections.length} sections)`,
        severity: 0.6,
        evidence: "Aim for at least one visual aid per 2 sections",
      });
    } else {
      findings.push({
        type: "positive",
        message: `✓ Good visual integration: ${visualReferences} visual references found`,
        severity: 0,
        evidence: "Visual aids support dual coding and reduce cognitive load",
      });
    }

    // Generate suggestions if needed
    if (visualReferences < minExpected) {
      suggestions.push({
        id: "dual-coding-1",
        principle: "dualCoding",
        priority: visualReferences === 0 ? "high" : "medium",
        title: "Add Visual Representations",
        description:
          "Include diagrams, charts, or concept maps to support textual explanations",
        implementation:
          "For each major concept: (1) Add labeled diagram showing structure, (2) Use flowcharts for processes, (3) Include graphs for quantitative relationships",
        expectedImpact:
          "Dual coding activates both visual and verbal processing channels, improving comprehension and retention by 40-89%",
        relatedConcepts: [],
        examples: [
          "Diagram: Labeled molecular structure for chemical concepts",
          "Flowchart: Step-by-step problem-solving procedure",
          "Graph: Visual representation of mathematical relationships",
          "Concept Map: Shows connections between related ideas",
        ],
      });
    }

    let score = 50 + visualReferences * 5;

    return {
      principle: "dualCoding",
      score: Math.min(score, 100),
      weight: 0.8,
      findings,
      suggestions,
      evidence,
    };
  }

  private static countVisualReferences(
    text: string,
    metadata?: ChapterMetadata
  ): number {
    // Decode HTML entities to handle encoded content (e.g., &lt;img&gt; -> <img>)
    // Using manual replacement since we're in a Worker context without DOM access
    const decodeHtmlEntities = (str: string): string => {
      return str
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
    };

    const htmlSource = metadata?.sourceHtml?.trim().length
      ? metadata.sourceHtml
      : "";
    const baseForImageScan = htmlSource || text;
    const decodedImageSource = decodeHtmlEntities(baseForImageScan);
    const decodedText = decodeHtmlEntities(text);

    // Count actual embedded images (e.g., <img> tags from DOCX files)
    const imgMatches = decodedImageSource.match(/<img[^>]*>/gi);
    const embeddedImages = imgMatches ? imgMatches.length : 0;
    const metadataImageCount = metadata?.embeddedImageCount ?? 0;
    const totalEmbeddedImages = Math.max(embeddedImages, metadataImageCount);

    // Debug logging
    console.log("[DEBUG] Visual References Detection:");
    console.log(
      "- Text decoded:",
      text.length,
      "->",
      decodedText.length,
      "chars"
    );
    console.log(
      "- Embedded images found:",
      embeddedImages,
      "(metadata:",
      metadataImageCount,
      ")"
    );
    if (imgMatches) {
      console.log("- First img tag sample:", imgMatches[0]?.substring(0, 100));
    }

    // Count figure/diagram references with numbers (e.g., "Figure 1", "Diagram 2")
    const patterns = [
      /\bfigure\s+\d+/gi, // "Figure 1", "Figure 12"
      /\bdiagram\s+\d+/gi, // "Diagram 1"
      /\bchart\s+\d+/gi, // "Chart 1"
      /\bgraph\s+\d+/gi, // "Graph 1"
      /\bimage\s+\d+/gi, // "Image 1"
      /\billustration\s+\d+/gi, // "Illustration 1"
      /\(see\s+figure\s+\d+\)/gi, // "(see Figure 1)"
      /\bfig\.\s*\d+/gi, // "Fig. 1"
    ];

    const referenceSource = decodedText.trim().length ? decodedText : text;
    const textReferences = patterns.reduce((sum, pattern) => {
      return sum + (referenceSource.match(pattern) || []).length;
    }, 0);

    console.log("- Text references found:", textReferences);
    console.log(
      "- Total visual references:",
      totalEmbeddedImages + textReferences
    );

    // Return the total of embedded images + text references
    return totalEmbeddedImages + textReferences;
  }
}

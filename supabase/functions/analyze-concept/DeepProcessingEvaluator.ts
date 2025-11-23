import {
  PrincipleEvaluation,
  Finding,
  Suggestion,
  Evidence,
  Chapter,
  ConceptGraph,
} from "./types.ts";

export class DeepProcessingEvaluator {
  static evaluate(
    chapter: Chapter,
    concepts: ConceptGraph,
    patternAnalysis?: any
  ): PrincipleEvaluation {
    const findings: Finding[] = [];
    const evidence: Evidence[] = [];

    // Pattern-based enhancement: Worked examples indicate deeper processing
    if (patternAnalysis) {
      const workedExamples = patternAnalysis.patternCounts?.workedExample || 0;
      const definitionExamples =
        patternAnalysis.patternCounts?.definitionExample || 0;

      evidence.push({
        type: "count",
        metric: "Worked Examples",
        value: workedExamples,
        threshold: Math.ceil(chapter.sections.length * 0.5),
        quality:
          workedExamples >= chapter.sections.length * 0.5
            ? "strong"
            : workedExamples > 0
            ? "moderate"
            : "weak",
      });

      if (workedExamples >= chapter.sections.length * 0.5) {
        findings.push({
          type: "positive",
          message: `✓ Excellent: ${workedExamples} worked examples demonstrate step-by-step reasoning`,
          severity: 0,
          evidence: `Worked examples promote deeper processing by showing solution strategies`,
        });
      } else if (workedExamples === 0) {
        findings.push({
          type: "warning",
          message:
            "No worked examples found to demonstrate problem-solving strategies",
          severity: 0.6,
          evidence:
            "Worked examples help students understand reasoning processes",
        });
      }

      if (definitionExamples > 0) {
        findings.push({
          type: "positive",
          message: `✓ ${definitionExamples} definition-example pairs support conceptual understanding`,
          severity: 0,
          evidence:
            "Concrete examples help students connect abstract concepts to real applications",
        });
      }

      // Chemistry-specific: Chemical equations as worked examples
      const chemicalEquations =
        patternAnalysis.patterns?.filter(
          (p: any) =>
            p.title === "Chemical Equation" && p.metadata?.isWorkedExample
        ) || [];
      if (chemicalEquations.length > 0) {
        findings.push({
          type: "positive",
          message: `✓ Chemistry: ${chemicalEquations.length} balanced equations demonstrate reaction stoichiometry`,
          severity: 0,
          evidence:
            "Worked chemical equations show molecular-level transformations and quantitative relationships",
        });
      }

      // Chemistry-specific: Reaction mechanisms show deep understanding
      const mechanisms =
        patternAnalysis.patterns?.filter(
          (p: any) => p.metadata?.procedureType === "mechanism"
        ) || [];
      if (mechanisms.length > 0) {
        findings.push({
          type: "positive",
          message: `✓ Chemistry: ${mechanisms.length} reaction mechanisms explain step-by-step molecular changes`,
          severity: 0,
          evidence:
            "Reaction mechanisms promote deep processing by revealing electron movement and bond formation",
        });
      }
    }

    // NEW: Bloom's Taxonomy Classification
    const bloomsAnalysis = this.classifyQuestionsByBloomsLevel(chapter.content);
    evidence.push({
      type: "metric",
      metric: "Higher-Order Thinking %",
      value: bloomsAnalysis.higherOrderPercentage,
      threshold: 40,
      quality:
        bloomsAnalysis.higherOrderPercentage >= 40
          ? "strong"
          : bloomsAnalysis.higherOrderPercentage >= 25
          ? "moderate"
          : "weak",
    });

    // Add detailed Bloom's breakdown to evidence
    const totalBloomsQuestions =
      bloomsAnalysis.remember +
      bloomsAnalysis.understand +
      bloomsAnalysis.apply +
      bloomsAnalysis.analyze +
      bloomsAnalysis.evaluate +
      bloomsAnalysis.create;

    if (totalBloomsQuestions > 0) {
      evidence.push({
        type: "count",
        metric: "Bloom's Breakdown",
        value: `Remember: ${bloomsAnalysis.remember}, Understand: ${bloomsAnalysis.understand}, Apply: ${bloomsAnalysis.apply}, Analyze: ${bloomsAnalysis.analyze}, Evaluate: ${bloomsAnalysis.evaluate}, Create: ${bloomsAnalysis.create}`,
        quality: bloomsAnalysis.higherOrderPercentage >= 40 ? "strong" : "weak",
      });
    }

    if (bloomsAnalysis.higherOrderPercentage < 25) {
      findings.push({
        type: "critical",
        message: `Only ${bloomsAnalysis.higherOrderPercentage.toFixed(
          0
        )}% of questions target higher-order thinking (Analyze/Evaluate/Create)`,
        severity: 0.85,
        evidence: `Found: ${bloomsAnalysis.analyze} analyze, ${bloomsAnalysis.evaluate} evaluate, ${bloomsAnalysis.create} create questions`,
      });
    } else if (bloomsAnalysis.higherOrderPercentage >= 40) {
      findings.push({
        type: "positive",
        message: `✓ Excellent: ${bloomsAnalysis.higherOrderPercentage.toFixed(
          0
        )}% of questions promote higher-order thinking`,
        severity: 0,
        evidence: `Strong balance across Bloom's levels (Apply: ${bloomsAnalysis.apply}, Analyze: ${bloomsAnalysis.analyze}, Evaluate: ${bloomsAnalysis.evaluate}, Create: ${bloomsAnalysis.create})`,
      });
    }

    // NEW: Elaborative Interrogation Detection
    const elaborativeQuestions = this.detectElaborativeInterrogation(
      chapter.content
    );
    evidence.push({
      type: "count",
      metric: "elaborative_interrogation",
      value: elaborativeQuestions.count,
      threshold: Math.ceil(chapter.sections.length * 1.5),
      quality:
        elaborativeQuestions.count >= chapter.sections.length
          ? "strong"
          : "weak",
    });

    if (elaborativeQuestions.count < chapter.sections.length) {
      findings.push({
        type: "warning",
        message: "Limited elaborative interrogation prompts",
        severity: 0.7,
        evidence: `Only ${elaborativeQuestions.count} "why/how/what if" prompts encourage explanation generation`,
      });
    }

    // NEW: Worked Example Detection
    const workedExamples = this.detectWorkedExamples(chapter.content);
    evidence.push({
      type: "count",
      metric: "worked_examples",
      value: workedExamples.count,
      threshold: Math.max(2, Math.ceil(chapter.sections.length / 3)),
      quality: workedExamples.count >= 2 ? "strong" : "weak",
    });

    if (workedExamples.count === 0) {
      findings.push({
        type: "warning",
        message: "No worked examples with step-by-step reasoning",
        severity: 0.65,
        evidence: "Worked examples model expert thinking patterns",
      });
    } else {
      findings.push({
        type: "positive",
        message: `✓ Found ${workedExamples.count} worked examples modeling problem-solving`,
        severity: 0,
        evidence: workedExamples.examples.slice(0, 2).join("; "),
      });
    }

    // NEW: Explanation Depth Analysis
    const explanationDepth = this.measureExplanationDepth(
      chapter.content,
      concepts
    );
    evidence.push({
      type: "metric",
      metric: "explanation_depth_score",
      value: explanationDepth.avgDepth,
      threshold: 3,
      quality:
        explanationDepth.avgDepth >= 3
          ? "strong"
          : explanationDepth.avgDepth >= 2
          ? "moderate"
          : "weak",
    });

    if (explanationDepth.avgDepth < 2) {
      findings.push({
        type: "warning",
        message: "Shallow explanations - concepts lack multi-level elaboration",
        severity: 0.6,
        evidence: `Average depth: ${explanationDepth.avgDepth.toFixed(
          1
        )}/5 (definition → example → mechanism → connection → application)`,
      });
    }

    // Check 1: Questions that invite thinking ("Why?", "How?")
    const whyHowQuestions = this.countWhyHowQuestions(chapter.content);
    evidence.push({
      type: "count",
      metric: "why_how_questions",
      value: whyHowQuestions,
      threshold: Math.ceil(chapter.wordCount / 500),
      quality:
        whyHowQuestions > Math.ceil(chapter.wordCount / 500)
          ? "strong"
          : "weak",
    });

    if (whyHowQuestions === 0) {
      findings.push({
        type: "critical",
        message:
          'No "Why?" or "How?" questions detected to encourage deep thinking',
        severity: 0.8,
        evidence: "Section headers and content lack reflective questions",
      });
    } else if (whyHowQuestions > chapter.sections.length * 2) {
      findings.push({
        type: "positive",
        message: `✓ Excellent: ${whyHowQuestions} reflective questions found throughout`,
        severity: 0,
        evidence: `Frequent use of "Why?" and "How?" patterns`,
      });
    }

    // Check 2: Explanation variety (multiple ways of explaining concepts)
    const explanationMethods = this.analyzeExplanationVariety(
      chapter,
      concepts
    );
    evidence.push({
      type: "metric",
      metric: "explanation_variety",
      value: explanationMethods.uniqueMethods,
      threshold: 3,
      quality: explanationMethods.uniqueMethods >= 3 ? "strong" : "weak",
    });

    if (explanationMethods.uniqueMethods < 2) {
      findings.push({
        type: "warning",
        message:
          "Limited explanation variety; most concepts explained in only one way",
        severity: 0.6,
        evidence: explanationMethods.examples.join(", "),
      });
    } else {
      findings.push({
        type: "positive",
        message: `✓ Good: Concepts explained through ${explanationMethods.uniqueMethods} different methods`,
        severity: 0,
        evidence: explanationMethods.examples.join(", "),
      });
    }

    // Check 3: Prior knowledge connections
    const connections = this.detectPriorKnowledgeConnections(chapter.content);
    evidence.push({
      type: "count",
      metric: "prior_knowledge_connections",
      value: connections.count,
      threshold: Math.max(3, Math.ceil(chapter.sections.length / 3)),
      quality: connections.count > 0 ? "moderate" : "weak",
    });

    if (connections.count === 0) {
      findings.push({
        type: "warning",
        message: "Limited connection to prior knowledge or experiences",
        severity: 0.5,
        evidence:
          'Few phrases like "recall that", "previously learned", "similar to"',
      });
    } else {
      findings.push({
        type: "positive",
        message: `✓ Found ${connections.count} connections to prior knowledge`,
        severity: 0,
        evidence: connections.examples[0],
      });
    }

    // Check 4: Concept mapping or analogies
    const analogies = this.detectAnalogiesAndMaps(chapter.content);
    evidence.push({
      type: "count",
      metric: "analogies_concept_maps",
      value: analogies.count,
      quality: analogies.count > 2 ? "strong" : "weak",
    });

    if (analogies.count === 0) {
      findings.push({
        type: "warning",
        message: "No analogies or concept mapping instructions found",
        severity: 0.4,
        evidence:
          'Consider adding: "Think of X as..." or "Create a concept map showing..."',
      });
    }

    // Calculate score (enhanced with new metrics)
    let score = 30; // Base score

    // Bloom's taxonomy (0-25 points)
    score += bloomsAnalysis.higherOrderPercentage * 0.25;

    // Elaborative interrogation (0-15 points)
    const elaborationRatio =
      elaborativeQuestions.count / Math.max(chapter.sections.length, 1);
    score += Math.min(elaborationRatio * 10, 15);

    // Worked examples (0-10 points)
    score += Math.min(workedExamples.count * 3, 10);

    // Explanation depth (0-15 points)
    score += explanationDepth.avgDepth * 3;

    // Original metrics (0-35 points)
    score += whyHowQuestions > 0 ? 10 : 0;
    score +=
      explanationMethods.uniqueMethods >= 3
        ? 10
        : explanationMethods.uniqueMethods >= 2
        ? 5
        : 0;
    score += connections.count > 2 ? 8 : connections.count > 0 ? 4 : 0;
    score += analogies.count > 0 ? 7 : 0;
    score = Math.min(score, 100);

    const suggestions: Suggestion[] = [];

    if (bloomsAnalysis.higherOrderPercentage < 25) {
      suggestions.push({
        id: "deep-proc-0",
        principle: "deepProcessing",
        priority: "high",
        title: "Elevate to Higher-Order Thinking",
        description:
          "Add more questions that require analysis, evaluation, and creation (Bloom's higher levels)",
        implementation:
          'Replace "What is X?" with "How does X compare to Y?", "Why would X be more effective than Y?", "Design a solution using X"',
        expectedImpact:
          "Promotes critical thinking and deeper understanding rather than memorization",
        relatedConcepts: concepts.hierarchy.core.map((c) => c.id),
        examples: [
          "Analyze: Compare and contrast X with Y",
          "Evaluate: Which approach would be most effective and why?",
          "Create: Design an experiment to test this hypothesis",
        ],
      });
    }

    if (workedExamples.count === 0) {
      suggestions.push({
        id: "deep-proc-0.5",
        principle: "deepProcessing",
        priority: "high",
        title: "Add Worked Examples",
        description:
          "Include step-by-step demonstrations that model expert problem-solving",
        implementation:
          'Create examples with explicit reasoning: "Step 1: First, we identify... Step 2: Next, we apply... because..."',
        expectedImpact:
          "Learners observe expert thinking patterns and build mental models for problem-solving",
        relatedConcepts: concepts.hierarchy.core.map((c) => c.id).slice(0, 3),
        examples: [
          "Example 1: Let's solve this problem step-by-step...",
          "Work through: How would an expert approach this?",
          "Demonstration: Watch how we break this down systematically",
        ],
      });
    }

    if (whyHowQuestions === 0) {
      suggestions.push({
        id: "deep-proc-1",
        principle: "deepProcessing",
        priority: "high",
        title: "Add Reflective Questions",
        description:
          'Incorporate "Why?" and "How?" questions to encourage deep thinking',
        implementation:
          'After each major concept, add questions like "Why might this be true?" or "How would you apply this?"',
        expectedImpact:
          "Learners will actively make meaning rather than passively consume information",
        relatedConcepts: concepts.hierarchy.core.map((c) => c.id),
        examples: [
          "Why do you think the author chose this example?",
          "How does this connect to what we learned earlier?",
          "What assumptions is this argument making?",
        ],
      });
    }

    if (connections.count === 0) {
      suggestions.push({
        id: "deep-proc-2",
        principle: "deepProcessing",
        priority: "medium",
        title: "Bridge to Prior Knowledge",
        description:
          "Explicitly connect new concepts to previously learned material or common experiences",
        implementation:
          'Add transition phrases like "Recall that...", "Similar to what you learned about...", "Think back to when..."',
        expectedImpact:
          "New information attaches to existing mental models, strengthening retention",
        relatedConcepts: concepts.hierarchy.core.map((c) => c.id).slice(0, 3),
        examples: [
          "Recall that in Chapter 2, we learned about X. This concept builds on that foundation.",
          "You've probably experienced this when...",
          "Similar to how a muscle gets stronger with exercise, memory strengthens with retrieval practice.",
        ],
      });
    }

    return {
      principle: "deepProcessing",
      score,
      weight: 0.95, // Very important
      findings,
      suggestions,
      evidence,
    };
  }

  private static countWhyHowQuestions(text: string): number {
    const questionPatterns = [
      /\\bwhy\\s*\\??/gi,
      /\\bhow\\s*\\??/gi,
      /\\bwhat causes\\s*\\??/gi,
      /\\bwhat would happen if\\s*\\??/gi,
    ];
    return questionPatterns.reduce((count, pattern) => {
      const matches = text.match(pattern) || [];
      return count + matches.length;
    }, 0);
  }

  private static analyzeExplanationVariety(
    chapter: Chapter,
    _concepts: ConceptGraph
  ) {
    const methods = new Set<string>();
    const examples: string[] = [];

    // Detect different explanation types
    if (
      /(?:for example|such as|like|e\\.g\\.|including?)/i.test(chapter.content)
    ) {
      methods.add("examples");
      examples.push("examples");
    }
    if (/(?:analogy|think of|similar to|as if)/i.test(chapter.content)) {
      methods.add("analogy");
      examples.push("analogies");
    }
    if (/(?:definition|refers? to|means?|is a|is an)/i.test(chapter.content)) {
      methods.add("definition");
      examples.push("definitions");
    }
    if (/(?:step-by-step|process|sequence|procedure)/i.test(chapter.content)) {
      methods.add("process");
      examples.push("procedures");
    }
    if (/(?:formula|equation|diagram|visual)/i.test(chapter.content)) {
      methods.add("formula");
      examples.push("formulas");
    }
    if (/(?:history|background|context|why)/i.test(chapter.content)) {
      methods.add("context");
      examples.push("context/history");
    }

    return { uniqueMethods: methods.size, examples };
  }

  private static detectPriorKnowledgeConnections(text: string): {
    count: number;
    examples: string[];
  } {
    const patterns = [
      /recall\\s+that/gi,
      /you\\s+(?:may\\s+)?know\\s+(?:that)?/gi,
      /as\\s+you\\s+learned/gi,
      /previously/gi,
      /similar\\s+to/gi,
      /like\\s+(?:you|we)\\s+(?:saw|learned|discussed)/gi,
    ];

    let count = 0;
    const matches: string[] = [];

    patterns.forEach((pattern) => {
      const found = text.match(pattern) || [];
      count += found.length;
      matches.push(...found);
    });

    return { count, examples: matches.slice(0, 3) };
  }

  private static detectAnalogiesAndMaps(text: string): { count: number } {
    const patterns = [
      /think\\s+of\\s+.+\\s+as/gi,
      /is\\s+like\\s+a?/gi,
      /analogous\\s+to/gi,
    ];

    return {
      count: patterns.reduce((sum, pattern) => {
        return sum + (text.match(pattern) || []).length;
      }, 0),
    };
  }

  // NEW: Bloom's Taxonomy Classification
  private static classifyQuestionsByBloomsLevel(text: string): {
    remember: number;
    understand: number;
    apply: number;
    analyze: number;
    evaluate: number;
    create: number;
    higherOrderPercentage: number;
  } {
    // Remember: recall facts, terms, basic concepts
    const rememberPatterns = [
      /what is\\s+(?:the\\s+)?definition/gi,
      /list\\s+(?:the|all)/gi,
      /name\\s+(?:the|all)/gi,
      /identify\\s+(?:the|all)/gi,
      /recall/gi,
      /define/gi,
    ];

    // Understand: explain ideas, summarize
    const understandPatterns = [
      /explain\\s+(?:why|how|what)/gi,
      /describe\\s+(?:the|how)/gi,
      /summarize/gi,
      /paraphrase/gi,
      /what does\\s+\\w+\\s+mean/gi,
    ];

    // Apply: use information in new situations
    const applyPatterns = [
      /apply\\s+this/gi,
      /use\\s+(?:the|this|these)/gi,
      /demonstrate/gi,
      /solve\\s+(?:the|this)/gi,
      /calculate/gi,
      /how would you\\s+(?:use|apply)/gi,
    ];

    // Analyze: draw connections, examine structure
    const analyzePatterns = [
      /analyze/gi,
      /compare\\s+(?:and\\s+contrast)?/gi,
      /categorize/gi,
      /what is the relationship/gi,
      /distinguish\\s+between/gi,
      /examine/gi,
      /why\\s+(?:does|do|is|are)/gi,
    ];

    // Evaluate: justify decisions, critique
    const evaluatePatterns = [
      /evaluate/gi,
      /judge/gi,
      /critique/gi,
      /justify/gi,
      /which is better/gi,
      /assess/gi,
      /defend/gi,
      /what would you recommend/gi,
    ];

    // Create: produce new work, design
    const createPatterns = [
      /create/gi,
      /design/gi,
      /construct/gi,
      /develop\\s+a/gi,
      /propose/gi,
      /formulate/gi,
      /generate\\s+a/gi,
      /what if/gi,
    ];

    const countMatches = (patterns: RegExp[]) =>
      patterns.reduce((sum, p) => sum + (text.match(p) || []).length, 0);

    const remember = countMatches(rememberPatterns);
    const understand = countMatches(understandPatterns);
    const apply = countMatches(applyPatterns);
    const analyze = countMatches(analyzePatterns);
    const evaluate = countMatches(evaluatePatterns);
    const create = countMatches(createPatterns);

    const total = remember + understand + apply + analyze + evaluate + create;
    const higherOrder = analyze + evaluate + create;
    const higherOrderPercentage = total > 0 ? (higherOrder / total) * 100 : 0;

    return {
      remember,
      understand,
      apply,
      analyze,
      evaluate,
      create,
      higherOrderPercentage,
    };
  }

  // NEW: Detect Elaborative Interrogation (prompts that encourage explanation)
  private static detectElaborativeInterrogation(text: string): {
    count: number;
    examples: string[];
  } {
    const patterns = [
      /why\\s+(?:is|are|does|do|would|might|should)/gi,
      /how\\s+(?:does|do|would|might|could|can)/gi,
      /what\\s+if/gi,
      /what\\s+causes/gi,
      /what\\s+would\\s+happen\\s+if/gi,
      /explain\\s+why/gi,
      /can\\s+you\\s+explain/gi,
    ];

    let count = 0;
    const examples: string[] = [];

    patterns.forEach((pattern) => {
      const matches = text.match(pattern) || [];
      count += matches.length;
      if (matches.length > 0 && matches[0]) {
        examples.push(matches[0]);
      }
    });

    return { count, examples: examples.slice(0, 3) };
  }

  // NEW: Detect Worked Examples (step-by-step demonstrations)
  private static detectWorkedExamples(text: string): {
    count: number;
    examples: string[];
  } {
    const patterns = [
      /(?:step\\s+\\d+|first|second|third|next|then|finally)/gi,
      /(?:let's\\s+)?work\\s+through/gi,
      /(?:for\\s+)?example[:\\s]+/gi,
      /solution:/gi,
      /procedure:/gi,
    ];

    // Look for sequences of step indicators
    const stepSequences = text.match(
      /(?:step\\s+1|first).{50,500}(?:step\\s+2|second|next)/gi
    );
    const workThroughs = text.match(/work\\s+through[^.]{20,200}\\./gi);
    const exampleSolutions = text.match(/example[:\\s]+[^.]{50,300}\\./gi);

    const count =
      (stepSequences?.length || 0) +
      (workThroughs?.length || 0) +
      (exampleSolutions?.length || 0);

    const examples: string[] = [];
    if (stepSequences) examples.push("Multi-step procedure");
    if (workThroughs) examples.push("Worked-through problem");
    if (exampleSolutions) examples.push("Example with solution");

    return { count, examples };
  }

  // NEW: Measure Explanation Depth (layers of explanation)
  private static measureExplanationDepth(
    text: string,
    concepts: ConceptGraph
  ): {
    avgDepth: number;
    depths: number[];
  } {
    const depths: number[] = [];

    // For each core concept, measure explanation depth
    concepts.hierarchy.core.forEach((concept) => {
      let depth = 0;

      // Level 1: Definition present
      if (
        new RegExp(
          `\${concept.name}\\s+(?:is|are|refers?\\s+to|means?)`,
          "i"
        ).test(text)
      ) {
        depth++;
      }

      // Level 2: Example provided
      if (
        new RegExp(
          `(?:for\\s+example|such\\s+as|like|e\\.g\\.).*\${concept.name}`,
          "i"
        ).test(text)
      ) {
        depth++;
      }

      // Level 3: Mechanism/process explained
      if (
        new RegExp(
          `(?:how|why).*\${concept.name}|\${concept.name}.*(?:because|works\\s+by|occurs\\s+when)`,
          "i"
        ).test(text)
      ) {
        depth++;
      }

      // Level 4: Connection to other concepts
      if (concept.relatedConcepts && concept.relatedConcepts.length > 0) {
        depth++;
      }

      // Level 5: Application/real-world use
      if (
        new RegExp(
          `(?:apply|use|real-world|practical).*\${concept.name}`,
          "i"
        ).test(text)
      ) {
        depth++;
      }

      depths.push(depth);
    });

    const avgDepth =
      depths.length > 0 ? depths.reduce((a, b) => a + b, 0) / depths.length : 0;

    return { avgDepth, depths };
  }
}

import {
  PrincipleEvaluation,
  Finding,
  Suggestion,
  Evidence,
  Chapter,
  ConceptGraph,
} from "./types.ts";

export class SchemaBuildingEvaluator {
  static evaluate(
    _chapter: Chapter,
    concepts: ConceptGraph,
    patternAnalysis?: any
  ): PrincipleEvaluation {
    const hierarchyBalance = this.analyzeHierarchyBalance(concepts);
    const findings: Finding[] = [];
    const suggestions: Suggestion[] = [];
    const evidence: Evidence[] = [];

    // Pattern-based enhancement: Definition-example pairs build schemas
    if (patternAnalysis) {
      const definitionExamples =
        patternAnalysis.patterns?.filter(
          (p: any) => p.type === "definitionExample"
        ) || [];
      if (definitionExamples.length > concepts.concepts.length * 0.3) {
        findings.push({
          type: "positive",
          message: `✓ ${definitionExamples.length} definition-example pairs scaffold schema construction`,
          severity: 0,
          evidence:
            "Concrete examples linked to definitions help build organized mental models",
        });
      }

      // Chemistry-specific: Nomenclature builds taxonomic schemas
      const nomenclaturePractice =
        patternAnalysis.patterns?.filter(
          (p: any) => p.metadata?.problemType === "nomenclature"
        ) || [];
      if (nomenclaturePractice.length > 5) {
        findings.push({
          type: "positive",
          message: `✓ Chemistry: ${nomenclaturePractice.length} nomenclature exercises build systematic naming schemas`,
          severity: 0,
          evidence:
            "IUPAC naming practice develops hierarchical understanding of compound classification",
        });
      }
    }

    const total = concepts.concepts.length;
    const coreCount = concepts.hierarchy.core.length;
    const supportingCount = concepts.hierarchy.supporting.length;
    const detailCount = concepts.hierarchy.detail.length;

    evidence.push({
      type: "metric",
      metric: "Hierarchy Balance",
      value: hierarchyBalance,
      threshold: 0.6,
      quality: hierarchyBalance > 0.6 ? "strong" : "weak",
    });

    evidence.push({
      type: "count",
      metric: "Concept Distribution",
      value: `Core: ${coreCount}, Supporting: ${supportingCount}, Detail: ${detailCount}`,
      quality: hierarchyBalance > 0.6 ? "strong" : "weak",
    });

    // Generate findings based on hierarchy balance
    if (hierarchyBalance < 0.4) {
      findings.push({
        type: "critical",
        message:
          "Poor concept hierarchy balance—schema organization needs restructuring",
        severity: 0.8,
        evidence: `Current: ${coreCount} core, ${supportingCount} supporting, ${detailCount} detail. Optimal: 20% core, 30% supporting, 50% detail`,
      });
    } else if (hierarchyBalance < 0.6) {
      findings.push({
        type: "warning",
        message: "Concept hierarchy could be better balanced",
        severity: 0.5,
        evidence:
          "Well-structured hierarchies help students build organized mental models",
      });
    } else {
      findings.push({
        type: "positive",
        message: "✓ Well-balanced concept hierarchy",
        severity: 0,
        evidence: `Good distribution: ${((coreCount / total) * 100).toFixed(
          0
        )}% core, ${((supportingCount / total) * 100).toFixed(
          0
        )}% supporting, ${((detailCount / total) * 100).toFixed(0)}% detail`,
      });
    }

    // Generate suggestions if needed
    if (hierarchyBalance < 0.6) {
      const coreRatio = coreCount / total;
      const supportingRatio = supportingCount / total;

      let advice = "";
      if (coreRatio < 0.15) {
        advice =
          "Identify more foundational concepts as 'core' (aim for ~20% of total concepts)";
      } else if (coreRatio > 0.25) {
        advice =
          "Too many core concepts identified—focus on the most essential foundational concepts (aim for ~20% of total)";
      } else if (supportingRatio < 0.25) {
        advice =
          "Consider adding more concepts to bridge core ideas and provide detail (aim for ~30% supporting concepts)";
      } else {
        advice =
          "Rebalance concept distribution—detail concepts should be ~50% of total";
      }

      suggestions.push({
        id: "schema-1",
        principle: "schemaBuilding",
        priority: hierarchyBalance < 0.4 ? "high" : "medium",
        title: "Improve Concept Hierarchy Balance",
        description: advice,
        implementation:
          "Review concept classifications: Focus on identifying core concepts (foundational must-knows that all students should master)",
        expectedImpact:
          "Clear hierarchies help students organize knowledge and distinguish essential from supplementary information",
        relatedConcepts: concepts.hierarchy.core.map((c) => c.id).slice(0, 5),
        examples: [
          "Core: Fundamental principles everyone must master",
          "Supporting: How core concepts connect and apply",
          "Detail: Specific cases, examples, and extensions",
        ],
      });
    }

    let score = hierarchyBalance * 100;

    return {
      principle: "schemaBuilding",
      score: Math.min(score, 100),
      weight: 0.9,
      findings,
      suggestions,
      evidence,
    };
  }

  private static analyzeHierarchyBalance(concepts: ConceptGraph): number {
    const total = concepts.concepts.length;
    if (total === 0) return 0;
    const coreRatio = concepts.hierarchy.core.length / total;
    const supportingRatio = concepts.hierarchy.supporting.length / total;

    // Optimal: 20% core, 30% supporting, 50% detail
    const coreDeviation = Math.abs(coreRatio - 0.2);
    const supportingDeviation = Math.abs(supportingRatio - 0.3);
    const balance = 1 - (coreDeviation + supportingDeviation) / 2;

    return Math.max(balance, 0);
  }
}

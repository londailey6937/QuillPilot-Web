// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { DeepProcessingEvaluator } from "./DeepProcessingEvaluator.ts";
import { SpacedRepetitionEvaluator } from "./SpacedRepetitionEvaluator.ts";
import { RetrievalPracticeEvaluator } from "./RetrievalPracticeEvaluator.ts";
import { InterleavingEvaluator } from "./InterleavingEvaluator.ts";
import { DualCodingEvaluator } from "./DualCodingEvaluator.ts";
import { GenerativeLearningEvaluator } from "./GenerativeLearningEvaluator.ts";
import { MetacognitionEvaluator } from "./MetacognitionEvaluator.ts";
import { SchemaBuildingEvaluator } from "./SchemaBuildingEvaluator.ts";
import { CognitiveLoadEvaluator } from "./CognitiveLoadEvaluator.ts";
import { EmotionAndRelevanceEvaluator } from "./EmotionAndRelevanceEvaluator.ts";

console.log("Hello from Functions!");

serve(async (req: Request) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers":
          "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    const { chapter, concepts, patternAnalysis } = await req.json();

    if (!chapter || !concepts) {
      throw new Error("Missing required fields: chapter or concepts");
    }

    // Run all available evaluators
    const evaluations = [
      DeepProcessingEvaluator.evaluate(chapter, concepts, patternAnalysis),
      SpacedRepetitionEvaluator.evaluate(chapter, concepts, patternAnalysis),
      RetrievalPracticeEvaluator.evaluate(chapter, concepts, patternAnalysis),
      InterleavingEvaluator.evaluate(chapter, concepts, patternAnalysis),
      DualCodingEvaluator.evaluate(chapter, concepts, patternAnalysis),
      GenerativeLearningEvaluator.evaluate(chapter, concepts, patternAnalysis),
      MetacognitionEvaluator.evaluate(chapter, concepts, patternAnalysis),
      SchemaBuildingEvaluator.evaluate(chapter, concepts, patternAnalysis),
      CognitiveLoadEvaluator.evaluate(chapter, concepts, patternAnalysis),
      EmotionAndRelevanceEvaluator.evaluate(chapter, concepts, patternAnalysis),
    ];

    const data = {
      message: `Analysis performed securely on the server.`,
      results: evaluations,
    };

    return new Response(JSON.stringify(data), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || "Unknown error" }),
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        status: 400,
      }
    );
  }
});

import React, { useState } from "react";
import { supabase } from "../utils/supabase";

export const ServerAnalysisTest: React.FC = () => {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Construct a dummy payload for testing
      const dummyChapter = {
        id: "test-chapter",
        title: "Test Chapter",
        content: input,
        sections: [
          {
            id: "sec-1",
            heading: "Introduction",
            content: input,
            startPosition: 0,
            endPosition: input.length,
            wordCount: input.split(/\s+/).length,
            conceptsIntroduced: [],
          },
        ],
        metadata: {
          readingLevel: "intermediate",
          domain: "general",
          targetAudience: "student",
          estimatedReadingTime: 5,
          createdAt: new Date(),
          lastAnalyzed: new Date(),
        },
        wordCount: input.split(/\s+/).length,
      };

      const dummyConcepts = {
        concepts: [],
        relationships: [],
        hierarchy: { core: [], supporting: [], detail: [] },
        sequence: [],
      };

      const { data, error } = await supabase.functions.invoke(
        "analyze-concept",
        {
          body: {
            chapter: dummyChapter,
            concepts: dummyConcepts,
            patternAnalysis: { patternCounts: { workedExample: 0 } },
          },
        }
      );

      if (error) throw error;

      setResult(data);
    } catch (err: any) {
      console.error("Error invoking function:", err);
      setError(err.message || "Failed to invoke function");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg shadow-sm bg-white mt-4">
      <h3 className="text-lg font-semibold mb-2">Server-Side Analysis Test</h3>
      <p className="text-sm text-gray-600 mb-4">
        This component tests the secure Edge Function. The logic runs on the
        server, not in the browser.
      </p>

      <textarea
        className="w-full p-2 border rounded mb-2"
        rows={3}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter text to analyze..."
      />

      <button
        onClick={handleAnalyze}
        disabled={loading || !input}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Analyzing..." : "Run Secure Analysis"}
      </button>

      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-700 rounded border border-red-200">
          Error: {error}
        </div>
      )}

      {result && (
        <div className="mt-4 p-3 bg-green-50 rounded border border-green-200">
          <h4 className="font-medium text-green-800">Result from Server:</h4>
          <pre className="text-xs mt-2 overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

/**
 * Template Library
 *
 * Collection of document templates for different content types.
 * Each template provides structured prompts for AI assistance and manual writing.
 */

export interface Template {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: "academic" | "professional" | "general";
  generateTemplate: (analysis: any, chapterText: string) => string;
}

/**
 * Fiction Writing Template
 * Focused on narrative elements and storytelling techniques
 * Uses Cream & Tan backgrounds from colorPalette.md
 */
const fictionTemplate: Template = {
  id: "fiction",
  name: "Fiction Writing",
  description:
    "For novels, short stories, and creative narratives with character and plot development",
  icon: "📖",
  category: "academic",
  generateTemplate: (analysis, chapterText) => {
    // Wrapper resets text-indent for all nested elements to override PaginatedEditor's default
    let template = `<div style="font-family: Inter, system-ui, sans-serif; line-height: 1.8; max-width: 800px; margin: 0 auto; padding: 20px;" class="template-content"><style>.template-content, .template-content * { text-indent: 0 !important; }</style>`;

    // Header with obvious tan background
    template += `<div style="background-color: #c9a97c; padding: 24px; border-radius: 12px; margin-bottom: 32px; border: 2px solid #a67c52; text-align: left; text-indent: 0 !important;">
      <h1 style="margin: 0 0 8px 0; font-size: 28px; color: #111827; text-align: left; text-indent: 0 !important;">📖 Fiction Writing Template</h1>
      <p style="margin: 0; font-size: 14px; color: #111827; text-align: left; text-indent: 0 !important;">Craft compelling narratives with rich characters and engaging plots.</p>
    </div>`;

    // Scene Setting Section - Tan background
    template += `<div style="background-color: #e8d4b8; border-left: 4px solid #ef8432; padding: 20px; margin-bottom: 24px; border-radius: 8px; border: 1px solid #c9a97c;">
      <h2 style="margin: 0 0 12px 0; color: #111827; font-size: 20px;">🌍 Scene Setting & World-Building</h2>

      <div style="background: #fffaf3; padding: 16px; border-radius: 6px; margin: 12px 0; border: 1px solid #e0c392;">
        <strong style="color: #92400e;">[WRITER - Establish the Setting]</strong>
        <p style="margin: 8px 0 0 0; color: #111827;">Ground your reader in time and place. Use sensory details—what do characters see, hear, smell, feel? Create atmosphere through specific, evocative descriptions rather than generic statements.</p>
      </div>

      <div style="background: #fffaf3; padding: 16px; border-radius: 6px; margin: 12px 0; border: 1px solid #e0c392;">
        <strong style="color: #ef8432;">[CLAUDE - Enhance Setting Description]</strong>
        <code style="display: block; background: #f5ead9; padding: 12px; border-radius: 4px; font-size: 13px; color: #111827; margin-top: 8px; border: 1px solid #e0c392;">
          "Enhance this scene's setting with vivid sensory details. Add 2-3 specific details for each sense (sight, sound, smell, touch). Make the setting feel alive and immersive without over-writing. Here's the scene: [paste scene]"
        </code>
      </div>
    </div>`;

    // Character Development Section - Light tan background
    template += `<div style="background: #f7e6d0; border-left: 4px solid #ef8432; padding: 20px; margin-bottom: 24px; border-radius: 8px; border: 1px solid #e0c392;">
      <h2 style="margin: 0 0 12px 0; color: #111827; font-size: 20px;">👤 Character Development</h2>

      <div style="background: #fffaf3; padding: 16px; border-radius: 6px; margin: 12px 0; border: 1px solid #e0c392;">
        <strong style="color: #92400e;">[WRITER - Deepen Characters]</strong>
        <p style="margin: 8px 0 0 0; color: #111827;">Show character through action and dialogue, not just description. What does your character want? What's stopping them? Give them contradictions—flaws that make them human. Every character should have a distinct voice.</p>
      </div>

      <div style="background: #fffaf3; padding: 16px; border-radius: 6px; margin: 12px 0; border: 1px solid #e0c392;">
        <strong style="color: #ef8432;">[CLAUDE - Character Voice Check]</strong>
        <code style="display: block; background: #f5ead9; padding: 12px; border-radius: 4px; font-size: 13px; color: #111827; margin-top: 8px; border: 1px solid #e0c392;">
          "Analyze this character's dialogue and actions. Does their voice feel distinct? Suggest 3 ways to make their speech patterns, word choices, or mannerisms more unique. Here's the character content: [paste dialogue/scenes]"
        </code>
      </div>
    </div>`;

    // Dialogue Section - Cream background
    template += `<div style="background: #fef5e7; border-left: 4px solid #ef8432; padding: 20px; margin-bottom: 24px; border-radius: 8px; border: 1px solid #e0c392;">
      <h2 style="margin: 0 0 12px 0; color: #111827; font-size: 20px;">💬 Dialogue & Subtext</h2>

      <div style="background: #fffaf3; padding: 16px; border-radius: 6px; margin: 12px 0; border: 1px solid #e0c392;">
        <strong style="color: #92400e;">[WRITER - Sharpen Dialogue]</strong>
        <p style="margin: 8px 0 0 0; color: #111827;">Great dialogue does double duty—it reveals character AND advances plot. Cut small talk unless it's doing work. Add subtext: what characters mean vs. what they say. Use dialogue tags sparingly; let the words speak.</p>
      </div>

      <div style="background: #fffaf3; padding: 16px; border-radius: 6px; margin: 12px 0; border: 1px solid #e0c392;">
        <strong style="color: #ef8432;">[CLAUDE - Add Subtext to Dialogue]</strong>
        <code style="display: block; background: #f5ead9; padding: 12px; border-radius: 4px; font-size: 13px; color: #111827; margin-top: 8px; border: 1px solid #e0c392;">
          "Rewrite this dialogue to add subtext—what the characters really mean beneath their words. Add tension, unspoken emotions, or hidden agendas. Keep the same basic exchange but make it richer. Here's the dialogue: [paste dialogue]"
        </code>
      </div>
    </div>`;

    // Show Don't Tell Section - Light tan background
    template += `<div style="background: #f7e6d0; border-left: 4px solid #ef8432; padding: 20px; margin-bottom: 24px; border-radius: 8px; border: 1px solid #e0c392;">
      <h2 style="margin: 0 0 12px 0; color: #111827; font-size: 20px;">👁️ Show, Don't Tell</h2>

      <div style="background: #fffaf3; padding: 16px; border-radius: 6px; margin: 12px 0; border: 1px solid #e0c392;">
        <strong style="color: #92400e;">[WRITER - Convert Telling to Showing]</strong>
        <p style="margin: 8px 0 0 0; color: #111827;">Replace emotional statements with physical reactions and behaviors. Instead of "She was angry," show clenched fists, a tight jaw, clipped words. Let readers infer emotions from evidence.</p>
      </div>

      <div style="background: #fffaf3; padding: 16px; border-radius: 6px; margin: 12px 0; border: 1px solid #e0c392;">
        <strong style="color: #ef8432;">[CLAUDE - Transform Tell into Show]</strong>
        <code style="display: block; background: #f5ead9; padding: 12px; border-radius: 4px; font-size: 13px; color: #111827; margin-top: 8px; border: 1px solid #e0c392;">
          "Find instances of 'telling' in this passage and rewrite them as 'showing.' Replace emotional labels with physical details, actions, and sensory descriptions. Maintain the same meaning but make it more immersive. Here's the passage: [paste text]"
        </code>
      </div>
    </div>`;

    // Pacing & Tension Section - Cream background
    template += `<div style="background: #fef5e7; border-left: 4px solid #ef8432; padding: 20px; margin-bottom: 24px; border-radius: 8px; border: 1px solid #e0c392;">
      <h2 style="margin: 0 0 12px 0; color: #111827; font-size: 20px;">⚡ Pacing & Tension</h2>

      <div style="background: #fffaf3; padding: 16px; border-radius: 6px; margin: 12px 0; border: 1px solid #e0c392;">
        <strong style="color: #92400e;">[WRITER - Control Your Pacing]</strong>
        <p style="margin: 8px 0 0 0; color: #111827;">Short sentences = fast pace, tension. Long sentences = slower, reflective moments. Vary paragraph length. End chapters on hooks. Every scene needs conflict or tension—even quiet moments should have undercurrents.</p>
      </div>

      <div style="background: #fffaf3; padding: 16px; border-radius: 6px; margin: 12px 0; border: 1px solid #e0c392;">
        <strong style="color: #ef8432;">[CLAUDE - Analyze Pacing]</strong>
        <code style="display: block; background: #f5ead9; padding: 12px; border-radius: 4px; font-size: 13px; color: #111827; margin-top: 8px; border: 1px solid #e0c392;">
          "Analyze the pacing of this scene. Where does it drag? Where could tension be heightened? Suggest specific sentence-level changes to improve rhythm and momentum. Here's the scene: [paste scene]"
        </code>
      </div>
    </div>`;

    // Footer
    template += `<div style="background: #eddcc5; padding: 20px; border-radius: 8px; margin-top: 24px; border: 1px solid #e0c392;">
      <p style="margin: 0; color: #111827; font-size: 14px;"><strong>Next Steps:</strong> Work through each section, filling in [WRITER] prompts with your own revisions. Use [CLAUDE] prompts when you need AI assistance with specific passages.</p>
    </div>`;

    template += `</div>`;
    return template;
  },
};

/**
 * Non-Fiction Writing Template
 * For articles, guides, memoirs, and informational writing
 * Uses Cream & Tan backgrounds from colorPalette.md
 */
const generalContentTemplate: Template = {
  id: "nonfiction",
  name: "Non-Fiction Writing",
  description: "For articles, memoirs, essays, and informational content",
  icon: "✍️",
  category: "general",
  generateTemplate: (analysis, chapterText) => {
    const cognitiveLoad =
      analysis.principles?.find((p: any) => p.principle === "cognitiveLoad")
        ?.score || 0;

    // Wrapper resets text-indent for all nested elements to override PaginatedEditor's default
    let template = `<div style="font-family: Inter, system-ui, sans-serif; line-height: 1.8; max-width: 800px; margin: 0 auto; padding: 20px;" class="template-content"><style>.template-content, .template-content * { text-indent: 0 !important; }</style>`;

    // Header with obvious tan background
    template += `<div style="background-color: #c9a97c; padding: 24px; border-radius: 12px; margin-bottom: 32px; border: 2px solid #a67c52; text-align: left; text-indent: 0 !important;">
      <h1 style="margin: 0 0 8px 0; font-size: 28px; color: #111827; text-align: left; text-indent: 0 !important;">✍️ Non-Fiction Writing Template</h1>
      <p style="margin: 0; font-size: 14px; color: #111827; text-align: left; text-indent: 0 !important;">Improve clarity, engagement, and readability of your content.</p>
    </div>`;

    // Introduction Section - Cream background
    template += `<div style="background: #fef5e7; border-left: 4px solid #ef8432; padding: 20px; margin-bottom: 24px; border-radius: 8px; border: 1px solid #e0c392;">
      <h2 style="margin: 0 0 12px 0; color: #111827; font-size: 20px;">🎯 Introduction & Hook</h2>

      <div style="background: #fffaf3; padding: 16px; border-radius: 6px; margin: 12px 0; border: 1px solid #e0c392;">
        <strong style="color: #92400e;">[WRITER - Engaging Opening]</strong>
        <p style="margin: 8px 0 0 0; color: #111827;">Start with a compelling hook: a question, surprising fact, relatable scenario, or bold statement. Clearly state what the reader will learn and why it matters to them.</p>
      </div>

      <div style="background: #fffaf3; padding: 16px; border-radius: 6px; margin: 12px 0; border: 1px solid #e0c392;">
        <strong style="color: #ef8432;">[CLAUDE - Craft Attention-Grabbing Opening]</strong>
        <code style="display: block; background: #f5ead9; padding: 12px; border-radius: 4px; font-size: 13px; color: #111827; margin-top: 8px; border: 1px solid #e0c392;">
          "Write an engaging 2-3 sentence introduction for this content that hooks the reader immediately. Include either: a thought-provoking question, a surprising statistic, or a relatable problem. Then clearly state the benefit of reading. Topic: [paste topic/summary]"
        </code>
      </div>
    </div>`;

    // Main Content Section - Light tan background
    template += `<div style="background: #f7e6d0; border-left: 4px solid #ef8432; padding: 20px; margin-bottom: 24px; border-radius: 8px; border: 1px solid #e0c392;">
      <h2 style="margin: 0 0 12px 0; color: #111827; font-size: 20px;">📚 Main Content & Key Points</h2>

      <div style="background: #fffaf3; padding: 16px; border-radius: 6px; margin: 12px 0; border: 1px solid #e0c392;">
        <strong style="color: #92400e;">[WRITER - Structure Your Content]</strong>
        <p style="margin: 8px 0 0 0; color: #111827;">Break content into 3-5 main sections with clear subheadings. Each section should cover one key idea. Use short paragraphs (3-4 sentences max) and bullet points for scannability.</p>
      </div>

      <div style="background: #fffaf3; padding: 16px; border-radius: 6px; margin: 12px 0; border: 1px solid #e0c392;">
        <strong style="color: #ef8432;">[CLAUDE - Create Content Outline]</strong>
        <code style="display: block; background: #f5ead9; padding: 12px; border-radius: 4px; font-size: 13px; color: #111827; margin-top: 8px; border: 1px solid #e0c392;">
          "Create a logical outline for this content with 3-5 main sections. For each section: 1) suggest a clear subheading, 2) list 2-3 key points to cover, 3) recommend one supporting element (example, statistic, or story). Here's the content: [paste draft]"
        </code>
      </div>
    </div>`;

    // Examples & Clarity Section - Cream background
    template += `<div style="background: #fef5e7; border-left: 4px solid #ef8432; padding: 20px; margin-bottom: 24px; border-radius: 8px; border: 1px solid #e0c392;">
      <h2 style="margin: 0 0 12px 0; color: #111827; font-size: 20px;">💡 Examples & Practical Application</h2>

      <div style="background: #fffaf3; padding: 16px; border-radius: 6px; margin: 12px 0; border: 1px solid #e0c392;">
        <strong style="color: #92400e;">[WRITER - Add Concrete Examples]</strong>
        <p style="margin: 8px 0 0 0; color: #111827;">For each main concept, provide a real-world example or analogy. Use "For instance..." or "Imagine..." to introduce examples. Make abstract ideas concrete and relatable.</p>
      </div>

      <div style="background: #fffaf3; padding: 16px; border-radius: 6px; margin: 12px 0; border: 1px solid #e0c392;">
        <strong style="color: #ef8432;">[CLAUDE - Generate Examples]</strong>
        <code style="display: block; background: #f5ead9; padding: 12px; border-radius: 4px; font-size: 13px; color: #111827; margin-top: 8px; border: 1px solid #e0c392;">
          "For this concept, create 2-3 concrete examples that make it immediately understandable. Use everyday situations, analogies, or scenarios. Make sure examples are diverse and relatable to different audiences. Here's the concept: [paste concept explanation]"
        </code>
      </div>
    </div>`;

    // Visual Elements Section - Light tan background
    template += `<div style="background: #f7e6d0; border-left: 4px solid #ef8432; padding: 20px; margin-bottom: 24px; border-radius: 8px; border: 1px solid #e0c392;">
      <h2 style="margin: 0 0 12px 0; color: #111827; font-size: 20px;">🎨 Visual Enhancement</h2>

      <div style="background: #fffaf3; padding: 16px; border-radius: 6px; margin: 12px 0; border: 1px solid #e0c392;">
        <strong style="color: #10b981;">[VISUAL - Add Supporting Visuals]</strong>
        <p style="margin: 8px 0 0 0; color: #111827;">Consider adding:</p>
        <ul style="margin: 8px 0; padding-left: 24px; color: #111827;">
          <li>Infographics summarizing key data</li>
          <li>Photos or illustrations showing examples</li>
          <li>Simple diagrams explaining processes</li>
          <li>Pull quotes highlighting important points</li>
          <li>Icons to break up text and mark sections</li>
        </ul>
      </div>
    </div>`;

    // Conclusion Section - Cream background
    template += `<div style="background: #fef5e7; border-left: 4px solid #ef8432; padding: 20px; margin-bottom: 24px; border-radius: 8px; border: 1px solid #e0c392;">
      <h2 style="margin: 0 0 12px 0; color: #111827; font-size: 20px;">🎬 Conclusion & Next Steps</h2>

      <div style="background: #fffaf3; padding: 16px; border-radius: 6px; margin: 12px 0; border: 1px solid #e0c392;">
        <strong style="color: #92400e;">[WRITER - Strong Closing]</strong>
        <p style="margin: 8px 0 0 0; color: #111827;">Summarize the 1-3 most important takeaways. End with a clear call-to-action or next step for the reader. What should they do with this information?</p>
      </div>

      <div style="background: #fffaf3; padding: 16px; border-radius: 6px; margin: 12px 0; border: 1px solid #e0c392;">
        <strong style="color: #ef8432;">[CLAUDE - Create Actionable Conclusion]</strong>
        <code style="display: block; background: #f5ead9; padding: 12px; border-radius: 4px; font-size: 13px; color: #111827; margin-top: 8px; border: 1px solid #e0c392;">
          "Write a compelling conclusion that: 1) summarizes the key takeaways in 2-3 sentences, 2) provides a specific, actionable next step, 3) leaves the reader feeling motivated. Here's the content: [paste main points]"
        </code>
      </div>
    </div>`;

    if (cognitiveLoad < 70) {
      template += `<div style="background: #fee2e2; border-left: 4px solid #ef4444; padding: 20px; margin-bottom: 24px; border-radius: 8px; border: 1px solid #e0c392;">
        <h2 style="margin: 0 0 12px 0; color: #991b1b; font-size: 20px;">⚠️ Readability Check (Cognitive Load: ${Math.round(
          cognitiveLoad
        )}/100)</h2>
        <p style="margin: 0; color: #7f1d1d;">Your content may be too dense. Consider: breaking long paragraphs, using more headings, adding white space, simplifying complex sentences, and including more examples.</p>
      </div>`;
    }

    // Footer
    template += `<div style="background: #eddcc5; padding: 20px; border-radius: 8px; margin-top: 24px; border: 1px solid #e0c392;">
      <p style="margin: 0; color: #111827; font-size: 14px;"><strong>Next Steps:</strong> Work through each section systematically. Use the [CLAUDE] prompts for AI assistance. Add visuals where marked. Review for clarity and flow before publishing.</p>
    </div>`;

    template += `</div>`;
    return template;
  },
};

/**
 * Template Library - All available templates
 */
export const TEMPLATE_LIBRARY: Template[] = [
  fictionTemplate, // Fiction Writing
  generalContentTemplate, // Non-Fiction Writing
];

/**
 * Get template by ID
 */
export function getTemplateById(id: string): Template | undefined {
  return TEMPLATE_LIBRARY.find((t) => t.id === id);
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(
  category: Template["category"]
): Template[] {
  return TEMPLATE_LIBRARY.filter((t) => t.category === category);
}

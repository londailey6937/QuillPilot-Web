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
 */
const fictionTemplate: Template = {
  id: "fiction",
  name: "Fiction Writing",
  description:
    "For novels, short stories, and creative narratives with character and plot development",
  icon: "📖",
  category: "academic",
  generateTemplate: (analysis, chapterText) => {
    let template = `<div style="font-family: Inter, system-ui, sans-serif; line-height: 1.8; max-width: 800px; margin: 0 auto; padding: 20px;">`;

    template += `<div style="background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%); color: white; padding: 24px; border-radius: 12px; margin-bottom: 32px;">
      <h1 style="margin: 0 0 8px 0; font-size: 28px;">📖 Fiction Writing Template</h1>
      <p style="margin: 0; opacity: 0.95; font-size: 14px;">Craft compelling narratives with rich characters and engaging plots.</p>
    </div>`;

    // Scene Setting Section
    template += `<div style="background: #dbeafe; border-left: 4px solid #3b82f6; padding: 20px; margin-bottom: 24px; border-radius: 8px;">
      <h2 style="margin: 0 0 12px 0; color: #1e40af; font-size: 20px;">🌍 Scene Setting & World-Building</h2>

      <div style="background: white; padding: 16px; border-radius: 6px; margin: 12px 0;">
        <strong style="color: #7c2d12;">[WRITER - Establish the Setting]</strong>
        <p style="margin: 8px 0 0 0; color: #1e3a8a;">Ground your reader in time and place. Use sensory details—what do characters see, hear, smell, feel? Create atmosphere through specific, evocative descriptions rather than generic statements.</p>
      </div>

      <div style="background: white; padding: 16px; border-radius: 6px; margin: 12px 0;">
        <strong style="color: #6366f1;">[CLAUDE - Enhance Setting Description]</strong>
        <code style="display: block; background: #f9fafb; padding: 12px; border-radius: 4px; font-size: 13px; color: #1f2937; margin-top: 8px;">
          "Enhance this scene's setting with vivid sensory details. Add 2-3 specific details for each sense (sight, sound, smell, touch). Make the setting feel alive and immersive without over-writing. Here's the scene: [paste scene]"
        </code>
      </div>
    </div>`;

    // Character Development Section
    template += `<div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin-bottom: 24px; border-radius: 8px;">
      <h2 style="margin: 0 0 12px 0; color: #92400e; font-size: 20px;">👤 Character Development</h2>

      <div style="background: white; padding: 16px; border-radius: 6px; margin: 12px 0;">
        <strong style="color: #7c2d12;">[WRITER - Deepen Characters]</strong>
        <p style="margin: 8px 0 0 0; color: #78350f;">Show character through action and dialogue, not just description. What does your character want? What's stopping them? Give them contradictions—flaws that make them human. Every character should have a distinct voice.</p>
      </div>

      <div style="background: white; padding: 16px; border-radius: 6px; margin: 12px 0;">
        <strong style="color: #6366f1;">[CLAUDE - Character Voice Check]</strong>
        <code style="display: block; background: #f9fafb; padding: 12px; border-radius: 4px; font-size: 13px; color: #1f2937; margin-top: 8px;">
          "Analyze this character's dialogue and actions. Does their voice feel distinct? Suggest 3 ways to make their speech patterns, word choices, or mannerisms more unique. Here's the character content: [paste dialogue/scenes]"
        </code>
      </div>
    </div>`;

    // Dialogue Section
    template += `<div style="background: #dcfce7; border-left: 4px solid #16a34a; padding: 20px; margin-bottom: 24px; border-radius: 8px;">
      <h2 style="margin: 0 0 12px 0; color: #166534; font-size: 20px;">💬 Dialogue & Subtext</h2>

      <div style="background: white; padding: 16px; border-radius: 6px; margin: 12px 0;">
        <strong style="color: #7c2d12;">[WRITER - Sharpen Dialogue]</strong>
        <p style="margin: 8px 0 0 0; color: #14532d;">Great dialogue does double duty—it reveals character AND advances plot. Cut small talk unless it's doing work. Add subtext: what characters mean vs. what they say. Use dialogue tags sparingly; let the words speak.</p>
      </div>

      <div style="background: white; padding: 16px; border-radius: 6px; margin: 12px 0;">
        <strong style="color: #6366f1;">[CLAUDE - Add Subtext to Dialogue]</strong>
        <code style="display: block; background: #f9fafb; padding: 12px; border-radius: 4px; font-size: 13px; color: #1f2937; margin-top: 8px;">
          "Rewrite this dialogue to add subtext—what the characters really mean beneath their words. Add tension, unspoken emotions, or hidden agendas. Keep the same basic exchange but make it richer. Here's the dialogue: [paste dialogue]"
        </code>
      </div>
    </div>`;

    // Show Don't Tell Section
    template += `<div style="background: #f3e8ff; border-left: 4px solid #9333ea; padding: 20px; margin-bottom: 24px; border-radius: 8px;">
      <h2 style="margin: 0 0 12px 0; color: #581c87; font-size: 20px;">👁️ Show, Don't Tell</h2>

      <div style="background: white; padding: 16px; border-radius: 6px; margin: 12px 0;">
        <strong style="color: #7c2d12;">[WRITER - Convert Telling to Showing]</strong>
        <p style="margin: 8px 0 0 0; color: #581c87;">Replace emotional statements with physical reactions and behaviors. Instead of "She was angry," show clenched fists, a tight jaw, clipped words. Let readers infer emotions from evidence.</p>
      </div>

      <div style="background: white; padding: 16px; border-radius: 6px; margin: 12px 0;">
        <strong style="color: #6366f1;">[CLAUDE - Transform Tell into Show]</strong>
        <code style="display: block; background: #f9fafb; padding: 12px; border-radius: 4px; font-size: 13px; color: #1f2937; margin-top: 8px;">
          "Find instances of 'telling' in this passage and rewrite them as 'showing.' Replace emotional labels with physical details, actions, and sensory descriptions. Maintain the same meaning but make it more immersive. Here's the passage: [paste text]"
        </code>
      </div>
    </div>`;

    // Pacing & Tension Section
    template += `<div style="background: #fee2e2; border-left: 4px solid #ef4444; padding: 20px; margin-bottom: 24px; border-radius: 8px;">
      <h2 style="margin: 0 0 12px 0; color: #991b1b; font-size: 20px;">⚡ Pacing & Tension</h2>

      <div style="background: white; padding: 16px; border-radius: 6px; margin: 12px 0;">
        <strong style="color: #7c2d12;">[WRITER - Control Your Pacing]</strong>
        <p style="margin: 8px 0 0 0; color: #7f1d1d;">Short sentences = fast pace, tension. Long sentences = slower, reflective moments. Vary paragraph length. End chapters on hooks. Every scene needs conflict or tension—even quiet moments should have undercurrents.</p>
      </div>

      <div style="background: white; padding: 16px; border-radius: 6px; margin: 12px 0;">
        <strong style="color: #6366f1;">[CLAUDE - Analyze Pacing]</strong>
        <code style="display: block; background: #f9fafb; padding: 12px; border-radius: 4px; font-size: 13px; color: #1f2937; margin-top: 8px;">
          "Analyze the pacing of this scene. Where does it drag? Where could tension be heightened? Suggest specific sentence-level changes to improve rhythm and momentum. Here's the scene: [paste scene]"
        </code>
      </div>
    </div>`;

    template += `<div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin-top: 24px;">
      <p style="margin: 0; color: #4b5563; font-size: 14px;"><strong>Next Steps:</strong> Work through each section, filling in [WRITER] prompts with your own revisions. Use [CLAUDE] prompts when you need AI assistance with specific passages.</p>
    </div>`;

    template += `</div>`;
    return template;
  },
};

/**
 * Employee Manual / Training Template
 * Focused on procedures, policies, and practical application
 */
const employeeManualTemplate: Template = {
  id: "employee-manual",
  name: "Employee Manual / Training",
  description:
    "For onboarding guides, policy documents, and procedural training materials",
  icon: "👔",
  category: "professional",
  generateTemplate: (analysis, chapterText) => {
    let template = `<div style="font-family: Inter, system-ui, sans-serif; line-height: 1.8; max-width: 800px; margin: 0 auto; padding: 20px;">`;

    template += `<div style="background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); color: white; padding: 24px; border-radius: 12px; margin-bottom: 32px;">
      <h1 style="margin: 0 0 8px 0; font-size: 28px;">👔 Employee Manual Enhancement Template</h1>
      <p style="margin: 0; opacity: 0.95; font-size: 14px;">Structure your employee documentation for clarity and compliance.</p>
    </div>`;

    // Overview Section
    template += `<div style="background: #e0f2fe; border-left: 4px solid #0284c7; padding: 20px; margin-bottom: 24px; border-radius: 8px;">
      <h2 style="margin: 0 0 12px 0; color: #075985; font-size: 20px;">📋 Overview & Purpose</h2>

      <div style="background: white; padding: 16px; border-radius: 6px; margin: 12px 0;">
        <strong style="color: #7c2d12;">[WRITER - Document Purpose]</strong>
        <p style="margin: 8px 0 0 0; color: #0c4a6e;">Clearly state what this document covers, who it applies to, and when it should be referenced. Include the effective date and any version information.</p>
      </div>

      <div style="background: white; padding: 16px; border-radius: 6px; margin: 12px 0;">
        <strong style="color: #6366f1;">[CLAUDE - Generate Clear Summary]</strong>
        <code style="display: block; background: #f9fafb; padding: 12px; border-radius: 4px; font-size: 13px; color: #1f2937; margin-top: 8px;">
          "Create a concise 2-3 sentence overview of this employee manual section that explains its purpose, scope, and importance. Make it clear and actionable. Here's the content: [paste section]"
        </code>
      </div>
    </div>`;

    // Key Policies Section
    template += `<div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin-bottom: 24px; border-radius: 8px;">
      <h2 style="margin: 0 0 12px 0; color: #92400e; font-size: 20px;">⚖️ Key Policies & Procedures</h2>

      <div style="background: white; padding: 16px; border-radius: 6px; margin: 12px 0;">
        <strong style="color: #7c2d12;">[WRITER - List Critical Policies]</strong>
        <p style="margin: 8px 0 0 0; color: #78350f;">Break down complex policies into numbered steps. Use "must," "should," and "may" consistently. Include examples of compliance and non-compliance.</p>
      </div>

      <div style="background: white; padding: 16px; border-radius: 6px; margin: 12px 0;">
        <strong style="color: #6366f1;">[CLAUDE - Create Procedure Checklist]</strong>
        <code style="display: block; background: #f9fafb; padding: 12px; border-radius: 4px; font-size: 13px; color: #1f2937; margin-top: 8px;">
          "Convert this policy description into a step-by-step checklist that employees can follow. Each step should be actionable and specific. Include decision points where applicable. Here's the content: [paste policy section]"
        </code>
      </div>
    </div>`;

    // Real-World Examples Section
    template += `<div style="background: #dcfce7; border-left: 4px solid #16a34a; padding: 20px; margin-bottom: 24px; border-radius: 8px;">
      <h2 style="margin: 0 0 12px 0; color: #166534; font-size: 20px;">💡 Real-World Examples & Scenarios</h2>

      <div style="background: white; padding: 16px; border-radius: 6px; margin: 12px 0;">
        <strong style="color: #7c2d12;">[WRITER - Add Practical Examples]</strong>
        <p style="margin: 8px 0 0 0; color: #14532d;">Provide 2-3 realistic scenarios that employees might encounter. Show both correct and incorrect approaches to help employees understand practical application.</p>
      </div>

      <div style="background: white; padding: 16px; border-radius: 6px; margin: 12px 0;">
        <strong style="color: #6366f1;">[CLAUDE - Generate Scenario Examples]</strong>
        <code style="display: block; background: #f9fafb; padding: 12px; border-radius: 4px; font-size: 13px; color: #1f2937; margin-top: 8px;">
          "Create 3 realistic workplace scenarios that illustrate this policy in action. For each: 1) describe the situation, 2) explain the correct response, 3) note common mistakes to avoid. Make them relatable and practical. Here's the policy: [paste policy]"
        </code>
      </div>
    </div>`;

    // Quick Reference Section
    template += `<div style="background: #f3f4f6; border-left: 4px solid #6b7280; padding: 20px; margin-bottom: 24px; border-radius: 8px;">
      <h2 style="margin: 0 0 12px 0; color: #581c87; font-size: 20px;">📌 Quick Reference</h2>

      <div style="background: white; padding: 16px; border-radius: 6px; margin: 12px 0;">
        <strong style="color: #059669;">[VISUAL - Add Reference Table]</strong>
        <p style="margin: 8px 0 0 0; color: #581c87;">Create a one-page quick reference chart with:</p>
        <ul style="margin: 8px 0; padding-left: 24px; color: #581c87;">
          <li>Key contacts and phone numbers</li>
          <li>Common forms and where to find them</li>
          <li>Decision tree for common situations</li>
          <li>Important deadlines or timeframes</li>
        </ul>
      </div>
    </div>`;

    template += `<div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin-top: 24px;">
      <p style="margin: 0; color: #4b5563; font-size: 14px;"><strong>Next Steps:</strong> Complete each section following the prompts. Consider having legal or HR review policies before finalizing. Add version control and review dates.</p>
    </div>`;

    template += `</div>`;
    return template;
  },
};

/**
 * Non-Fiction Writing Template
 * For articles, guides, memoirs, and informational writing
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

    let template = `<div style="font-family: Inter, system-ui, sans-serif; line-height: 1.8; max-width: 800px; margin: 0 auto; padding: 20px;">`;

    template += `<div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 24px; border-radius: 12px; margin-bottom: 32px;">
      <h1 style="margin: 0 0 8px 0; font-size: 28px;">📝 General Content Enhancement Template</h1>
      <p style="margin: 0; opacity: 0.95; font-size: 14px;">Improve clarity, engagement, and readability of your content.</p>
    </div>`;

    // Introduction Section
    template += `<div style="background: #dbeafe; border-left: 4px solid #3b82f6; padding: 20px; margin-bottom: 24px; border-radius: 8px;">
      <h2 style="margin: 0 0 12px 0; color: #1e40af; font-size: 20px;">🎯 Introduction & Hook</h2>

      <div style="background: white; padding: 16px; border-radius: 6px; margin: 12px 0;">
        <strong style="color: #7c2d12;">[WRITER - Engaging Opening]</strong>
        <p style="margin: 8px 0 0 0; color: #1e3a8a;">Start with a compelling hook: a question, surprising fact, relatable scenario, or bold statement. Clearly state what the reader will learn and why it matters to them.</p>
      </div>

      <div style="background: white; padding: 16px; border-radius: 6px; margin: 12px 0;">
        <strong style="color: #6366f1;">[CLAUDE - Craft Attention-Grabbing Opening]</strong>
        <code style="display: block; background: #f9fafb; padding: 12px; border-radius: 4px; font-size: 13px; color: #1f2937; margin-top: 8px;">
          "Write an engaging 2-3 sentence introduction for this content that hooks the reader immediately. Include either: a thought-provoking question, a surprising statistic, or a relatable problem. Then clearly state the benefit of reading. Topic: [paste topic/summary]"
        </code>
      </div>
    </div>`;

    // Main Content Section
    template += `<div style="background: #f3e8ff; border-left: 4px solid #9333ea; padding: 20px; margin-bottom: 24px; border-radius: 8px;">
      <h2 style="margin: 0 0 12px 0; color: #374151; font-size: 20px;">📚 Main Content & Key Points</h2>

      <div style="background: white; padding: 16px; border-radius: 6px; margin: 12px 0;">
        <strong style="color: #7c2d12;">[WRITER - Structure Your Content]</strong>
        <p style="margin: 8px 0 0 0; color: #581c87;">Break content into 3-5 main sections with clear subheadings. Each section should cover one key idea. Use short paragraphs (3-4 sentences max) and bullet points for scannability.</p>
      </div>

      <div style="background: white; padding: 16px; border-radius: 6px; margin: 12px 0;">
        <strong style="color: #6366f1;">[CLAUDE - Create Content Outline]</strong>
        <code style="display: block; background: #f9fafb; padding: 12px; border-radius: 4px; font-size: 13px; color: #1f2937; margin-top: 8px;">
          "Create a logical outline for this content with 3-5 main sections. For each section: 1) suggest a clear subheading, 2) list 2-3 key points to cover, 3) recommend one supporting element (example, statistic, or story). Here's the content: [paste draft]"
        </code>
      </div>
    </div>`;

    // Examples & Clarity Section
    template += `<div style="background: #dcfce7; border-left: 4px solid #16a34a; padding: 20px; margin-bottom: 24px; border-radius: 8px;">
      <h2 style="margin: 0 0 12px 0; color: #166534; font-size: 20px;">💡 Examples & Practical Application</h2>

      <div style="background: white; padding: 16px; border-radius: 6px; margin: 12px 0;">
        <strong style="color: #7c2d12;">[WRITER - Add Concrete Examples]</strong>
        <p style="margin: 8px 0 0 0; color: #14532d;">For each main concept, provide a real-world example or analogy. Use "For instance..." or "Imagine..." to introduce examples. Make abstract ideas concrete and relatable.</p>
      </div>

      <div style="background: white; padding: 16px; border-radius: 6px; margin: 12px 0;">
        <strong style="color: #6366f1;">[CLAUDE - Generate Examples]</strong>
        <code style="display: block; background: #f9fafb; padding: 12px; border-radius: 4px; font-size: 13px; color: #1f2937; margin-top: 8px;">
          "For this concept, create 2-3 concrete examples that make it immediately understandable. Use everyday situations, analogies, or scenarios. Make sure examples are diverse and relatable to different audiences. Here's the concept: [paste concept explanation]"
        </code>
      </div>
    </div>`;

    // Visual Elements Section
    template += `<div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin-bottom: 24px; border-radius: 8px;">
      <h2 style="margin: 0 0 12px 0; color: #92400e; font-size: 20px;">🎨 Visual Enhancement</h2>

      <div style="background: white; padding: 16px; border-radius: 6px; margin: 12px 0;">
        <strong style="color: #059669;">[VISUAL - Add Supporting Visuals]</strong>
        <p style="margin: 8px 0 0 0; color: #78350f;">Consider adding:</p>
        <ul style="margin: 8px 0; padding-left: 24px; color: #78350f;">
          <li>Infographics summarizing key data</li>
          <li>Photos or illustrations showing examples</li>
          <li>Simple diagrams explaining processes</li>
          <li>Pull quotes highlighting important points</li>
          <li>Icons to break up text and mark sections</li>
        </ul>
      </div>
    </div>`;

    // Conclusion Section
    template += `<div style="background: #e0e7ff; border-left: 4px solid #6366f1; padding: 20px; margin-bottom: 24px; border-radius: 8px;">
      <h2 style="margin: 0 0 12px 0; color: #3730a3; font-size: 20px;">🎬 Conclusion & Next Steps</h2>

      <div style="background: white; padding: 16px; border-radius: 6px; margin: 12px 0;">
        <strong style="color: #7c2d12;">[WRITER - Strong Closing]</strong>
        <p style="margin: 8px 0 0 0; color: #312e81;">Summarize the 1-3 most important takeaways. End with a clear call-to-action or next step for the reader. What should they do with this information?</p>
      </div>

      <div style="background: white; padding: 16px; border-radius: 6px; margin: 12px 0;">
        <strong style="color: #6366f1;">[CLAUDE - Create Actionable Conclusion]</strong>
        <code style="display: block; background: #f9fafb; padding: 12px; border-radius: 4px; font-size: 13px; color: #1f2937; margin-top: 8px;">
          "Write a compelling conclusion that: 1) summarizes the key takeaways in 2-3 sentences, 2) provides a specific, actionable next step, 3) leaves the reader feeling motivated. Here's the content: [paste main points]"
        </code>
      </div>
    </div>`;

    if (cognitiveLoad < 70) {
      template += `<div style="background: #fee2e2; border-left: 4px solid #ef4444; padding: 20px; margin-bottom: 24px; border-radius: 8px;">
        <h2 style="margin: 0 0 12px 0; color: #991b1b; font-size: 20px;">⚠️ Readability Check (Cognitive Load: ${Math.round(
          cognitiveLoad
        )}/100)</h2>
        <p style="margin: 0; color: #7f1d1d;">Your content may be too dense. Consider: breaking long paragraphs, using more headings, adding white space, simplifying complex sentences, and including more examples.</p>
      </div>`;
    }

    template += `<div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin-top: 24px;">
      <p style="margin: 0; color: #4b5563; font-size: 14px;"><strong>Next Steps:</strong> Work through each section systematically. Use the [CLAUDE] prompts for AI assistance. Add visuals where marked. Review for clarity and flow before publishing.</p>
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
  employeeManualTemplate, // Employee Manual / Training
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

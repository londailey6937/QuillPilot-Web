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
 * Academic Educational Content Template
 * Focused on learning principles (spacing, dual coding)
 */
const academicTemplate: Template = {
  id: "academic",
  name: "Academic/Educational Content",
  description:
    "For textbooks, courses, and educational materials with learning principle optimization",
  icon: "📚",
  category: "academic",
  generateTemplate: (analysis, chapterText) => {
    const spacingScore =
      analysis.principles?.find((p: any) => p.principle === "spacedRepetition")
        ?.score || 0;
    const dualCodingScore =
      analysis.principles?.find((p: any) => p.principle === "dualCoding")
        ?.score || 0;

    let template = `<div style="font-family: Inter, system-ui, sans-serif; line-height: 1.8; max-width: 800px; margin: 0 auto; padding: 20px;">`;

    template += `<div style="background: linear-gradient(135deg, #4b5563 0%, #374151 100%); color: white; padding: 24px; border-radius: 12px; margin-bottom: 32px;">
      <h1 style="margin: 0 0 8px 0; font-size: 28px;">📚 Academic Content Enhancement Template</h1>
      <p style="margin: 0; opacity: 0.95; font-size: 14px;">This template helps optimize your educational content for better learning outcomes.</p>
    </div>`;

    // Spacing Analysis Section
    if (spacingScore < 70) {
      template += `<div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin-bottom: 24px; border-radius: 8px;">
        <h2 style="margin: 0 0 12px 0; color: #92400e; font-size: 20px;">⏰ Spacing & Repetition (Score: ${Math.round(
          spacingScore
        )}/100)</h2>

        <div style="background: white; padding: 16px; border-radius: 6px; margin: 12px 0;">
          <strong style="color: #7c2d12;">[WRITER - Add Concept Reviews]</strong>
          <p style="margin: 8px 0 0 0; color: #78350f;">Review your chapter and identify 3-5 key concepts that need better spacing. Add brief review sections that revisit these concepts at expanding intervals (e.g., after 2 pages, then 5 pages, then 10 pages).</p>
        </div>

        <div style="background: white; padding: 16px; border-radius: 6px; margin: 12px 0;">
          <strong style="color: #6366f1;">[CLAUDE - Generate Spaced Review Questions]</strong>
          <p style="margin: 8px 0; color: #78350f; font-style: italic;">Prompt to use with Claude:</p>
          <code style="display: block; background: #f9fafb; padding: 12px; border-radius: 4px; font-size: 13px; color: #1f2937;">
            "Based on this educational content, generate 5 review questions that revisit key concepts at strategic intervals. Include: 1) immediate recall, 2) delayed review (after new material), 3) application question, 4) integration with previous concepts, and 5) real-world connection. Here's the content: [paste relevant section]"
          </code>
        </div>
      </div>`;
    }

    // Dual Coding Section
    if (dualCodingScore < 70) {
      template += `<div style="background: #dbeafe; border-left: 4px solid #3b82f6; padding: 20px; margin-bottom: 24px; border-radius: 8px;">
        <h2 style="margin: 0 0 12px 0; color: #1e40af; font-size: 20px;">🎨 Visual Content (Score: ${Math.round(
          dualCodingScore
        )}/100)</h2>

        <div style="background: white; padding: 16px; border-radius: 6px; margin: 12px 0;">
          <strong style="color: #059669;">[VISUAL - Add Diagrams]</strong>
          <p style="margin: 8px 0 0 0; color: #1e3a8a;">Consider adding visual elements:</p>
          <ul style="margin: 8px 0; padding-left: 24px; color: #1e3a8a;">
            <li>Concept maps showing relationships between ideas</li>
            <li>Process diagrams with step-by-step flows</li>
            <li>Comparison tables for contrasting concepts</li>
            <li>Annotated examples with callouts</li>
          </ul>
        </div>

        <div style="background: white; padding: 16px; border-radius: 6px; margin: 12px 0;">
          <strong style="color: #6366f1;">[CLAUDE - Suggest Visual Placements]</strong>
          <p style="margin: 8px 0; color: #1e3a8a; font-style: italic;">Prompt to use with Claude:</p>
          <code style="display: block; background: #f9fafb; padding: 12px; border-radius: 4px; font-size: 13px; color: #1f2937;">
            "Analyze this educational content and suggest 3-5 specific locations where visual aids would enhance understanding. For each suggestion, specify: 1) the concept being explained, 2) the type of visual (diagram, chart, illustration, etc.), 3) what the visual should show, and 4) why it would help learning. Here's the content: [paste relevant section]"
          </code>
        </div>
      </div>`;
    }

    template += `<div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin-top: 24px;">
      <p style="margin: 0; color: #4b5563; font-size: 14px;"><strong>Next Steps:</strong> Fill in the [WRITER] sections directly, or copy the [CLAUDE] prompts to use with Claude AI for assistance. Add visuals where [VISUAL] tags appear.</p>
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
 * General Content Template
 * Flexible structure for articles, guides, and general writing
 */
const generalContentTemplate: Template = {
  id: "general",
  name: "General Content",
  description: "For articles, blog posts, guides, and general-purpose writing",
  icon: "📝",
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
  academicTemplate,
  employeeManualTemplate,
  generalContentTemplate,
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

/**
 * Claude AI Integration
 *
 * Handles communication with Claude API to automatically fill in template prompts
 */

export interface ClaudeConfig {
  apiKey: string;
  model?: string;
  maxTokens?: number;
}

export interface ClaudePrompt {
  id: string;
  prompt: string;
  context: string;
  placeholder: string;
}

/**
 * Extract [CLAUDE] prompts from template HTML
 */
export function extractClaudePrompts(templateHtml: string): ClaudePrompt[] {
  const prompts: ClaudePrompt[] = [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(templateHtml, "text/html");

  // Find all code blocks with Claude prompts
  const codeBlocks = doc.querySelectorAll("code");

  codeBlocks.forEach((code, index) => {
    const text = code.textContent || "";
    // Check if this is a Claude prompt (contains instructions for Claude)
    if (text.includes("[paste") || text.includes("Here's the")) {
      // Find the parent context (usually in a <strong> tag before the code)
      const parent = code.parentElement;
      const prevStrong = parent?.querySelector("strong");
      const label = prevStrong?.textContent || "";

      if (label.includes("[CLAUDE")) {
        prompts.push({
          id: `claude-prompt-${index}`,
          prompt: text.trim(),
          context: label,
          placeholder: code.outerHTML,
        });
      }
    }
  });

  return prompts;
}

/**
 * Call Claude API with a prompt
 */
export async function callClaudeAPI(
  prompt: string,
  config: ClaudeConfig
): Promise<string> {
  const {
    apiKey,
    model = "claude-3-5-sonnet-20241022",
    maxTokens = 1024,
  } = config;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Claude API request failed");
    }

    const data = await response.json();
    return data.content[0].text;
  } catch (error) {
    console.error("Claude API error:", error);
    throw error;
  }
}

/**
 * Process all Claude prompts in a template
 */
export async function processClaudePrompts(
  templateHtml: string,
  contentContext: string,
  config: ClaudeConfig,
  onProgress?: (current: number, total: number) => void
): Promise<string> {
  const prompts = extractClaudePrompts(templateHtml);

  if (prompts.length === 0) {
    return templateHtml;
  }

  let updatedHtml = templateHtml;

  for (let i = 0; i < prompts.length; i++) {
    const prompt = prompts[i];

    // Notify progress
    if (onProgress) {
      onProgress(i + 1, prompts.length);
    }

    try {
      // Replace the placeholder text in the prompt with actual content
      const fullPrompt = prompt.prompt.replace(
        /\[paste[^\]]*\]/gi,
        contentContext.substring(0, 2000) // Limit context to avoid token limits
      );

      // Call Claude API
      const response = await callClaudeAPI(fullPrompt, config);

      // Replace the code block with the response
      const responseHtml = `<div style="background: #f0fdf4; border: 2px solid #10b981; padding: 16px; border-radius: 8px; margin: 12px 0;">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
          <span style="font-size: 20px;">🤖</span>
          <strong style="color: #059669;">AI Generated Content</strong>
        </div>
        <div style="color: #166534; line-height: 1.6;">
          ${response.replace(/\n/g, "<br>")}
        </div>
      </div>`;

      // Replace the code block in the HTML
      updatedHtml = updatedHtml.replace(prompt.placeholder, responseHtml);
    } catch (error) {
      console.error(`Error processing prompt ${i + 1}:`, error);
      // Leave the original prompt in place if there's an error
      const errorHtml = `<div style="background: #fef2f2; border: 2px solid #ef4444; padding: 16px; border-radius: 8px; margin: 12px 0;">
        <strong style="color: #991b1b;">⚠️ AI Generation Failed</strong>
        <p style="margin: 8px 0 0 0; color: #7f1d1d; font-size: 13px;">
          ${error instanceof Error ? error.message : "Unknown error"}
        </p>
      </div>`;
      updatedHtml = updatedHtml.replace(prompt.placeholder, errorHtml);
    }

    // Add a small delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  return updatedHtml;
}

/**
 * Get stored Claude API key
 */
export function getStoredClaudeKey(): string | null {
  return localStorage.getItem("tomeiq_claude_api_key");
}

/**
 * Store Claude API key
 */
export function storeClaudeKey(apiKey: string): void {
  localStorage.setItem("tomeiq_claude_api_key", apiKey);
}

/**
 * Clear stored Claude API key
 */
export function clearClaudeKey(): void {
  localStorage.removeItem("tomeiq_claude_api_key");
}

/**
 * Validate Claude API key format
 */
export function validateClaudeKey(apiKey: string): boolean {
  // Claude API keys start with "sk-ant-"
  return apiKey.startsWith("sk-ant-") && apiKey.length > 20;
}

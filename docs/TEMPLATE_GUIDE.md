# Template Library & AI Integration Guide

## Overview

The Template Library provides 20+ pre-built templates for educational content creation, with optional AI-powered content generation using Claude API.

## What Are Templates?

Templates are structured documents with placeholder prompts that help you create different types of educational content:

- **Case Studies** - Problem-based learning scenarios
- **Lab Instructions** - Step-by-step experimental procedures
- **Lesson Plans** - Complete teaching session structures
- **Practice Problems** - Exercise sets with solutions
- **Study Guides** - Comprehensive review materials
- **Tutorial Articles** - How-to guides and explanations
- **And more...**

## How to Use Templates

### 1. Access Templates

1. Open the application
2. Click **"📝 Insert Template"** button (Writer Mode - Professional tier only)
3. Browse templates by category or search by name

### 2. Select a Template

Templates are organized by category:

- **Educational** - Lesson plans, study guides, flashcards
- **Technical** - API docs, troubleshooting guides, tutorials
- **Creative** - Case studies, scenarios, reflections
- **Assessment** - Practice problems, rubrics, quizzes

Click on any template to preview its structure and prompts.

### 3. Understanding Prompt Types

Templates contain three types of prompts:

#### `[WRITER]` - Manual Entry

```
[WRITER] Describe the learning objectives for this lesson
```

- **You write the content** - Type directly into these sections
- **Full creative control** - No AI assistance
- **Best for**: Specific details only you know

#### `[CLAUDE]` - AI-Generated (Requires API Key)

```
[CLAUDE] Generate 5 practice problems for quadratic equations
```

- **Claude AI fills this in** - Automatic content generation
- **Requires**: Claude API key (see setup below)
- **Best for**: Examples, explanations, problem sets

#### `[VISUAL]` - Placeholder for Diagrams

```
[VISUAL] Insert diagram showing photosynthesis process
```

- **Reminder to add visuals** - You'll add images/diagrams later
- **Not automated** - Requires manual image upload
- **Best for**: Charts, diagrams, illustrations

### 4. Fill in the Template

**Option A: Manual Mode (No API Key)**

1. Read each prompt
2. Replace prompt text with your content
3. Delete the prompt brackets when done

**Option B: AI-Assisted Mode (With Claude API Key)**

1. Set up Claude API key (see below)
2. Click **"🤖 Auto-fill with AI"** button
3. Claude processes all `[CLAUDE]` prompts automatically
4. Review and edit AI-generated content
5. Fill in remaining `[WRITER]` prompts manually

## Claude API Setup

### Why Use Claude?

Claude can automatically generate:

- Practice problems with solutions
- Example scenarios and case studies
- Explanations and definitions
- Step-by-step procedures
- Assessment rubrics
- Discussion questions

### Getting Your API Key

1. **Create Anthropic Account**

   - Go to https://console.anthropic.com/
   - Sign up for an account
   - Add payment method (pay-as-you-go)

2. **Generate API Key**

   - Navigate to "API Keys" section
   - Click "Create Key"
   - Copy the key (starts with `sk-ant-...`)
   - **Keep it secure** - Never share or commit to git

3. **Add to Application**

   - In Tome IQ, click your profile icon
   - Select "Settings" or "API Keys"
   - Paste your Claude API key
   - Click "Save"

   **Alternative**: Add to `.env` file:

   ```bash
   VITE_CLAUDE_API_KEY=sk-ant-your-api-key-here
   ```

### Cost Information

Claude API pricing (as of November 2025):

- **Claude 3.5 Sonnet**: ~$3 per million input tokens
- **Average template**: 500-2000 tokens (~$0.001-0.006 per template)
- **Typical usage**: $1-5 per month for regular use

**Tips to minimize costs**:

- Use AI only for `[CLAUDE]` prompts (not everything)
- Review and edit rather than regenerating
- Fill `[WRITER]` prompts manually for specific content

### Troubleshooting Claude Integration

#### "API Key Invalid" Error

- Verify key starts with `sk-ant-`
- Check for extra spaces when pasting
- Ensure billing is set up in Anthropic Console

#### "Rate Limit Exceeded" Error

- You've hit your API quota
- Wait a few minutes and try again
- Check your usage limits in Anthropic Console

#### AI-Generated Content is Off-Topic

- Templates include context automatically
- Try rephrasing the `[CLAUDE]` prompt
- Add more specific details to the prompt

#### No AI Button Appears

- Verify you're on **Professional tier**
- Check that template contains `[CLAUDE]` prompts
- Ensure API key is saved in settings

## Template Examples

### Example 1: Case Study Template

```html
<h1>[WRITER] Case Study Title</h1>

<h2>Background</h2>
<p>
  [CLAUDE] Create a realistic scenario for a business case study involving
  supply chain management challenges
</p>

<h2>Visual Context</h2>
<p>[VISUAL] Insert org chart or supply chain diagram here</p>

<h2>Key Questions</h2>
<ul>
  <li>[WRITER] What specific decision must be made?</li>
  <li>[CLAUDE] Generate 3 analysis questions for this scenario</li>
</ul>
```

**Result after AI processing**:

- `[WRITER]` prompts remain for you to fill
- `[CLAUDE]` prompts are replaced with generated content
- `[VISUAL]` prompts remain as reminders

### Example 2: Practice Problems Template

```html
<h1>Practice Problem Set: [WRITER] Topic Name</h1>

<h2>Easy Problems</h2>
<p>[CLAUDE] Generate 3 basic problems for introduction to derivatives</p>

<h2>Medium Problems</h2>
<p>[CLAUDE] Generate 3 moderate problems requiring chain rule</p>

<h2>Challenge Problems</h2>
<p>[WRITER] Add your custom challenge problem here</p>
```

## Creating Custom Templates

### Template Structure

Templates are HTML documents with special prompt markers:

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Your Template Name</title>
  </head>
  <body>
    <h1>[WRITER] Main Title</h1>

    <section>
      <h2>Section Title</h2>
      <p>[CLAUDE] AI prompt goes here with clear instructions</p>
    </section>

    <div class="visual-placeholder">[VISUAL] Description of diagram needed</div>
  </body>
</html>
```

### Adding Your Template

1. **Create the Template File**

   ```typescript
   // src/utils/templateLibrary.ts

   {
     id: "my-custom-template",
     name: "My Custom Template",
     category: "Educational",
     description: "Brief description of what this creates",
     content: `<h1>[WRITER] Title</h1>...`
   }
   ```

2. **Add to Template Library**

   - Edit `src/utils/templateLibrary.ts`
   - Add your template object to `TEMPLATE_LIBRARY` array
   - Use existing templates as examples

3. **Test Your Template**
   - Reload application
   - Look for your template in the template selector
   - Test with and without Claude API

### Template Best Practices

**DO**:

- ✅ Use clear, specific `[CLAUDE]` prompts
- ✅ Provide context in prompts ("Generate 5 problems for algebra students")
- ✅ Use `[WRITER]` for content requiring personal knowledge
- ✅ Add `[VISUAL]` reminders where diagrams enhance understanding
- ✅ Include example content as comments

**DON'T**:

- ❌ Make `[CLAUDE]` prompts too vague ("write something here")
- ❌ Expect AI to know your specific context without details
- ❌ Use `[CLAUDE]` for highly personal or proprietary content
- ❌ Forget to review and edit AI-generated content

## Template Categories

### Educational Templates

- **Lesson Plan** - Complete teaching session
- **Study Guide** - Review materials with objectives
- **Flashcard Set** - Question/answer pairs
- **Concept Map Template** - Visual relationship builder

### Technical Templates

- **API Documentation** - Endpoint reference guide
- **Tutorial Article** - Step-by-step how-to
- **Troubleshooting Guide** - Problem/solution format
- **Code Review Checklist** - Quality assurance guide

### Assessment Templates

- **Multiple Choice Quiz** - Questions with distractors
- **Practice Problem Set** - Exercises with solutions
- **Rubric Builder** - Grading criteria matrix
- **Self-Assessment** - Reflection prompts

### Creative Templates

- **Case Study** - Scenario-based analysis
- **Real-World Application** - Practical examples
- **Thought Experiment** - Hypothetical scenarios

## Workflow Integration

### Complete Template Workflow

1. **Start with Template** → Insert template for structure
2. **AI Generation** → Auto-fill `[CLAUDE]` prompts (optional)
3. **Manual Editing** → Fill `[WRITER]` sections with specific details
4. **Add Visuals** → Upload images at `[VISUAL]` markers
5. **Run Analysis** → Check educational quality
6. **Refine** → Improve based on analysis feedback
7. **Export** → Download as HTML or DOCX

### Tips for Best Results

**Before Using AI**:

- Have a clear topic in mind
- Know your audience level (beginner, intermediate, advanced)
- Gather any specific examples or data you want included

**While Editing**:

- Review all AI-generated content for accuracy
- Add your personal insights and examples
- Customize to your teaching style
- Check for appropriate difficulty level

**After Analysis**:

- Use spacing analysis to break up dense sections
- Add visuals where dual-coding suggests them
- Improve concept sequencing based on recommendations

## Keyboard Shortcuts (Writer Mode)

- `Cmd/Ctrl + K` - Insert link
- `Cmd/Ctrl + B` - Bold text
- `Cmd/Ctrl + I` - Italic text
- `Cmd/Ctrl + U` - Underline
- `Cmd/Ctrl + Z` - Undo
- `Cmd/Ctrl + Shift + Z` - Redo

## Frequently Asked Questions

**Q: Do I need a Claude API key to use templates?**
A: No! Templates work fine without AI. `[CLAUDE]` prompts become manual `[WRITER]` prompts.

**Q: How much does Claude API cost?**
A: Typically $0.001-0.006 per template fill. Most users spend $1-5/month.

**Q: Can I use ChatGPT instead of Claude?**
A: Currently only Claude is supported. OpenAI integration may be added later.

**Q: Will AI-generated content be perfect?**
A: No - always review and edit. AI provides a strong starting point, not final copy.

**Q: Can I save my edited templates?**
A: Yes! Use the regular save/export features after editing.

**Q: Are templates included in all tiers?**
A: Templates are **Professional tier only**. Free and Premium tiers can use standard document editing.

**Q: Can I share templates with colleagues?**
A: Yes! Export as HTML or DOCX and share like any document.

**Q: What if Claude generates incorrect information?**
A: Always verify content, especially for technical/scientific topics. AI can make mistakes.

## Next Steps

1. ✅ Set up Claude API key (optional but recommended)
2. ✅ Browse template library to see what's available
3. ✅ Try a simple template (like Practice Problems)
4. ✅ Review AI output and make edits
5. ✅ Run analysis to check educational quality
6. ✅ Export and use in your teaching

## Support

**Need help?**

- Check `docs/REFERENCE_LIBRARY.md` for full feature documentation
- Review `docs/00_START_HERE.md` for basic usage
- Contact support if issues persist

**Want to contribute templates?**

- Create template following the structure above
- Submit via GitHub pull request
- Include description and sample output

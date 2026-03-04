# AI Feedback Analyzer

Takes raw text feedback, sends it to Claude, and returns structured themes and prioritized action points.

## Setup

```bash
npm install
cp .env.example .env
# Add your ANTHROPIC_API_KEY to .env
```

## Usage

**Inline text:**
```bash
node index.js "Loading times are terrible. The new UI looks great though. Support never responds."
```

**From a file:**
```bash
node index.js --file feedback.txt
```

**From stdin (pipe):**
```bash
cat feedback.txt | node index.js
```

**JSON output** (for piping into other tools):
```bash
node index.js --file feedback.txt --json
```

**Demo:**
```bash
npm run analyze:demo
```

## Output

The analyzer returns three sections:

- **Summary** — A brief overall characterization of the feedback
- **Themes** — Recurring topics with sentiment (`positive/negative/neutral/mixed`), frequency (`high/medium/low`), and quoted examples
- **Action Points** — Prioritized (`high/medium/low`) actions with rationale and the theme they address

JSON shape:
```json
{
  "summary": "string",
  "themes": [
    {
      "name": "string",
      "description": "string",
      "sentiment": "positive | negative | neutral | mixed",
      "frequency": "high | medium | low",
      "examples": ["string"]
    }
  ],
  "action_points": [
    {
      "priority": "high | medium | low",
      "action": "string",
      "rationale": "string",
      "related_theme": "string"
    }
  ]
}
```

## Extending with New Data Sources

Create a class extending `FeedbackSource` in `src/sources/`:

```js
import { FeedbackSource } from './base.js';

export class DatabaseSource extends FeedbackSource {
  constructor(query) {
    super();
    this._query = query;
  }

  async load() {
    const rows = await db.query(this._query);
    return rows.map(r => r.feedback_text).join('\n---\n');
  }

  get name() { return 'database'; }
}
```

Then use it in `index.js` or call `analyzeFeedback()` directly from your own code:

```js
import { analyzeFeedback } from './src/analyzers/feedbackAnalyzer.js';

const result = await analyzeFeedback(feedbackText);
console.log(result.action_points);
```

## Project Structure

```
src/
  analyzers/feedbackAnalyzer.js  # Core logic — calls Claude, returns structured result
  services/llm.js                # Anthropic client singleton
  sources/
    base.js                      # Abstract FeedbackSource (extend to add new inputs)
    text.js                      # TextSource, FileSource, stdin reader
  utils/prompt.js                # Prompt template
index.js                         # CLI entry point
```

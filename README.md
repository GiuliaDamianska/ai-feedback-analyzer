# AI Feedback Analyzer

Analyzes B2B customer feedback entirely on your machine. Paste in raw feedback — interview notes, support tickets, survey responses — and get back structured themes and prioritized action points. No data leaves your machine, no API costs, no internet required.

## Why Local-First

- **Customer data stays on your machine** — B2B feedback often contains commercially sensitive information. Running locally means it never touches a third-party server.
- **No per-token costs** — Run analyses as many times as you like, on as much feedback as you have, for free.
- **Works offline** — No dependency on external API availability or rate limits.
- **Ideal for sensitive feedback** — Safe to use with NDA-covered accounts, pre-release product feedback, or internal escalations.

## Built With

- [Node.js](https://nodejs.org) — Runtime
- [Ollama](https://ollama.com) — Local LLM server
- [Qwen 3 8B](https://ollama.com/library/qwen3) — The model doing the analysis
- [Claude Code CLI](https://claude.ai/code) — Used to build this tool

## Setup

```bash
# 1. Pull the model and start Ollama
ollama pull qwen3:8b
ollama serve

# 2. Install dependencies
npm install
cp .env.example .env
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
  analyzers/feedbackAnalyzer.js  # Core logic — calls Ollama, returns structured result
  services/llm.js                # Ollama HTTP client (fetch-based, no SDK)
  sources/
    base.js                      # Abstract FeedbackSource (extend to add new inputs)
    text.js                      # TextSource, FileSource, stdin reader
  utils/prompt.js                # Prompt template
index.js                         # CLI entry point
```

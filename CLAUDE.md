# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install               # Install dependencies
node index.js "text"      # Analyze inline feedback text
node index.js --file feedback.txt  # Analyze a file
echo "text" | node index.js        # Analyze from stdin
node index.js --json      # Output raw JSON
npm run analyze:demo      # Run with built-in demo text
```

Ollama must be running locally before use:
```bash
ollama pull qwen3:8b
ollama serve
```

## Architecture

This is an ES module Node.js project (`"type": "module"`). The flow is: **source → analyzer → LLM → structured output**.

```
index.js                        CLI: parses args, picks a source, calls analyzeFeedback(), prints
src/
  services/llm.js               Ollama HTTP client; exports chat(), MODEL, OLLAMA_BASE_URL
  utils/prompt.js               Single prompt builder function — edit here to change analysis behavior
  analyzers/feedbackAnalyzer.js Core logic: calls chat() with JSON schema, parses and returns result
  sources/
    base.js                     Abstract FeedbackSource class — extend to add new input types
    text.js                     TextSource (inline), FileSource (file path), readStdin() helper
```

## Key Design Decisions

**Structured outputs** — `feedbackAnalyzer.js` passes `ANALYSIS_SCHEMA` (a JSON schema object) as the `format` field to Ollama's `/api/chat`. Ollama enforces the schema at the grammar level, so the response is always valid JSON matching the schema. No regex or prompt-engineering needed.

**No SDK dependencies** — Uses Node's built-in `fetch` to call Ollama's REST API. The only runtime dependency is `dotenv`.

**Extensible sources** — To add a new data source (CSV, database, API), extend `FeedbackSource` from `src/sources/base.js`. Only two things required: implement `async load()` and override the `name` getter.

## Configuration

`OLLAMA_BASE_URL` (default: `http://localhost:11434`) and `OLLAMA_MODEL` (default: `qwen3:8b`) can be overridden in `.env` or as environment variables.

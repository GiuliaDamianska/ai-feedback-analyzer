export function buildFeedbackPrompt(feedbackText) {
  return `Analyze the following customer feedback. Identify recurring themes, their sentiment, and concrete action points that the team should prioritize.

Be specific: quote or paraphrase actual phrases from the feedback when citing examples. Prioritize action points by business impact.

Feedback:
---
${feedbackText}
---`;
}

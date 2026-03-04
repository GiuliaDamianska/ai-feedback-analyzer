import { chat } from '../services/llm.js';
import { buildFeedbackPrompt } from '../utils/prompt.js';

// Defines the shape of the structured response from the model.
// Update this schema to change what the analyzer extracts.
const ANALYSIS_SCHEMA = {
  type: 'object',
  properties: {
    summary: {
      type: 'string',
      description: 'A concise overall summary of the feedback (2-3 sentences).',
    },
    themes: {
      type: 'array',
      description: 'Recurring themes identified across the feedback.',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Short label for the theme.' },
          description: { type: 'string', description: 'What this theme covers.' },
          sentiment: {
            type: 'string',
            enum: ['positive', 'negative', 'neutral', 'mixed'],
          },
          frequency: {
            type: 'string',
            enum: ['high', 'medium', 'low'],
            description: 'How often this theme appears in the feedback.',
          },
          examples: {
            type: 'array',
            items: { type: 'string' },
            description: 'Direct quotes or close paraphrases from the feedback.',
          },
        },
        required: ['name', 'description', 'sentiment', 'frequency', 'examples'],
        additionalProperties: false,
      },
    },
    action_points: {
      type: 'array',
      description: 'Specific, prioritized actions the team should take.',
      items: {
        type: 'object',
        properties: {
          priority: { type: 'string', enum: ['high', 'medium', 'low'] },
          action: { type: 'string', description: 'The concrete action to take.' },
          rationale: { type: 'string', description: 'Why this action matters.' },
          related_theme: {
            type: 'string',
            description: 'Name of the theme this action addresses.',
          },
        },
        required: ['priority', 'action', 'rationale', 'related_theme'],
        additionalProperties: false,
      },
    },
  },
  required: ['summary', 'themes', 'action_points'],
  additionalProperties: false,
};

/**
 * Analyze raw feedback text and return structured themes and action points.
 *
 * @param {string} feedbackText - The raw feedback to analyze.
 * @returns {Promise<{summary: string, themes: object[], action_points: object[]}>}
 */
export async function analyzeFeedback(feedbackText) {
  if (!feedbackText?.trim()) {
    throw new Error('Feedback text cannot be empty.');
  }

  const content = await chat({
    messages: [{ role: 'user', content: buildFeedbackPrompt(feedbackText) }],
    format: ANALYSIS_SCHEMA,
  });

  return JSON.parse(content);
}

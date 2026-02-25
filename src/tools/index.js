/**
 * Tools Module - Model Native Features
 * Exports tool schemas, validation, and prompt utilities
 */

const { FEEDBACK_TOOL_SCHEMA, HANDOFF_TOOL_SCHEMA } = require('./schemas');
const { validateToolInput, normalizeFeedbackInput } = require('./validation');
const {
  buildPromptMessages,
  identifyCacheableContent,
  SYSTEM_PROMPT_TEMPLATE,
  USER_PROMPT_TEMPLATE
} = require('./prompts');

module.exports = {
  // Schemas
  FEEDBACK_TOOL_SCHEMA,
  HANDOFF_TOOL_SCHEMA,
  // Validation
  validateToolInput,
  normalizeFeedbackInput,
  // Prompts
  buildPromptMessages,
  identifyCacheableContent,
  SYSTEM_PROMPT_TEMPLATE,
  USER_PROMPT_TEMPLATE
};

/**
 * Prompt Structure Utilities
 * Helpers for system/user prompt separation and caching
 */

const SYSTEM_PROMPT_TEMPLATE = {
  role: 'system',
  content: '[AGENT_SPEC]\n[GUARDRAILS]\n[TEMPLATES]',
  cache_control: { type: 'ephemeral' }
};

const USER_PROMPT_TEMPLATE = {
  role: 'user',
  content: '[TASK_INSTRUCTIONS]\n[INPUTS]\n[OUTPUTS]'
};

/**
 * Build prompt messages with system and user separation
 * @param {string} staticContent - Content for system prompt (agent specs, guardrails)
 * @param {string} dynamicContent - Content for user prompt (task instructions, inputs)
 * @returns {Array<Object>} Array of message objects
 */
function buildPromptMessages(staticContent, dynamicContent) {
  return [
    { ...SYSTEM_PROMPT_TEMPLATE, content: staticContent },
    { ...USER_PROMPT_TEMPLATE, content: dynamicContent }
  ];
}

/**
 * Identify if content should be cached (static, reusable content)
 * @param {string} content - Content to analyze
 * @returns {boolean} True if content is cacheable
 */
function identifyCacheableContent(content) {
  const cacheablePatterns = ['AGENT_', 'GUARDRAIL', 'TEMPLATE', 'SPEC.md'];
  return cacheablePatterns.some(p => content.includes(p));
}

module.exports = {
  SYSTEM_PROMPT_TEMPLATE,
  USER_PROMPT_TEMPLATE,
  buildPromptMessages,
  identifyCacheableContent
};

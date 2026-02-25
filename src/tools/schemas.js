/**
 * Tool Schema Definitions
 * Reusable schema constants for Claude tool use
 */

const FEEDBACK_TOOL_SCHEMA = {
  name: 'submit_feedback',
  description: 'Submit quality rating for prior stage',
  input_schema: {
    type: 'object',
    properties: {
      rating: { type: 'number', minimum: 1, maximum: 5 },
      issues: { type: 'array', items: { type: 'string' } },
      recommendation: { enum: ['proceed', 'pause', 'revise'] }
    },
    required: ['rating', 'issues', 'recommendation']
  }
};

const HANDOFF_TOOL_SCHEMA = {
  name: 'submit_handoff',
  description: 'Submit summary for next agent',
  input_schema: {
    type: 'object',
    properties: {
      from_agent: { type: 'string', enum: ['alex', 'cass', 'nigel', 'codey'] },
      to_agent: { type: 'string', enum: ['alex', 'cass', 'nigel', 'codey'] },
      summary: { type: 'string', maxLength: 500 },
      artifacts: { type: 'array', items: { type: 'string' } }
    },
    required: ['from_agent', 'to_agent', 'summary']
  }
};

module.exports = {
  FEEDBACK_TOOL_SCHEMA,
  HANDOFF_TOOL_SCHEMA
};

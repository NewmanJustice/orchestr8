/**
 * Tests for Model Native Features
 * Feature: Leverage Claude's native features (system prompts, tool use, prompt caching)
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const {
  FEEDBACK_TOOL_SCHEMA,
  HANDOFF_TOOL_SCHEMA,
  validateToolInput,
  buildPromptMessages,
  identifyCacheableContent
} = require('../src/tools');

// --- Tests ---

describe('Model Native Features', () => {

  describe('T01-T02: Feedback Tool Schema', () => {
    it('T01: has required properties', () => {
      const props = FEEDBACK_TOOL_SCHEMA.input_schema.properties;
      assert.ok(props.rating, 'Should have rating property');
      assert.ok(props.issues, 'Should have issues property');
      assert.ok(props.recommendation, 'Should have recommendation property');
    });

    it('T01: rating has correct constraints', () => {
      const rating = FEEDBACK_TOOL_SCHEMA.input_schema.properties.rating;
      assert.strictEqual(rating.type, 'number');
      assert.strictEqual(rating.minimum, 1);
      assert.strictEqual(rating.maximum, 5);
    });

    it('T02: validates valid feedback input', () => {
      const input = { rating: 4, issues: ['unclear-scope'], recommendation: 'proceed' };
      const result = validateToolInput(FEEDBACK_TOOL_SCHEMA, input);
      assert.ok(result.valid, `Should be valid: ${result.errors.join(', ')}`);
    });

    it('T02: rejects invalid rating', () => {
      const input = { rating: 6, issues: [], recommendation: 'proceed' };
      const result = validateToolInput(FEEDBACK_TOOL_SCHEMA, input);
      assert.ok(!result.valid);
      assert.ok(result.errors.some(e => e.includes('maximum')));
    });
  });

  describe('T03-T04: Handoff Tool Schema', () => {
    it('T03: has required properties', () => {
      const props = HANDOFF_TOOL_SCHEMA.input_schema.properties;
      assert.ok(props.from_agent, 'Should have from_agent');
      assert.ok(props.to_agent, 'Should have to_agent');
      assert.ok(props.summary, 'Should have summary');
    });

    it('T04: validates valid handoff input', () => {
      const input = { from_agent: 'alex', to_agent: 'cass', summary: 'Feature spec complete' };
      const result = validateToolInput(HANDOFF_TOOL_SCHEMA, input);
      assert.ok(result.valid);
    });

    it('T04: rejects invalid agent name', () => {
      const input = { from_agent: 'bob', to_agent: 'cass', summary: 'Test' };
      const result = validateToolInput(HANDOFF_TOOL_SCHEMA, input);
      assert.ok(!result.valid);
      assert.ok(result.errors.some(e => e.includes('from_agent')));
    });
  });

  describe('T05-T06: System/User Prompt Separation', () => {
    it('T05: system prompt accepts static content', () => {
      const staticContent = 'AGENT_SPECIFICATION_ALEX.md\nGUARDRAILS.md';
      const messages = buildPromptMessages(staticContent, 'Task here');
      assert.strictEqual(messages[0].role, 'system');
      assert.ok(messages[0].content.includes('AGENT_'));
    });

    it('T06: user prompt accepts dynamic content', () => {
      const dynamicContent = 'Create feature spec for user-auth\nInputs: requirements.md';
      const messages = buildPromptMessages('Static', dynamicContent);
      assert.strictEqual(messages[1].role, 'user');
      assert.ok(messages[1].content.includes('feature spec'));
    });
  });

  describe('T07-T08: Prompt Caching Structure', () => {
    it('T07: system prompt includes cache control', () => {
      const messages = buildPromptMessages('Static', 'Dynamic');
      assert.ok(messages[0].cache_control, 'Should have cache_control');
      assert.strictEqual(messages[0].cache_control.type, 'ephemeral');
    });

    it('T08: identifies cacheable content', () => {
      assert.ok(identifyCacheableContent('AGENT_SPECIFICATION.md'));
      assert.ok(identifyCacheableContent('GUARDRAILS content'));
      assert.ok(!identifyCacheableContent('Create feature for user-auth'));
    });
  });

  describe('T09-T11: Tool Response Validation', () => {
    it('T09: validates rating bounds', () => {
      const valid = validateToolInput(FEEDBACK_TOOL_SCHEMA, { rating: 1, issues: [], recommendation: 'proceed' });
      const invalid = validateToolInput(FEEDBACK_TOOL_SCHEMA, { rating: 0, issues: [], recommendation: 'proceed' });
      assert.ok(valid.valid);
      assert.ok(!invalid.valid);
    });

    it('T10: validates recommendation enum', () => {
      const valid = validateToolInput(FEEDBACK_TOOL_SCHEMA, { rating: 3, issues: [], recommendation: 'pause' });
      const invalid = validateToolInput(FEEDBACK_TOOL_SCHEMA, { rating: 3, issues: [], recommendation: 'skip' });
      assert.ok(valid.valid);
      assert.ok(!invalid.valid);
    });

    it('T11: validates issues array type', () => {
      const valid = validateToolInput(FEEDBACK_TOOL_SCHEMA, { rating: 3, issues: ['a'], recommendation: 'proceed' });
      const invalid = validateToolInput(FEEDBACK_TOOL_SCHEMA, { rating: 3, issues: 'not-array', recommendation: 'proceed' });
      assert.ok(valid.valid);
      assert.ok(!invalid.valid);
    });
  });

  describe('T12: Functional Equivalence', () => {
    it('T12: native approach produces same data as text parsing', () => {
      const textOutput = 'FEEDBACK: {"rating":4,"issues":["unclear"],"recommendation":"proceed"}';
      const toolOutput = { rating: 4, issues: ['unclear'], recommendation: 'proceed' };

      const parsed = JSON.parse(textOutput.match(/FEEDBACK:\s*(\{[^}]+\})/)[1]);
      assert.deepStrictEqual(parsed, toolOutput);
    });
  });
});

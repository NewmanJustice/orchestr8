# Implementation Plan - Model Native Features

## Summary

This feature extracts model-native constructs (tool schemas, prompt structure helpers) into reusable modules to improve token efficiency and output reliability. The implementation focuses on creating exportable tool schema definitions and prompt builder utilities that can be integrated into the pipeline's existing feedback and handoff systems.

## Files to Create/Modify

| Path | Action | Purpose |
|------|--------|---------|
| `src/tools/schemas.js` | Create | Define tool schemas for feedback and handoff |
| `src/tools/validation.js` | Create | Tool input validation utilities |
| `src/tools/prompts.js` | Create | System/user prompt structure builders |
| `src/tools/index.js` | Create | Module exports |
| `src/feedback.js` | Modify | Use schema validation from tools module |
| `src/handoff.js` | Modify | Add handoff tool schema support |
| `test/feature_model-native-features.test.js` | Modify | Import from implementation modules |

## Implementation Steps

1. **Create `src/tools/schemas.js`** - Define `FEEDBACK_TOOL_SCHEMA` and `HANDOFF_TOOL_SCHEMA` as exportable constants matching the test definitions. Include name, description, and input_schema with all property constraints.

2. **Create `src/tools/validation.js`** - Implement `validateToolInput(schema, input)` function that validates inputs against schema constraints (type checking, bounds, enums, required fields). Return `{ valid, errors }` format.

3. **Create `src/tools/prompts.js`** - Implement `buildPromptMessages(staticContent, dynamicContent)` returning array with system and user messages. Include `cache_control: { type: 'ephemeral' }` on system prompt. Add `identifyCacheableContent(content)` helper.

4. **Create `src/tools/index.js`** - Export all schemas, validation, and prompt utilities from single entry point.

5. **Update `src/feedback.js`** - Replace inline validation logic with imported `validateToolInput` using `FEEDBACK_TOOL_SCHEMA`. Maintain backward compatibility with existing `parseFeedbackFromOutput` function.

6. **Update `src/handoff.js`** - Add `validateHandoffToolInput` function using `HANDOFF_TOOL_SCHEMA`. Keep existing markdown-based validation for backward compatibility.

7. **Update tests** - Modify test file to import schemas and validation from `src/tools/` instead of inline definitions. Ensure all 12 test cases pass.

8. **Add module to main exports** - Update `src/index.js` to export tools module for external use.

9. **Run full test suite** - Verify all tests pass with `node --test`.

10. **Document usage** - Add brief note to SKILL.md about tool schema availability (optional, if time permits).

## Risks/Questions

- **Task tool system prompt support**: The feature spec notes uncertainty about how Task tool handles system prompts. Implementation focuses on schemas/utilities first; actual Task tool integration may require separate investigation.
- **Prompt caching availability**: Claude's prompt caching feature availability is undetermined. The `cache_control` structure is included but actual caching benefits depend on API support.
- **Backward compatibility**: Both feedback.js and handoff.js must maintain existing text-based parsing alongside new tool validation to avoid breaking current pipeline.

# Implementation Plan — Slim Agent Prompts

## Summary

Create slim runtime prompts (~30-50 lines each) for all agents to reduce token usage by ~5,200 tokens per pipeline run. Implementation involves: (1) creating a TEMPLATE.md with standardized structure, (2) creating 5 runtime prompt files following the template, and (3) updating SKILL.md to use runtime prompts instead of full spec references.

## Files to Create/Modify

| Path | Action | Purpose |
|------|--------|---------|
| `.blueprint/prompts/` | Create dir | New directory for runtime prompts |
| `.blueprint/prompts/TEMPLATE.md` | Create | Defines standard structure for all runtime prompts |
| `.blueprint/prompts/alex-runtime.md` | Create | Slim prompt for Alex (specification) |
| `.blueprint/prompts/cass-runtime.md` | Create | Slim prompt for Cass (stories) |
| `.blueprint/prompts/nigel-runtime.md` | Create | Slim prompt for Nigel (tests) |
| `.blueprint/prompts/codey-plan-runtime.md` | Create | Slim prompt for Codey planning phase |
| `.blueprint/prompts/codey-implement-runtime.md` | Create | Slim prompt for Codey implementation phase |
| `SKILL.md` | Modify | Replace "Read your full specification" with runtime prompt content |

## Implementation Steps

1. **Create prompts directory**: `mkdir -p .blueprint/prompts`

2. **Create TEMPLATE.md** with sections:
   - Role identity line pattern
   - Task section placeholder
   - Inputs section (file paths)
   - Outputs section (files + format)
   - Rules section (5-7 items, warn against duplication)
   - Full spec reference line
   - Include guidance: target 30-50 non-blank lines

3. **Create alex-runtime.md** (~35 lines):
   - Role: "You are Alex, the System Specification Agent"
   - Task: Create feature spec
   - Inputs: System spec, template, business context
   - Outputs: FEATURE_SPEC.md with format rules
   - Rules: 5-7 essential rules from full spec
   - Reference: AGENT_SPECIFICATION_ALEX.md

4. **Create cass-runtime.md** (~35 lines):
   - Role: "You are Cass, the Story Writer Agent"
   - Task: Create user stories
   - Inputs: Feature spec, system spec
   - Outputs: story-*.md files
   - Rules: 5-7 essential rules
   - Reference: AGENT_BA_CASS.md

5. **Create nigel-runtime.md** (~35 lines):
   - Role: "You are Nigel, the Tester Agent"
   - Task: Create tests
   - Inputs: Stories, feature spec
   - Outputs: test-spec.md, test file
   - Rules: 5-7 essential rules
   - Reference: AGENT_TESTER_NIGEL.md

6. **Create codey-plan-runtime.md** (~35 lines):
   - Role: "You are Codey, the Developer Agent"
   - Task: Create implementation plan (not implement)
   - Inputs: Feature spec, stories, test spec, tests
   - Outputs: IMPLEMENTATION_PLAN.md
   - Rules: 5-7 essential rules
   - Reference: AGENT_DEVELOPER_CODEY.md

7. **Create codey-implement-runtime.md** (~35 lines):
   - Role: "You are Codey, the Developer Agent"
   - Task: Implement feature
   - Inputs: Plan, tests
   - Outputs: Source files (incremental)
   - Rules: 5-7 essential rules
   - Reference: AGENT_DEVELOPER_CODEY.md

8. **Update SKILL.md agent prompts**: For each of Steps 6-10, replace the pattern:
   ```
   Read your full specification from: .blueprint/agents/AGENT_*.md
   ```
   with embedded content from corresponding runtime prompt, keeping task-specific context (slug, paths).

9. **Verify line counts**: Ensure each runtime prompt has 30-50 non-blank lines using test helper `countNonBlankLines()`.

10. **Run tests**: `node --test test/feature_slim-agent-prompts.test.js` to verify all 18 test cases pass.

## Risks/Questions

- **Maintainability**: Two sources of truth (runtime prompt + full spec). Mitigated by clear separation of concerns - runtime prompts contain only task instructions, full specs contain background/training.
- **Quality impact**: Agents receive less context. Mitigated by including full spec reference for edge cases.
- **SKILL.md size**: Embedding prompt content may increase file size. Consider using file references if prompts grow.

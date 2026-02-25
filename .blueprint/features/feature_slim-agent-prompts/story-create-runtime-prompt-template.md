# Story — Create Runtime Prompt Template

## User Story

As a **framework maintainer**, I want a standardized runtime prompt template so that all agent prompts follow a consistent structure and contain only essential runtime information.

---

## Context / Scope

- Applies to all agents: Alex, Cass, Nigel, Codey (plan + implement)
- Template defines the structure for slim runtime prompts (~30-50 lines)
- Full agent specs remain in `.blueprint/agents/` for reference
- Runtime prompts will live in `.blueprint/prompts/`
- See feature spec: `.blueprint/features/feature_slim-agent-prompts/FEATURE_SPEC.md`

---

## Acceptance Criteria

**AC-1 — Template structure defined**
- Given the need for consistent slim prompts,
- When the runtime prompt template is created,
- Then it includes exactly these sections in order:
  1. Role identity line ("You are {Agent}, the {Role}.")
  2. Task section
  3. Inputs section (files to read)
  4. Outputs section (files to write, format requirements)
  5. Rules section (5-7 critical rules only)
  6. Full spec reference line

**AC-2 — Template enforces brevity**
- Given the goal of token reduction,
- When a runtime prompt follows the template,
- Then the total line count is between 30-50 lines (excluding blank lines).

**AC-3 — Template includes full spec reference**
- Given agents may need additional context for edge cases,
- When the template is applied,
- Then each prompt includes: "For detailed guidance, see: `.blueprint/agents/AGENT_*.md`"

**AC-4 — Template location established**
- Given the need for organized prompt storage,
- When runtime prompts are created,
- Then they are stored in `.blueprint/prompts/` directory with naming convention `{agent-slug}-runtime.md`.

**AC-5 — No duplication of input content**
- Given runtime prompts should be minimal,
- When the Rules section is written,
- Then it does not duplicate information already present in the agent's input files (feature spec, system spec, etc.).

---

## Out of Scope

- Creating the actual agent prompts (covered in separate story)
- Updating SKILL.md integration (covered in separate story)
- Automated template validation tooling
- A/B testing infrastructure for quality comparison

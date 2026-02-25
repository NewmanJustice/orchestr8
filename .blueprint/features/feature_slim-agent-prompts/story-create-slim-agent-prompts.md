# Story — Create Slim Agent Prompts

## User Story

As a **pipeline user**, I want slim runtime prompts for each agent so that pipeline execution uses fewer input tokens while maintaining output quality.

---

## Context / Scope

- Creates 5 runtime prompts: Alex, Cass, Nigel, Codey-plan, Codey-implement
- Each prompt follows the template from story-create-runtime-prompt-template.md
- Full specs remain in `.blueprint/agents/` for reference
- Expected token reduction: ~5,200 tokens per pipeline run
- See feature spec: `.blueprint/features/feature_slim-agent-prompts/FEATURE_SPEC.md`

---

## Acceptance Criteria

**AC-1 — All agents have runtime prompts**
- Given the template has been established,
- When slim prompts are created,
- Then the following files exist in `.blueprint/prompts/`:
  - `alex-runtime.md`
  - `cass-runtime.md`
  - `nigel-runtime.md`
  - `codey-plan-runtime.md`
  - `codey-implement-runtime.md`

**AC-2 — Prompts contain role identity**
- Given each agent has a distinct role,
- When a runtime prompt is read,
- Then it begins with "You are {Name}, the {Role}." matching the agent's identity from the full spec.

**AC-3 — Prompts specify inputs and outputs**
- Given agents need to know what to read and write,
- When a runtime prompt is read,
- Then the Inputs section lists specific file paths to read,
- And the Outputs section lists specific files to create with format requirements.

**AC-4 — Rules are essential only**
- Given the goal of brevity,
- When a runtime prompt's Rules section is reviewed,
- Then it contains 5-7 rules maximum,
- And each rule is critical to correct task execution.

**AC-5 — Prompts reference full specs**
- Given edge cases may require additional context,
- When a runtime prompt is read,
- Then it includes a reference to the full agent spec path.

**AC-6 — Line count within target**
- Given the target of 30-50 lines,
- When any runtime prompt is measured,
- Then it contains between 30-50 non-blank lines.

---

## Out of Scope

- Modifying full agent specs in `.blueprint/agents/`
- Changing agent behaviour or capabilities
- SKILL.md integration (covered in separate story)
- Automated token counting tooling

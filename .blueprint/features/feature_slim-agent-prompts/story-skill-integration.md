# Story — SKILL.md Integration with Runtime Prompts

## User Story

As a **pipeline user**, I want SKILL.md to use the slim runtime prompts so that agent invocations benefit from reduced token usage.

---

## Context / Scope

- Updates SKILL.md to embed or reference runtime prompts instead of full specs
- Runtime prompts located in `.blueprint/prompts/`
- Pipeline flow remains unchanged: Alex -> Cass -> Nigel -> Codey
- Must maintain all existing functionality (--pause-after, --no-commit, queue recovery)
- See feature spec: `.blueprint/features/feature_slim-agent-prompts/FEATURE_SPEC.md`

---

## Acceptance Criteria

**AC-1 — Agent spawns use runtime prompts**
- Given SKILL.md spawns agents via Task tool,
- When an agent is invoked,
- Then the prompt content comes from `.blueprint/prompts/{agent}-runtime.md` rather than instructing "Read your full specification from: AGENT_*.md".

**AC-2 — All five agent contexts updated**
- Given the pipeline has 5 agent contexts,
- When SKILL.md is reviewed,
- Then Alex, Cass, Nigel, Codey-plan, and Codey-implement all use their respective runtime prompts.

**AC-3 — Pipeline flow unchanged**
- Given existing pipeline behaviour must be preserved,
- When a feature is processed with updated SKILL.md,
- Then the sequence remains: Alex -> Cass -> Nigel -> Codey-plan -> Codey-implement -> Auto-commit.

**AC-4 — Pause and commit options preserved**
- Given users rely on `--pause-after` and `--no-commit` flags,
- When SKILL.md is updated,
- Then these options continue to function as documented.

**AC-5 — Queue recovery unchanged**
- Given pipeline may fail mid-execution,
- When a pipeline is resumed from queue state,
- Then the correct runtime prompt is used for the resumed stage.

---

## Out of Scope

- Changes to queue file structure
- Changes to CLI commands
- Adding new pipeline stages
- Modifying the Task tool invocation mechanism

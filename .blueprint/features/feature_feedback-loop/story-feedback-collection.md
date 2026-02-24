# Story — Feedback Collection

## User Story

As a **pipeline orchestrator**, I want **downstream agents to provide structured feedback on upstream artifacts** so that **quality issues are surfaced explicitly at each stage boundary**.

---

## Context / Scope

- Per FEATURE_SPEC.md:Section 4, feedback is collected at each stage boundary (Cass on Alex, Nigel on Cass, Codey on Nigel)
- Feedback uses a defined schema with rating, confidence, issues, and recommendation
- Feedback is captured before the downstream agent begins its main work
- Per SYSTEM_SPEC.md:Section 7, agents must "flag deviations" — this story operationalises that principle

---

## Acceptance Criteria

**AC-1 — Feedback schema structure**
- Given an agent is spawned to provide feedback,
- When the agent completes feedback output,
- Then the feedback object contains:
  - `about`: agent name being assessed (alex|cass|nigel)
  - `rating`: integer 1-5
  - `confidence`: float 0.0-1.0
  - `issues`: array of issue codes (may be empty)
  - `recommendation`: one of "proceed", "pause", or "revise"

**AC-2 — Cass provides feedback on Alex**
- Given Alex has completed a feature specification,
- When Cass is spawned for story writing,
- Then Cass first produces a feedback object with `about: "alex"` assessing the feature spec quality.

**AC-3 — Nigel provides feedback on Cass**
- Given Cass has completed user stories,
- When Nigel is spawned for test writing,
- Then Nigel first produces a feedback object with `about: "cass"` assessing story quality and testability.

**AC-4 — Codey provides feedback on Nigel**
- Given Nigel has completed test specifications,
- When Codey is spawned for planning/implementation,
- Then Codey first produces a feedback object with `about: "nigel"` assessing test coverage and implementation feasibility.

**AC-5 — Feedback validation**
- Given an agent produces a feedback object,
- When the orchestrator reads the feedback,
- Then the feedback is validated against the schema,
- And invalid feedback triggers a warning but does not block the pipeline (per FEATURE_SPEC.md:Section 8, degraded mode).

**AC-6 — Feedback persisted to history**
- Given feedback is collected from an agent,
- When the stage completes,
- Then the feedback is stored in the history entry at `stages[stage].feedback`.

---

## Out of Scope

- Feedback from Alex (no prior stage to assess)
- Feedback on auto-commit stage
- Natural language feedback parsing (structured schema only)
- Automatic remediation based on feedback

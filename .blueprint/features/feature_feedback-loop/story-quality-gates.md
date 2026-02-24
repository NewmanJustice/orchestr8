# Story — Quality Gates

## User Story

As a **developer**, I want **the pipeline to pause when feedback indicates quality concerns** so that **I can review and address issues before proceeding with flawed inputs**.

---

## Context / Scope

- Per FEATURE_SPEC.md:Section 4 (Alternative: Quality Gate Triggers Pause), pipeline pauses when rating < threshold or recommendation is "pause"
- Default threshold is 3.0 (per FEATURE_SPEC.md:Section 4)
- Depends on feedback collection (story-feedback-collection.md)
- Per SYSTEM_SPEC.md:Section 8, failure handling already supports pause/review — quality gates extend this

---

## Acceptance Criteria

**AC-1 — Quality gate evaluation**
- Given feedback is collected from an agent,
- When the orchestrator evaluates the feedback,
- Then `shouldPause` is true if:
  - `rating < minRatingThreshold`, OR
  - `recommendation === "pause"`

**AC-2 — Pipeline pauses on quality gate trigger**
- Given `shouldPause` evaluates to true,
- When the quality gate is triggered,
- Then the pipeline pauses before the current agent begins its main work,
- And the user is prompted with: "Quality gate triggered. {Agent} rated previous stage {rating}/5. Issues: {issues}. (review/proceed/abort)"

**AC-3 — User can proceed past quality gate**
- Given the pipeline is paused at a quality gate,
- When the user chooses "proceed",
- Then the pipeline continues with the current agent's main work,
- And the decision is recorded in history.

**AC-4 — User can abort at quality gate**
- Given the pipeline is paused at a quality gate,
- When the user chooses "abort",
- Then the pipeline stops,
- And the feature is moved to the failed list with reason "quality_gate_abort".

**AC-5 — User can review at quality gate**
- Given the pipeline is paused at a quality gate,
- When the user chooses "review",
- Then the pipeline remains paused,
- And the user can examine upstream artifacts before deciding to proceed or abort.

---

## Out of Scope

- Automatic remediation or revision of upstream artifacts
- Multiple threshold levels per agent (single global threshold for MVP)
- Bypassing quality gates without explicit user action

# Implementation Plan — Feedback Loop Feature

## Summary

This feature adds a quality feedback mechanism where downstream agents (Cass, Nigel, Codey) assess upstream artifacts before proceeding. Implementation requires a new `src/feedback.js` module for schema validation, quality gate logic, configuration management, and insights analysis. The existing `src/history.js`, `src/insights.js`, and `src/retry.js` modules need extensions to store, analyze, and act on feedback data.

---

## Files to Create/Modify

| Path | Action | Purpose |
|------|--------|---------|
| `src/feedback.js` | Create | Core feedback logic: validation, quality gates, config management |
| `src/history.js` | Modify | Add `storeStageFeedback()` and extend entry schema |
| `src/insights.js` | Modify | Add feedback analysis: `analyzeFeedbackCorrelation()`, calibration |
| `src/retry.js` | Modify | Add `mapIssuesToStrategies()` for feedback-informed retries |
| `bin/cli.js` | Modify | Register `feedback-config` command and `insights --feedback` flag |
| `src/index.js` | Modify | Export feedback module |

---

## Implementation Steps

1. **Create `src/feedback.js` with schema validation** — Implement `validateFeedback()` per FEATURE_SPEC.md:Rule 1. Schema: `{about, rating, confidence, issues, recommendation}`. Return `{valid, errors}`.

2. **Add quality gate logic to `src/feedback.js`** — Implement `shouldPause(feedback, config)` per FEATURE_SPEC.md:Rule 2. Returns true if `rating < minRatingThreshold` OR `recommendation === "pause"`.

3. **Add config management to `src/feedback.js`** — Implement `getDefaultConfig()`, `readConfig()`, `writeConfig()`, `setConfigValue()`. Default: `{minRatingThreshold: 3.0, enabled: true, issueMappings: {...}}`.

4. **Extend `src/history.js`** — Add `storeStageFeedback(slug, stage, feedback)` to persist feedback at `stages[stage].feedback`. Ensure backward compatibility (missing feedback = null).

5. **Add calibration calculation to `src/insights.js`** — Implement `calculateCalibration(agent, history)` per FEATURE_SPEC.md:Rule 4. Return null if <10 runs with feedback, else correlation score 0-1.

6. **Add issue correlation to `src/insights.js`** — Implement `correlateIssues(history)` to map issue codes to failure rates. Return `{issueCode: failureCorrelation}`.

7. **Add threshold recommendation to `src/insights.js`** — Implement `recommendThreshold(history)` to suggest optimal minRatingThreshold based on historical data.

8. **Extend `src/retry.js`** — Add `mapIssuesToStrategies(issues, config)` using default mappings from FEATURE_SPEC.md:Rule 3.

9. **Register CLI commands in `bin/cli.js`** — Add `feedback-config` (view), `feedback-config set <key> <value>`, and `--feedback` flag to `insights` command.

10. **Wire exports in `src/index.js`** — Export feedback module for orchestrator integration.

---

## Key Functions

**src/feedback.js:**
- `validateFeedback(feedback)` — Schema validation, returns `{valid, errors}`
- `shouldPause(feedback, config)` — Quality gate evaluation
- `getDefaultConfig()` / `readConfig()` / `writeConfig(config)` — Config I/O
- `setConfigValue(key, value)` — CLI config setter with validation
- `displayConfig()` — Pretty-print current config

**src/insights.js (new):**
- `calculateCalibration(agent, history)` — Agent calibration score
- `correlateIssues(history)` — Issue-to-failure correlation
- `recommendThreshold(history)` — Optimal threshold suggestion
- `displayFeedbackInsights(options)` — CLI output for `--feedback`

**src/retry.js (new):**
- `mapIssuesToStrategies(issues, config)` — Feedback-informed strategy selection

---

## Risks/Questions

- **Agent prompt integration**: Feedback collection requires agent prompts (in SKILL.md) to include feedback instructions. This is orchestrator-level work outside core modules.
- **Calibration metric**: Tests use simple accuracy (predicted vs actual). May need Pearson correlation for better calibration measure in production.
- **Issue taxonomy**: Starting with 6 issue codes per FEATURE_SPEC.md:Rule 3. Plan for iterative expansion.
- **Conflicting signals**: Per FEATURE_SPEC.md:Section 9, high rating + "pause" recommendation is unresolved. Recommend: recommendation takes precedence.

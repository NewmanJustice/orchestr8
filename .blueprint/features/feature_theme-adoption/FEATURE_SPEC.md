# Feature Specification — Theme Adoption

## 1. Feature Intent
**Why this feature exists.**

- `src/theme.js` provides consistent murmuration-themed formatting (glyphs, colors, progress bars)
- Currently only used by murm.js for parallel execution output
- Other CLI output (history, insights, validate, configs) uses plain text
- Inconsistent visual experience across commands
- Theme constants and helpers should be reused project-wide

> Technical enhancement — adopt theme.js across all CLI output.

---

## 2. Scope
### In Scope
- Use `colorize()` for success/error/warning messages across all commands
- Use `formatStageStart()` pattern for pipeline stage output in SKILL.md execution
- Use `progressBar()` where applicable (history stats, insights)
- Use status icons consistently (checkmarks, X marks, warnings)
- Respect TTY detection for color output

### Out of Scope
- Creating new theme elements
- Changing the banner or glyph design
- Adding animation or spinners to non-murm commands
- Changing the fundamental output structure of commands

---

## 3. Actors Involved
**Who interacts with this feature.**

- **CLI User**: Sees consistent, themed output across all commands
- **Developer**: Uses theme.js helpers instead of inline ANSI codes

---

## 4. Behaviour Overview
**What the feature does, conceptually.**

Before:
```
Retry Configuration
  Max retries:            3
  Window size:            10
```

After:
```
Retry Configuration

  Max retries:            3
  Window size:            10
  High failure threshold: 0.2

  Stage Strategies:
    alex            : simplify-prompt -> add-context
```
(With colored headers when TTY detected)

**Files to update:**
- `src/validate.js` — use `colorize()` for pass/fail indicators
- `src/history.js` — use status icons and colors for status display
- `src/insights.js` — use `colorize()` for recommendations
- `src/retry.js` — use `colorize()` in `displayConfig()`
- `src/feedback.js` — use `colorize()` in `displayConfig()`
- `src/stack.js` — use `colorize()` in `displayStackConfig()`

---

## 5. State & Lifecycle Interactions
**How this feature touches the system lifecycle.**

- No state changes — output formatting only
- Respects existing TTY detection patterns

---

## 6. Rules & Decision Logic
**New or exercised rules.**

| Rule | Description |
|------|-------------|
| TTY detection | Use `process.stdout.isTTY` to enable/disable colors |
| Success indicators | Green checkmark (✓) or `colorize(text, 'green')` |
| Error indicators | Red X (✗) or `colorize(text, 'red')` |
| Warning indicators | Yellow warning (⚠) or `colorize(text, 'yellow')` |
| Headers | Cyan for section headers |

---

## 7. Dependencies
**What this feature relies on.**

- `src/theme.js` — already exists with all needed exports
- No new dependencies

---

## 8. Non-Functional Considerations

- **Accessibility**: Plain text fallback when not TTY (pipes, redirects)
- **Consistency**: Same visual language across all commands
- **Maintainability**: Centralized theme makes future changes easy

---

## 9. Assumptions & Open Questions

**Assumptions:**
- All modules can safely import from theme.js without circular dependencies
- TTY detection is sufficient for determining color support

**Open Questions:**
- Should `STATUS_ICONS` in theme.js be updated from `parallel_*` to `murm_*`? (See fix-status-icons in FEATURE_IDEAS.md)
- Should a `--no-color` flag be added globally?

---

## 10. Impact on System Specification

- No impact — visual enhancement only
- Does not change system boundaries or behaviour

---

## 11. Handover to BA (Cass)

**Skip Cass stage** — this is a technical enhancement feature with no user stories needed.

Direct handover to Nigel for test creation:
- Tests should verify output includes expected formatting
- Tests should verify TTY=false produces plain text
- Tests should verify no regressions in output content

---

## 12. Change Log (Feature-Level)
| Date | Change | Reason | Raised By |
|------|--------|--------|-----------|
| 2026-03-03 | Initial spec | Consistent CLI theming | Alex |

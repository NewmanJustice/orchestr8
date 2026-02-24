# Implementation Plan - Pipeline History

## Summary

Implement pipeline history tracking by creating a new `src/history.js` module that records execution metrics during pipeline runs and provides CLI commands for viewing/managing history. The module will integrate with the existing orchestrator to capture stage timestamps and persist entries to `.claude/pipeline-history.json`. CLI routing in `bin/cli.js` will be extended with a new `history` command supporting subcommands and flags.

---

## Files to Create/Modify

| Path | Action | Purpose |
|------|--------|---------|
| `src/history.js` | Create | Core history module: `recordHistory()`, `displayHistory()`, `showStats()`, `clearHistory()` |
| `bin/cli.js` | Modify | Add `history` command routing with `--all`, `--stats`, `--force` flags and `clear` subcommand |
| `src/orchestrator.js` | Modify | Add stage timestamp tracking; call `recordHistory()` on pipeline completion/failure/pause |

---

## Implementation Steps

1. **Create `src/history.js` with file I/O helpers** - `readHistoryFile()`, `writeHistoryFile()`, `ensureHistoryFile()` handling missing/corrupted files gracefully.

2. **Implement `recordHistory(entry)` function** - Accepts history entry object, appends to history array, writes to `.claude/pipeline-history.json`. Wrap in try/catch to log warning on failure without throwing.

3. **Implement `displayHistory(options)` function** - Read history, sort by `completedAt` descending, slice to 10 entries (unless `--all`), format tabular output with color-coded status.

4. **Implement `showStats()` function** - Compute success rate, average duration per stage, total average for successful runs, most common failure stage (handling ties).

5. **Implement `clearHistory(options)` function** - Show confirmation prompt (unless `--force`), reset file to empty array on confirm, display count of removed entries.

6. **Add CLI routing in `bin/cli.js`** - Register `history` command; parse `--all`, `--stats`, `--force` flags; handle `clear` subcommand.

7. **Modify `src/orchestrator.js` to track stage timestamps** - Update `setCurrent()` to record `startedAt`; add `completeStage()` helper to record `completedAt` and compute `durationMs`.

8. **Add `recordPipelineCompletion()` to orchestrator** - Called on success/failure/pause; builds history entry from accumulated stage data and calls `recordHistory()`.

9. **Add `.claude/pipeline-history.json` to `.gitignore`** - Update `src/init.js` to append this pattern during initialization.

10. **Run tests and verify all T-* test IDs pass** - Execute `node --test test/feature_pipeline-history.test.js`.

---

## Data Model

```json
{
  "slug": "feature-name",
  "status": "success | failed | paused",
  "startedAt": "2026-02-24T10:00:00.000Z",
  "completedAt": "2026-02-24T10:15:00.000Z",
  "totalDurationMs": 900000,
  "stages": {
    "alex": { "startedAt": "...", "completedAt": "...", "durationMs": 120000 },
    "cass": { "startedAt": "...", "completedAt": "...", "durationMs": 90000 },
    "nigel": { "startedAt": "...", "completedAt": "...", "durationMs": 180000 },
    "codey-plan": { "startedAt": "...", "completedAt": "...", "durationMs": 75000 },
    "codey-implement": { "startedAt": "...", "completedAt": "...", "durationMs": 255000 }
  },
  "failedStage": null,
  "pausedAfter": null
}
```

---

## Risks/Questions

- **Confirmation prompt testing**: Tests will need to mock stdin for `clearHistory()` confirmation; consider using `readline` interface that can be injected for testing.
- **Color output detection**: Use `process.stdout.isTTY` to determine if colors should be applied; provide fallback for non-TTY environments.
- **Orchestrator integration point**: The `/implement-feature` skill (SKILL.md) runs via Task tool sub-agents; recording hooks must be called from the skill's completion handler, not just from `src/orchestrator.js`. Verify integration path.
- **File corruption recovery**: Per AC-4, corrupted history file should not block CLI; implement robust JSON parsing with fallback to empty array after warning.

# Test Specification — Feedback Loop Feature

## Understanding

The feedback loop feature introduces a quality feedback mechanism where downstream agents (Cass, Nigel, Codey) assess upstream artifacts before proceeding. Key components:

1. **Feedback Collection**: Structured schema with rating (1-5), confidence (0-1), issues array, and recommendation
2. **Quality Gates**: Pipeline pauses when rating < threshold (default 3.0) or recommendation is "pause"
3. **Configuration**: CLI commands to view/modify thresholds in `.claude/feedback-config.json`
4. **Insights**: Correlation analysis between feedback scores and pipeline outcomes (requires 10+ runs)

Per FEATURE_SPEC.md:Section 8, invalid feedback triggers warnings but does not block (degraded mode).

---

## AC to Test ID Mapping

### Story: Feedback Collection

| AC | Test ID | Scenario |
|----|---------|----------|
| AC-1 | T-FC-1.1 | Valid feedback schema accepted |
| AC-1 | T-FC-1.2 | Missing required field rejected |
| AC-5 | T-FC-2.1 | Invalid rating type triggers warning |
| AC-6 | T-FC-3.1 | Feedback stored in history entry |

### Story: Quality Gates

| AC | Test ID | Scenario |
|----|---------|----------|
| AC-1 | T-QG-1.1 | Rating below threshold triggers pause |
| AC-1 | T-QG-1.2 | Recommendation "pause" triggers pause |
| AC-1 | T-QG-1.3 | Rating at/above threshold proceeds |
| AC-3 | T-QG-2.1 | User proceed decision recorded |

### Story: Feedback Config

| AC | Test ID | Scenario |
|----|---------|----------|
| AC-1 | T-CF-1.1 | Read config returns defaults |
| AC-2 | T-CF-2.1 | Set valid threshold updates file |
| AC-3 | T-CF-2.2 | Invalid threshold rejected |
| AC-5 | T-CF-3.1 | Config file created on first set |

### Story: Feedback Insights

| AC | Test ID | Scenario |
|----|---------|----------|
| AC-2 | T-IN-1.1 | Agent calibration calculated correctly |
| AC-3 | T-IN-2.1 | Issue patterns correlated with failures |
| AC-4 | T-IN-3.1 | Threshold recommendation generated |
| AC-5 | T-IN-4.1 | Insufficient data message shown |

---

## Key Assumptions

- ASSUMPTION: Feedback validation is synchronous and does not require file I/O
- ASSUMPTION: History module exposes functions for reading/writing stage feedback
- ASSUMPTION: Config file uses JSON format with flat key-value structure
- ASSUMPTION: Calibration uses Pearson correlation or equivalent simple metric
- ASSUMPTION: Default issue-to-strategy mappings are hardcoded, not configurable in MVP
- Per FEATURE_SPEC.md:Section 8, missing feedback in history is treated as neutral (no gate effect)

---

## Traceability Table

| Story | ACs Covered | Test IDs | Notes |
|-------|-------------|----------|-------|
| Feedback Collection | AC-1, AC-5, AC-6 | T-FC-1.1, T-FC-1.2, T-FC-2.1, T-FC-3.1 | AC-2,3,4 are integration (agent spawning) |
| Quality Gates | AC-1, AC-3 | T-QG-1.1, T-QG-1.2, T-QG-1.3, T-QG-2.1 | AC-2,4,5 require CLI interaction |
| Feedback Config | AC-1, AC-2, AC-3, AC-5 | T-CF-1.1, T-CF-2.1, T-CF-2.2, T-CF-3.1 | AC-4,6 deferred to integration |
| Feedback Insights | AC-2, AC-3, AC-4, AC-5 | T-IN-1.1, T-IN-2.1, T-IN-3.1, T-IN-4.1 | AC-1,6 require CLI (integration) |

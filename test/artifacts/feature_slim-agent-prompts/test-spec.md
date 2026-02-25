# Test Specification — Slim Agent Prompts

## Understanding

This feature creates slim runtime prompts (~30-50 lines) to replace verbose agent spec references (~200-450 lines), reducing token usage by ~5,200 tokens per pipeline run. Three stories cover: (1) template structure, (2) five agent prompts, and (3) SKILL.md integration. Tests verify file existence, structure, line counts, and content patterns.

---

## AC to Test ID Mapping

### Story 1: Create Runtime Prompt Template

| AC | Test ID | Scenario |
|----|---------|----------|
| AC-1 | T-1.1 | Template has all 6 required sections in order |
| AC-2 | T-1.2 | Template guidance enforces 30-50 line target |
| AC-3 | T-1.3 | Template includes full spec reference pattern |
| AC-4 | T-1.4 | Prompts directory exists at `.blueprint/prompts/` |
| AC-4 | T-1.5 | Files follow `{agent-slug}-runtime.md` naming |
| AC-5 | T-1.6 | Rules section guidance warns against duplication |

### Story 2: Create Slim Agent Prompts

| AC | Test ID | Scenario |
|----|---------|----------|
| AC-1 | T-2.1 | All 5 runtime prompt files exist |
| AC-2 | T-2.2 | Each prompt starts with role identity line |
| AC-3 | T-2.3 | Each prompt has Inputs section with file paths |
| AC-3 | T-2.4 | Each prompt has Outputs section with files |
| AC-4 | T-2.5 | Rules section has 5-7 items per prompt |
| AC-5 | T-2.6 | Each prompt references full agent spec |
| AC-6 | T-2.7 | Each prompt has 30-50 non-blank lines |

### Story 3: SKILL.md Integration

| AC | Test ID | Scenario |
|----|---------|----------|
| AC-1 | T-3.1 | SKILL.md references runtime prompt paths |
| AC-2 | T-3.2 | All 5 agent contexts use runtime prompts |
| AC-3 | T-3.3 | Pipeline sequence preserved in SKILL.md |
| AC-4 | T-3.4 | --pause-after options still documented |
| AC-4 | T-3.5 | --no-commit option still documented |
| AC-5 | T-3.6 | Queue recovery logic references correct prompts |

---

## Key Assumptions

- Template document will be created at `.blueprint/prompts/TEMPLATE.md` or similar
- Line count excludes blank lines (lines matching `/^\s*$/`)
- Role identity pattern: `/^You are \w+, the \w+/`
- Full spec reference pattern: `/AGENT_.*\.md/`
- Rules section contains numbered or bulleted items (pattern: `/^[-*\d]/)
- SKILL.md remains single file at project root

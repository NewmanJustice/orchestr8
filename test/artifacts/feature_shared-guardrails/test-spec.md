# Test Specification — Shared Guardrails

## Understanding

This feature extracts duplicated guardrails content (~45 lines, ~400 tokens) from 4 agent specs into a single shared `GUARDRAILS.md` file. The goal is to reduce token usage (~1,200 tokens/run) and create a single source of truth. Two stories cover: (1) extracting guardrails and updating agent spec references, (2) ensuring init/update commands handle the new file correctly.

Per FEATURE_SPEC.md: "Extracting to a shared file reduces token usage and ensures consistency when guardrails are updated"

---

## AC to Test ID Mapping

### Story: Extract Guardrails to Shared File

| AC | Test ID | Scenario |
|----|---------|----------|
| AC-1 | T-1.1 | GUARDRAILS.md exists at `.blueprint/agents/GUARDRAILS.md` |
| AC-1 | T-1.2 | File contains all required sections (Allowed Sources, Prohibited Sources, Citation Requirements, Assumptions vs Facts, Confidentiality, Escalation Protocol) |
| AC-2 | T-2.1 | AGENT_SPECIFICATION_ALEX.md references GUARDRAILS.md |
| AC-2 | T-2.2 | AGENT_BA_CASS.md references GUARDRAILS.md |
| AC-2 | T-2.3 | AGENT_TESTER_NIGEL.md references GUARDRAILS.md |
| AC-2 | T-2.4 | AGENT_DEVELOPER_CODEY.md references GUARDRAILS.md |
| AC-3 | T-3.1 | GUARDRAILS.md content matches original guardrails structure |
| AC-4 | T-4.1 | Agent spec + guardrails reference is resolvable |
| AC-5 | T-5.1 | No inline guardrails in AGENT_SPECIFICATION_ALEX.md |
| AC-5 | T-5.2 | No inline guardrails in AGENT_BA_CASS.md |
| AC-5 | T-5.3 | No inline guardrails in AGENT_TESTER_NIGEL.md |
| AC-5 | T-5.4 | No inline guardrails in AGENT_DEVELOPER_CODEY.md |

### Story: Update Init/Update Commands

| AC | Test ID | Scenario |
|----|---------|----------|
| AC-1 | T-6.1 | Init copies GUARDRAILS.md to target `.blueprint/agents/` |
| AC-2 | T-7.1 | Update replaces GUARDRAILS.md in target |
| AC-3 | T-8.1 | Update preserves features/ directory |
| AC-3 | T-8.2 | Update preserves system_specification/ directory |
| AC-4 | T-9.1 | Agent specs and GUARDRAILS.md are both present after init |
| AC-5 | T-10.1 | Old inline guardrails replaced with reference on update |

---

## Key Assumptions

- ASSUMPTION: GUARDRAILS.md file path is `.blueprint/agents/GUARDRAILS.md` (per story-extract-guardrails.md)
- ASSUMPTION: Reference format in agent specs is a readable instruction (e.g., "Read guardrails from..." or similar)
- ASSUMPTION: Guardrails sections are identifiable by heading patterns (## Guardrails, ### Allowed Sources, etc.)
- ASSUMPTION: Init/update copy entire `agents/` directory, so no code changes needed (per story-update-init-commands.md:Notes)
- ASSUMPTION: Tests verify file structure/content; actual agent runtime behaviour is integration-tested separately

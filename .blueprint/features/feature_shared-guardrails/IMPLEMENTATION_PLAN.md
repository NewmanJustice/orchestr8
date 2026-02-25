# Implementation Plan — Shared Guardrails

## Summary

Extract the duplicated ~45-line guardrails section from all 4 agent specifications into a new `.blueprint/agents/GUARDRAILS.md` file, then update each agent spec to reference the shared file instead of containing inline guardrails. No code changes required in init.js or update.js since they already copy the entire `agents/` directory.

## Files to Create/Modify

| Path | Action | Purpose |
|------|--------|---------|
| `.blueprint/agents/GUARDRAILS.md` | Create | New shared guardrails file containing extracted content |
| `.blueprint/agents/AGENT_SPECIFICATION_ALEX.md` | Modify | Remove inline guardrails, add reference to GUARDRAILS.md |
| `.blueprint/agents/AGENT_BA_CASS.md` | Modify | Remove inline guardrails, add reference to GUARDRAILS.md |
| `.blueprint/agents/AGENT_TESTER_NIGEL.md` | Modify | Remove inline guardrails, add reference to GUARDRAILS.md |
| `.blueprint/agents/AGENT_DEVELOPER_CODEY.md` | Modify | Remove inline guardrails, add reference to GUARDRAILS.md |

## Implementation Steps

1. **Create GUARDRAILS.md** - Extract the guardrails section (lines 169-210 from AGENT_SPECIFICATION_ALEX.md) into new file at `.blueprint/agents/GUARDRAILS.md`. Content includes: Allowed Sources, Prohibited Sources, Citation Requirements, Assumptions vs Facts, Confidentiality, Escalation Protocol.

2. **Update AGENT_SPECIFICATION_ALEX.md** - Remove the inline `## Guardrails` section (lines 169-210). Add reference: `## Guardrails\n\nRead and apply the shared guardrails from: `.blueprint/agents/GUARDRAILS.md``

3. **Update AGENT_BA_CASS.md** - Remove inline guardrails section (lines 383-425). Add same reference format.

4. **Update AGENT_TESTER_NIGEL.md** - Remove inline guardrails section (lines 174-216). Add same reference format.

5. **Update AGENT_DEVELOPER_CODEY.md** - Remove inline guardrails section (lines 426-468). Add same reference format.

6. **Run tests** - Execute `node --test test/feature_shared-guardrails.test.js` to verify all ACs pass.

## Risks/Questions

- ASSUMPTION: Claude agents can follow file references and will read GUARDRAILS.md when instructed. Per story-extract-guardrails.md:Notes, this is a documented assumption.
- No code changes needed in src/init.js or src/update.js since `agents/` is already in the UPDATABLE array (per story-update-init-commands.md:Notes).

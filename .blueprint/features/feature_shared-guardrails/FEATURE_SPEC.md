# Feature Specification — Shared Guardrails

## 1. Feature Intent
**Why this feature exists.**

- The same guardrails section (~45 lines, ~400 tokens) is duplicated verbatim in all 4 agent specification files
- This wastes ~1,200 tokens per pipeline run (4 agents reading identical content)
- Extracting to a shared file reduces token usage and ensures consistency when guardrails are updated

---

## 2. Scope
### In Scope
- Extract guardrails section to `.blueprint/agents/GUARDRAILS.md`
- Update all agent specs to reference the shared file
- Ensure agents still read and apply guardrails

### Out of Scope
- Changing the content of guardrails
- Agent-specific guardrail variations (all agents use same guardrails currently)

---

## 3. Actors Involved

| Actor | Can Do | Cannot Do |
|-------|--------|-----------|
| Alex | Read shared guardrails, apply to outputs | Modify guardrails |
| Cass | Read shared guardrails, apply to outputs | Modify guardrails |
| Nigel | Read shared guardrails, apply to outputs | Modify guardrails |
| Codey | Read shared guardrails, apply to outputs | Modify guardrails |

---

## 4. Behaviour Overview

**Happy path:**
1. Pipeline invokes agent (e.g., Alex)
2. Agent reads slim spec file which references `GUARDRAILS.md`
3. Agent reads `GUARDRAILS.md` once
4. Agent applies guardrails to all outputs

**Key outcomes:**
- Identical guardrail enforcement as before
- ~1,200 fewer tokens per pipeline run
- Single source of truth for guardrail updates

---

## 5. State & Lifecycle Interactions

- No state changes — this is a structural refactor
- Agent behaviour is unchanged
- Pipeline flow is unchanged

---

## 6. Rules & Decision Logic

| Rule | Description |
|------|-------------|
| Single source | All agents reference the same `GUARDRAILS.md` file |
| Read once | Each agent reads guardrails once per invocation |
| No override | Agent specs cannot override shared guardrails |

---

## 7. Dependencies

- All 4 agent specification files must be updated
- SKILL.md agent prompts may need adjustment if they reference guardrails directly
- `src/init.js` and `src/update.js` must handle the new file during init/update

---

## 8. Non-Functional Considerations

- **Performance:** Reduces token usage by ~1,200 per run
- **Maintainability:** Single file to update when guardrails change
- **Consistency:** Eliminates risk of guardrails drifting between agents

---

## 9. Assumptions & Open Questions

**Assumptions:**
- All agents will continue to use identical guardrails
- Agents can follow file references (read file X when spec says "see file X")

**Open Questions:**
- Should agent prompts explicitly include guardrails content, or trust agents to read the reference?

---

## 10. Impact on System Specification

- Reinforces existing system assumptions (guardrails apply to all agents)
- No contradiction with system spec
- No system spec change required

---

## 11. Handover to BA (Cass)

**Story themes:**
- Extract guardrails to shared file
- Update agent specs to reference shared file
- Update init/update commands to handle new file

**Expected story boundaries:**
- One story for file extraction and agent spec updates
- One story for init/update command changes

---

## 12. Change Log (Feature-Level)
| Date | Change | Reason | Raised By |
|-----|------|--------|-----------|
| 2026-02-25 | Initial spec | Token efficiency improvement | Claude |

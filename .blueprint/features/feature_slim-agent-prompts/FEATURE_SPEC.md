# Feature Specification — Slim Agent Prompts

## 1. Feature Intent
**Why this feature exists.**

- Current agent prompts tell each agent to "Read your full specification from: AGENT_*.md"
- Full specs are 200-450 lines (~1,500-2,000 tokens each), loaded every invocation
- Most spec content is background/training context, not runtime-essential
- Creating slim runtime prompts reduces token usage by ~5,200 tokens per pipeline run

---

## 2. Scope
### In Scope
- Create slim runtime prompts in `.blueprint/prompts/` directory
- Runtime prompts contain only: role reminder, task, inputs, outputs, output rules
- Update SKILL.md to use runtime prompts instead of full specs
- Keep full specs for reference/documentation

### Out of Scope
- Changing agent behaviour or capabilities
- Removing full agent specs (they remain for context)
- Changing the pipeline flow

---

## 3. Actors Involved

| Actor | Can Do | Cannot Do |
|-------|--------|-----------|
| Alex | Execute from slim prompt | Access removed context unless needed |
| Cass | Execute from slim prompt | Access removed context unless needed |
| Nigel | Execute from slim prompt | Access removed context unless needed |
| Codey | Execute from slim prompt (plan + implement) | Access removed context unless needed |

---

## 4. Behaviour Overview

**Happy path:**
1. Pipeline invokes agent via Task tool
2. Agent receives slim prompt (~30-50 lines) instead of "read full spec" instruction
3. Agent executes task with essential context only
4. Output quality maintained with fewer input tokens

**Slim prompt structure:**
```markdown
You are {Agent}, the {Role}.

## Task
{Current task description}

## Inputs
{List of files to read}

## Outputs
{Files to write, format requirements}

## Rules
{5-7 critical rules only}
```

**Key outcomes:**
- ~5,200 fewer input tokens per pipeline run
- Faster agent responses (less context to process)
- Same output quality

---

## 5. State & Lifecycle Interactions

- No state changes — prompts are stateless
- Pipeline flow unchanged
- Queue structure unchanged

---

## 6. Rules & Decision Logic

| Rule | Description |
|------|-------------|
| Essential only | Runtime prompts contain only task-critical information |
| No duplication | Don't repeat what's in input files (e.g., feature spec) |
| Reference full spec | Include path to full spec for edge cases: "For detailed guidance, see: AGENT_*.md" |
| Consistent structure | All runtime prompts follow same template |

---

## 7. Dependencies

- SKILL.md must be updated with new prompt structure
- New `.blueprint/prompts/` directory created
- Full agent specs remain in `.blueprint/agents/` for reference

---

## 8. Non-Functional Considerations

- **Performance:** ~5,200 token reduction per run (~35% of agent input tokens)
- **Latency:** Faster responses due to smaller context
- **Maintainability:** Two places to update (runtime prompt + full spec) — mitigated by clear separation of concerns

---

## 9. Assumptions & Open Questions

**Assumptions:**
- Agents can perform tasks effectively with condensed prompts
- Edge cases are rare enough that full spec reference is sufficient
- Output quality won't degrade with less verbose instructions

**Open Questions:**
- Should runtime prompts be generated from full specs, or maintained separately?
- What's the minimum context needed for each agent to maintain quality?
- Should we A/B test slim vs full prompts to measure quality impact?

---

## 10. Impact on System Specification

- Reinforces efficiency goals
- No contradiction with system spec
- Consider adding "token efficiency" as a system-level concern

---

## 11. Handover to BA (Cass)

**Story themes:**
- Create runtime prompt template
- Create slim prompts for each agent (Alex, Cass, Nigel, Codey-plan, Codey-implement)
- Update SKILL.md to use runtime prompts
- Test output quality with slim prompts

**Expected story boundaries:**
- One story per agent prompt creation
- One story for SKILL.md integration
- One story for quality validation

---

## 12. Change Log (Feature-Level)
| Date | Change | Reason | Raised By |
|-----|------|--------|-----------|
| 2026-02-25 | Initial spec | Token efficiency improvement | Claude |

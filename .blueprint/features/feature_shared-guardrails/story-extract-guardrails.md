# Story — Extract Guardrails to Shared File

## User story
As a framework maintainer, I want to extract the duplicated guardrails section from all agent specification files into a single shared GUARDRAILS.md file so that guardrails are maintained in one place and token usage is reduced.

---

## Context / scope
- Affects all 4 agent specifications (Alex, Cass, Nigel, Codey)
- Guardrails section is currently ~45 lines / ~400 tokens per agent
- New file location: `.blueprint/agents/GUARDRAILS.md`
- This is a structural refactor; agent behaviour remains unchanged

Per FEATURE_SPEC.md:Section 1: "The same guardrails section (~45 lines, ~400 tokens) is duplicated verbatim in all 4 agent specification files"

---

## Acceptance criteria

**AC-1 — Shared guardrails file exists**
- Given the `.blueprint/agents/` directory,
- When the shared guardrails feature is implemented,
- Then a new file `GUARDRAILS.md` exists at `.blueprint/agents/GUARDRAILS.md`
- And it contains the complete guardrails content (Allowed Sources, Prohibited Sources, Citation Requirements, Assumptions vs Facts, Confidentiality, Escalation Protocol sections).

**AC-2 — Agent specs reference shared file**
- Given each agent specification file (AGENT_SPECIFICATION_ALEX.md, AGENT_BA_CASS.md, AGENT_TESTER_NIGEL.md, AGENT_DEVELOPER_CODEY.md),
- When the shared guardrails feature is implemented,
- Then the inline guardrails section is removed from each file
- And each file contains a reference to read `.blueprint/agents/GUARDRAILS.md`.

**AC-3 — Guardrails content is identical**
- Given the new `GUARDRAILS.md` file,
- When comparing its content to the original inline guardrails,
- Then the content is identical (no additions, removals, or modifications to guardrail rules).

**AC-4 — Agent specs remain functional**
- Given an agent (e.g., Alex) reads its specification file,
- When the specification references `GUARDRAILS.md`,
- Then the agent can locate and read the shared guardrails file
- And the agent applies all guardrails to its outputs.

**AC-5 — No duplicate guardrails remain**
- Given all 4 agent specification files,
- When searching for guardrails sections,
- Then no file contains inline guardrails content (only the reference to the shared file).

---

## Out of scope
- Modifying the content of guardrails (per FEATURE_SPEC.md:Section 2)
- Agent-specific guardrail variations
- Changes to init/update commands (covered in separate story)
- Modifying agent prompts in SKILL.md

---

## Notes
- Per FEATURE_SPEC.md:Section 6, agents cannot override shared guardrails
- Per FEATURE_SPEC.md:Section 9, ASSUMPTION: Agents can follow file references (read file X when spec says "see file X")

---
name: implement-feature
description: Run the full Cass → Nigel → Claude pipeline to implement a screen from rough requirements to passing code. Creates user story, tests, implementation plan, and working code with auto-commit.
---

# Implement Feature Skill

Run the full Cass → Nigel → Claude pipeline to implement a screen from rough requirements to passing code.

---

## Invocation

```bash
# Auto-detect next screen, Cass asks for input interactively
/implement-feature

# Explicit screen number, Cass asks for input
/implement-feature 26

# Explicit screen with inline rough input
/implement-feature 26 "Screen for selecting Housing Act with radio options and conditional reveal"

# With pause gate
/implement-feature 26 --pause-after=cass
/implement-feature 26 --pause-after=nigel
/implement-feature 26 --pause-after=claude-plan

# Skip auto-commit
/implement-feature 26 --no-commit

# Batch multiple screens (Cass queues ahead)
/implement-feature 26,27,28
```

---

## Pipeline Overview

```
CASS (Story Writer) → NIGEL (Tester) → CLAUDE (Plan) → CLAUDE (Implement) → Auto-commit
```

Each agent works from a queue. When Cass finishes a story, it's added to Nigel's queue. When Nigel finishes tests, they're added to Claude's queue. This allows agents to work ahead when batching multiple screens.

---

## Output Locations

| Agent | Output |
|-------|--------|
| Cass | `businessArtifacts/userstories/screen{N}.txt` |
| Nigel | `prototype/test/artifacts/screen{N}/` |
| Nigel | `prototype/test/routes/{screenName}.test.js` |
| Claude (Plan) | `plans/screen{N}-plan.md` |
| Claude (Implement) | Routes, templates, passing tests |

---

## When this skill is invoked, follow these steps:

### Step 1: Parse Arguments

1. Check if screen number(s) provided (e.g., `26` or `26,27,28`)
2. Check for flags:
   - `--pause-after=cass` - pause after user story created
   - `--pause-after=nigel` - pause after tests created
   - `--pause-after=claude-plan` - pause after implementation plan created
   - `--no-commit` - skip auto-commit
3. Check for inline rough input (quoted string after screen number)

### Step 2: Auto-detect Screen Number (if not provided)

If no screen number given:
1. Scan `businessArtifacts/userstories/` for files matching `screen*.txt`
2. Find the highest number
3. Next screen = highest + 1
4. Confirm with user: "Next screen appears to be Screen {N}. Proceed?"

### Step 3: Initialize Queue

Read or create `.claude/implement-queue.json`:

```json
{
  "lastUpdated": "ISO-timestamp",
  "cassQueue": [],
  "nigelQueue": [],
  "claudeQueue": [],
  "completed": [],
  "failed": []
}
```

Add requested screen(s) to `cassQueue`.

Ensure the `plans/` directory exists:
```bash
mkdir -p plans
```

### Step 4: Run Cass (Story Writer)

For each screen in `cassQueue`:

1. **Read agent instructions**: `agentinstructions/AGENT_Cass.md`

2. **Get rough input** (if not provided inline):
   - Use AskUserQuestion: "What should Screen {N} do? Describe the screen, its purpose, inputs, and any conditional behavior."

3. **Run Cass as a subagent** with this prompt:
   ```
   You are Cass. Read and follow the instructions in agentinstructions/AGENT_Cass.md.

   Create a user story for Screen {N} based on this input:
   {rough_input}

   Additional context:
   - Read agentcontext/ files for project context
   - Read existing user stories in businessArtifacts/userstories/ for format reference
   - Follow the user story template in your instructions

   Output the user story to: businessArtifacts/userstories/screen{N}.txt

   When complete, summarize:
   - Screen title
   - Number of acceptance criteria
   - Key behaviors
   - Any assumptions made
   ```

4. **On success**:
   - Remove from `cassQueue`
   - Add to `nigelQueue`
   - Update queue file

5. **On failure**:
   - Ask user for guidance: "Cass encountered an issue: {error}. How should I proceed? (retry / skip / abort)"

6. **Check pause gate**: If `--pause-after=cass`, pause and ask: "Cass has completed Screen {N}. Review the user story at businessArtifacts/userstories/screen{N}.txt. Continue to Nigel?"

### Step 5: Run Nigel (Tester)

For each screen in `nigelQueue`:

1. **Read agent instructions**: `agentinstructions/AGENT_TESTER.md`

2. **Run Nigel as a subagent** with this prompt:
   ```
   You are Nigel. Read and follow the instructions in agentinstructions/AGENT_TESTER.md.

   Create tests for Screen {N}.

   Inputs:
   - User story: businessArtifacts/userstories/screen{N}.txt
   - Existing test patterns: prototype/test/artifacts/ and prototype/test/routes/
   - Session helper: prototype/test/helpers/sessionHelper.js

   Outputs required:
   1. Test artifacts in prototype/test/artifacts/screen{N}/
      - understanding.md
      - test-plan.md
      - test-behaviour-matrix.md
      - implementation-guide.md
   2. Executable tests in prototype/test/routes/{screenName}.test.js
   3. Navigation helper added to prototype/test/helpers/sessionHelper.js

   Follow the Q1-Q6 clarification pattern from existing artifacts.
   Follow the test patterns established in existing test files.

   When complete, summarize:
   - Number of tests created
   - Test file location
   - Navigation helper name
   - Any assumptions or questions for Steve
   ```

3. **On success**:
   - Remove from `nigelQueue`
   - Add to `claudeQueue`
   - Update queue file

4. **On failure**:
   - Ask user for guidance

5. **Check pause gate**: If `--pause-after=nigel`, pause and ask: "Nigel has completed tests for Screen {N}. Review artifacts at prototype/test/artifacts/screen{N}/. Continue to Claude?"

### Step 6: Run Claude - Create Implementation Plan

For each screen in `claudeQueue`:

1. **Read agent instructions**: `agentinstructions/AGENT_Developer.md`

2. **Run Claude as a subagent** to create the plan:
   ```
   You are Claude the Developer. Read and follow the instructions in agentinstructions/AGENT_Developer.md.

   Create an implementation plan for Screen {N}.

   Inputs to review:
   - User story: businessArtifacts/userstories/screen{N}.txt
   - Test artifacts: prototype/test/artifacts/screen{N}/
   - Executable tests: prototype/test/routes/{screenName}.test.js
   - Implementation guide: prototype/test/artifacts/screen{N}/implementation-guide.md
   - Existing routes: prototype/src/routes/claims.js
   - Existing templates: prototype/src/views/pages/claims/

   Create a plan file at: plans/screen{N}-plan.md

   The plan should include:

   ## Screen {N} Implementation Plan

   ### Summary
   - Screen title and purpose
   - Route: GET/POST /claims/{route-name}

   ### Understanding
   - Key behaviors from user story
   - Test count and coverage areas

   ### Files to Create/Modify
   - List each file with brief description of changes

   ### Implementation Steps
   1. [Numbered steps in order of execution]
   2. ...

   ### Session Data
   - Session keys to read
   - Session keys to write

   ### Validation Rules
   - List validation rules to implement

   ### Template Components
   - GOV.UK components needed
   - Conditional reveals
   - Error handling

   ### Risks / Questions
   - Any ambiguities or concerns

   ### Definition of Done
   - [ ] All {X} tests passing
   - [ ] Lint passing
   - [ ] Route accessible at /claims/{route-name}
   - [ ] Previous/Continue/Cancel navigation working

   Do NOT implement yet - just create the plan.
   ```

3. **Check pause gate**: If `--pause-after=claude-plan`, pause and ask: "Claude has created an implementation plan for Screen {N}. Review at plans/screen{N}-plan.md. Continue to implementation?"

### Step 7: Run Claude - Implement

Continue with implementation:

1. **Run Claude as a subagent** to implement:
   ```
   You are Claude the Developer. Read and follow the instructions in agentinstructions/AGENT_Developer.md.

   Implement Screen {N} according to the plan.

   Inputs:
   - Implementation plan: plans/screen{N}-plan.md
   - User story: businessArtifacts/userstories/screen{N}.txt
   - Test artifacts: prototype/test/artifacts/screen{N}/
   - Executable tests: prototype/test/routes/{screenName}.test.js
   - Implementation guide: prototype/test/artifacts/screen{N}/implementation-guide.md

   Process:
   1. Follow the plan step by step
   2. Run baseline tests (expect failures)
   3. Implement routes in prototype/src/routes/claims.js
   4. Create template in prototype/src/views/pages/claims/
   5. Run tests until all pass
   6. Run lint and fix any issues

   Output:
   - Working implementation with all tests passing
   - Summary of changes made
   - Any deviations from the plan

   Do NOT commit - that will be handled separately.
   ```

2. **Run tests to verify**: `cd prototype && npm test`

3. **On success (all tests pass)**:
   - Remove from `claudeQueue`
   - Add to `completed`
   - Update queue file
   - If `--no-commit` NOT set, proceed to commit

4. **On failure**:
   - Ask user for guidance: "Claude's implementation has failing tests. {test_output}. How should I proceed? (retry / fix specific issue / abort)"

### Step 8: Auto-commit (unless --no-commit)

If tests pass and `--no-commit` not set:

1. Stage relevant files:
   ```bash
   git add businessArtifacts/userstories/screen{N}.txt
   git add prototype/test/artifacts/screen{N}/
   git add prototype/test/routes/{screenName}.test.js
   git add prototype/test/helpers/sessionHelper.js
   git add prototype/src/routes/claims.js
   git add prototype/src/views/pages/claims/{screen-name}.njk
   git add plans/screen{N}-plan.md
   ```

2. Commit with message:
   ```
   Add Screen {N} {Title} implementation

   - User story by Cass
   - Tests by Nigel ({X} tests)
   - Plan and implementation by Claude

   Co-Authored-By: Claude <noreply@anthropic.com>
   ```

### Step 9: Report Status

After pipeline completes (or on abort), report:

```
## Pipeline Status

### Completed
- Screen 26: Housing Act Selection (45 tests, committed abc123)

### In Progress
- Screen 27: Nigel creating tests

### Queued
- Screen 28: Waiting for Cass

### Failed
- None

### Next Action
Pipeline complete. Run `npm test` to verify, or `/implement-feature` for next screen.
```

---

## Queue File Structure

Location: `.claude/implement-queue.json`

```json
{
  "lastUpdated": "2026-01-28T10:30:00Z",
  "cassQueue": [
    {
      "screenNumber": 28,
      "roughInput": "Screen for document upload",
      "addedAt": "2026-01-28T10:30:00Z"
    }
  ],
  "nigelQueue": [
    {
      "screenNumber": 27,
      "userStoryPath": "businessArtifacts/userstories/screen27.txt",
      "addedAt": "2026-01-28T10:25:00Z"
    }
  ],
  "claudeQueue": [
    {
      "screenNumber": 26,
      "testArtifactsPath": "prototype/test/artifacts/screen26/",
      "testFilePath": "prototype/test/routes/housingActSelection.test.js",
      "planPath": "plans/screen26-plan.md",
      "addedAt": "2026-01-28T10:20:00Z"
    }
  ],
  "completed": [
    {
      "screenNumber": 25,
      "title": "Defendant's Circumstances",
      "testCount": 28,
      "commitHash": "db259a5",
      "completedAt": "2026-01-28T09:00:00Z"
    }
  ],
  "failed": []
}
```

---

## Plan File Template

Location: `plans/screen{N}-plan.md`

```markdown
# Screen {N} Implementation Plan

**Created:** {timestamp}
**Screen:** {title}
**Route:** `/claims/{route-name}`

---

## Summary

{Brief description of screen purpose}

---

## Understanding

- {Key behavior 1}
- {Key behavior 2}
- Test count: {X} tests

---

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `prototype/src/routes/claims.js` | Modify | Add GET/POST routes |
| `prototype/src/views/pages/claims/{name}.njk` | Create | New template |

---

## Implementation Steps

1. Add GET route handler
2. Create Nunjucks template
3. Add POST route with validation
4. Implement session persistence
5. Add navigation (Previous/Continue/Cancel)
6. Run tests and fix failures

---

## Session Data

**Read:**
- `session.claim.{field}` - {description}

**Write:**
- `session.claim.{field}` - {description}

---

## Validation Rules

- {Field}: {Rule}

---

## Template Components

- govukRadios / govukInput / etc.
- Conditional reveal: {description}
- Error summary and inline errors

---

## Risks / Questions

- {Any concerns}

---

## Definition of Done

- [ ] All {X} tests passing
- [ ] Lint passing
- [ ] Route accessible
- [ ] Navigation working
```

---

## Error Recovery

If the pipeline is interrupted (session ends, error occurs):

1. Run `/implement-feature` again
2. Skill reads queue file and resumes from where it left off
3. Report: "Resuming pipeline. Nigel queue: 1, Claude queue: 1. Continue?"

---

## Agent Instructions Reference

- Cass: `agentinstructions/AGENT_Cass.md`
- Nigel: `agentinstructions/AGENT_TESTER.md`
- Claude: `agentinstructions/AGENT_Developer.md`
- Ritual: `agentinstructions/DEVELOPMENT_RITUAL.md`

---

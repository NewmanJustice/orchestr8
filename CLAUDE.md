# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Run tests (Node.js built-in test runner)
node --test

# Run CLI locally during development
node bin/cli.js <command>

# Test initialization in another directory
cd /tmp/test-project && node /workspaces/agent-workflow/bin/cli.js init
```

## Architecture

orchestr8 is a multi-agent workflow framework that coordinates four AI agents (Alex, Cass, Nigel, Codey) to automate feature development from specification to implementation.

### Source Structure

- `bin/cli.js` - CLI entry point, routes commands to `src/` modules
- `src/index.js` - Main exports (init, update, skills)
- `src/init.js` - Copies `.blueprint/`, `.business_context/`, and SKILL.md to target project; installs skills to `.claude/commands/`
- `src/update.js` - Updates framework files while preserving user content in `features/` and `system_specification/`
- `src/skills.js` - Manages optional skills from skills.sh ecosystem per agent
- `src/orchestrator.js` - Queue management for the pipeline (`.claude/implement-queue.json`)

### Bundled Assets

- `.blueprint/agents/` - Agent specifications (AGENT_*.md) defining each agent's role and behavior
- `.blueprint/templates/` - SYSTEM_SPEC.md and FEATURE_SPEC.md templates
- `.blueprint/ways_of_working/` - Development rituals
- `.business_context/` - Placeholder for business context documents
- `SKILL.md` - The `/implement-feature` skill definition (copied to `.claude/commands/` on init)

### Pipeline Flow

The `/implement-feature` skill spawns agents sequentially via Task tool sub-agents:

```
Alex (feature spec) → Cass (user stories) → Nigel (tests) → Codey (implementation) → Auto-commit
```

Queue state is persisted to `.claude/implement-queue.json` for recovery on failure.

## Key Patterns

- User content directories (`features/`, `system_specification/`) are preserved during `update`
- Framework directories (`agents/`, `templates/`, `ways_of_working/`) are replaced during `update`
- The queue file is gitignored by `init`

# Feature Specification — Split CLI Commands

## 1. Feature Intent
**Why this feature exists.**

- `bin/cli.js` is 437 lines and growing — difficult to navigate and maintain
- Command logic is mixed with routing, flag parsing, and help text
- Adding new commands requires editing one large file
- Supports modular architecture and separation of concerns

> Technical refactoring feature — no user-facing behaviour change.

---

## 2. Scope
### In Scope
- Extract each command handler to `src/commands/<command>.js`
- Reduce `bin/cli.js` to a thin router (~50-80 lines)
- Preserve all existing CLI behaviour exactly
- Maintain backward compatibility with all command aliases

### Out of Scope
- Adding new commands
- Changing command syntax or flags
- Modifying help text content (only moving it)
- Performance optimizations

---

## 3. Actors Involved
**Who interacts with this feature.**

- **Developer**: Edits individual command files instead of monolithic cli.js
- **CLI User**: No change in experience — all commands work identically

---

## 4. Behaviour Overview
**What the feature does, conceptually.**

- `bin/cli.js` becomes a router that:
  1. Parses the command name from `process.argv`
  2. Dynamically loads the appropriate handler from `src/commands/`
  3. Passes args and invokes the handler
  4. Handles errors and exit codes

- Each `src/commands/<name>.js` exports:
  - `run(args)` — the command handler
  - `description` — short description for help
  - `help()` — detailed help text (optional)

---

## 5. State & Lifecycle Interactions
**How this feature touches the system lifecycle.**

- No state changes — pure refactoring
- File system structure changes only
- No runtime behaviour differences

---

## 6. Rules & Decision Logic
**New or exercised rules.**

| Rule | Description |
|------|-------------|
| Command mapping | Command name maps to `src/commands/<name>.js` |
| Alias resolution | Aliases (murm/parallel/murmuration) resolve before loading |
| Flag parsing | Remains in individual command handlers, not centralized |
| Error handling | Each command handles its own errors; router catches unhandled |

---

## 7. Dependencies
**What this feature relies on.**

- Node.js `require()` for dynamic loading
- Existing module structure in `src/`
- No external dependencies added

---

## 8. Non-Functional Considerations

- **Startup time**: Lazy loading commands means faster startup for simple commands
- **Testability**: Individual command files are easier to unit test
- **Maintainability**: Clear ownership of each command

---

## 9. Assumptions & Open Questions

**Assumptions:**
- All commands can be cleanly extracted without shared state
- The `parseFlags()` helper can remain in cli.js or move to a utility

**Open Questions:**
- Should `parseFlags()` move to `src/utils.js` or stay in cli.js?
- Should command files include their own validation or use a shared validator?

---

## 10. Impact on System Specification

- No impact — internal refactoring only
- Does not change system boundaries or behaviour

---

## 11. Handover to BA (Cass)

**Skip Cass stage** — this is a technical refactoring feature with no user stories needed.

Direct handover to Nigel for test creation:
- Tests should verify all commands still work after extraction
- Tests should verify help output is unchanged
- Tests should verify error handling is preserved

---

## 12. Change Log (Feature-Level)
| Date | Change | Reason | Raised By |
|------|--------|--------|-----------|
| 2026-03-03 | Initial spec | Technical debt reduction | Alex |

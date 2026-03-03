# Feature Specification — Config Factory

## 1. Feature Intent
**Why this feature exists.**

- Four config modules (retry, feedback, murm, stack) share identical patterns
- Each implements: `getDefaultConfig()`, `readConfig()`, `writeConfig()`, `displayConfig()`, `setConfigValue()`, `resetConfig()`
- ~80 lines of boilerplate duplicated 4 times (~320 lines total)
- Inconsistent validation and error handling across modules
- Adding a new config module requires copying boilerplate

> Technical refactoring feature — consolidate to a factory pattern.

---

## 2. Scope
### In Scope
- Create `src/config-factory.js` with `createConfigModule(options)` factory
- Refactor retry.js, feedback.js, stack.js to use the factory
- Refactor murm.js config functions to use the factory
- Standardize validation, error messages, and display formatting
- Preserve all existing config behaviour exactly

### Out of Scope
- Adding new config modules
- Changing config file locations or formats
- Modifying default values
- Adding new config keys

---

## 3. Actors Involved
**Who interacts with this feature.**

- **Developer**: Creates new config modules with minimal boilerplate
- **CLI User**: No change in experience — all config commands work identically

---

## 4. Behaviour Overview
**What the feature does, conceptually.**

The factory creates a config module with standard methods:

```javascript
const myConfig = createConfigModule({
  name: 'my-config',
  file: '.claude/my-config.json',
  defaults: { key1: 'value1', key2: 42 },
  validators: {
    key1: (v) => typeof v === 'string',
    key2: (v) => Number.isInteger(v) && v > 0
  },
  formatters: {
    key2: (v) => `${v} items`
  }
});

// Returns: { read, write, reset, display, setValue, getDefault, CONFIG_FILE }
```

Each existing config module becomes a thin wrapper calling the factory.

---

## 5. State & Lifecycle Interactions
**How this feature touches the system lifecycle.**

- No state changes — pure refactoring
- Config files remain in same locations
- No runtime behaviour differences

---

## 6. Rules & Decision Logic
**New or exercised rules.**

| Rule | Description |
|------|-------------|
| Default merging | Factory merges missing keys from defaults on read |
| Validation | Factory validates values before write using validators map |
| Display format | Factory uses formatters map or falls back to default display |
| Error messages | Standardized format: `Invalid value for {key}: {value}. {reason}` |
| Array handling | Arrays validated and displayed consistently (JSON parse for set) |

---

## 7. Dependencies
**What this feature relies on.**

- Node.js `fs` module (already used)
- No new external dependencies

---

## 8. Non-Functional Considerations

- **Code reduction**: ~200+ lines removed across 4 modules
- **Consistency**: Identical error messages and validation across all configs
- **Extensibility**: New config modules require ~10 lines instead of ~80

---

## 9. Assumptions & Open Questions

**Assumptions:**
- All four config modules can use the same factory pattern
- Specialized validation (like feedback's issueMappings) can be handled via validators

**Open Questions:**
- Should murm.js config functions be split to a separate file or remain inline?
- Should the factory support nested config objects (like retry's `strategies`)?

---

## 10. Impact on System Specification

- No impact — internal refactoring only
- Public APIs of all config modules remain unchanged

---

## 11. Handover to BA (Cass)

**Skip Cass stage** — this is a technical refactoring feature with no user stories needed.

Direct handover to Nigel for test creation:
- Tests should verify all config commands work after refactoring
- Tests should verify validation errors are consistent
- Tests should verify display output format is preserved
- Tests should verify default values are unchanged

---

## 12. Change Log (Feature-Level)
| Date | Change | Reason | Raised By |
|------|--------|--------|-----------|
| 2026-03-03 | Initial spec | DRY up config modules | Alex |

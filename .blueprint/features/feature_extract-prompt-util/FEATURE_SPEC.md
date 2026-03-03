# Feature Specification — Extract Prompt Utility

## 1. Feature Intent

The `prompt()` function is duplicated identically in `src/init.js` and `src/update.js`. Extract to a shared utility module to eliminate duplication and make the pattern reusable.

## 2. Scope

### In Scope
- Create `src/utils.js` with `prompt()` function
- Update `src/init.js` to import from utils.js
- Update `src/update.js` to import from utils.js
- Remove duplicate function definitions

### Out of Scope
- Adding new utility functions
- Changing prompt behavior
- Adding tests for prompt (interactive, hard to test)

## 3. Files to Modify

| File | Change |
|------|--------|
| `src/utils.js` | Create new file with prompt() |
| `src/init.js` | Remove prompt(), add import |
| `src/update.js` | Remove prompt(), add import |

## 4. Function Signature

```javascript
async function prompt(question) {
  // Creates readline interface
  // Asks question
  // Returns answer.toLowerCase().trim()
}
```

## 5. Change Log

| Date | Change | Reason | Raised By |
|------|--------|--------|-----------|
| 2026-03-03 | Initial spec | DRY refactoring | Alex |

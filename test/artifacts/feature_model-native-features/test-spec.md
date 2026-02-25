# Test Specification — Model Native Features

## Feature Understanding

This feature leverages Claude's native capabilities (system prompts, tool use, prompt caching) to improve token efficiency and reliability. Static agent context moves to system prompts, structured outputs use tool definitions instead of text parsing, and repeated context benefits from prompt caching. The goal is reduced token costs, elimination of JSON parsing errors, and faster responses.

## Derived Acceptance Criteria

| AC-ID | Acceptance Criteria |
|-------|---------------------|
| AC-01 | Tool schema defines feedback structure with rating (1-5), issues (array), recommendation (enum) |
| AC-02 | Tool schema includes handoff summary structure for agent transitions |
| AC-03 | System prompt contains static context (agent specs, guardrails) |
| AC-04 | User prompt contains dynamic context (task-specific instructions) |
| AC-05 | Prompt structure supports caching for repeated content |
| AC-06 | Tool response validates against schema (type checking, enum validation) |
| AC-07 | System/user prompt separation maintains functional equivalence to current approach |

## AC -> Test ID Mapping

| AC-ID | Test ID | Test Description |
|-------|---------|------------------|
| AC-01 | T01 | Feedback tool schema has required properties and constraints |
| AC-01 | T02 | Feedback tool schema validates input correctly |
| AC-02 | T03 | Handoff summary tool schema has required properties |
| AC-02 | T04 | Handoff summary validates agent name and summary fields |
| AC-03 | T05 | System prompt structure accepts static context |
| AC-04 | T06 | User prompt structure accepts dynamic task instructions |
| AC-05 | T07 | Prompt structure includes cache control markers |
| AC-05 | T08 | Cacheable content identified and grouped |
| AC-06 | T09 | Tool response validates rating bounds |
| AC-06 | T10 | Tool response validates recommendation enum |
| AC-06 | T11 | Tool response validates issues array type |
| AC-07 | T12 | System/user split produces equivalent functional output |

## Test Coverage Notes

- **Schema tests**: Tool definitions, property types, constraints
- **Prompt structure tests**: System vs user content separation
- **Caching tests**: Cache marker structure, cacheable content grouping
- **Validation tests**: Type checking, bounds, enum values
- **Integration tests**: Functional equivalence of native vs text approaches

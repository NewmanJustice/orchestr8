# Feature Specification — Model Native Features

## 1. Feature Intent
**Why this feature exists.**

- Claude and other LLMs have native features that are more token-efficient than text equivalents
- System prompts are processed differently than user messages (potentially lower cost)
- Tool use provides structured outputs without parsing overhead
- Leveraging these features can significantly reduce token usage and improve reliability

---

## 2. Scope
### In Scope
- Use system prompts for static agent context (specs, guardrails)
- Use tool definitions for structured outputs (feedback, handoff summaries)
- Investigate prompt caching for repeated context
- Document model-specific optimizations

### Out of Scope
- Changing pipeline logic
- Supporting multiple LLM providers (Claude-focused initially)
- Real-time model switching

---

## 3. Actors Involved

| Actor | Native Feature Usage |
|-------|---------------------|
| All Agents | System prompt for static context |
| All Agents | Tool use for structured outputs |
| Pipeline | Prompt caching for repeated context |

---

## 4. Behaviour Overview

### System Prompts for Static Context

**Current approach:**
```
User: You are Alex, the System Specification Agent.
Read your full specification from: .blueprint/agents/AGENT_SPECIFICATION_ALEX.md
...
```

**Native approach:**
```
System: [Agent spec content loaded here - potentially cached/cheaper]
User: Create a feature specification for "user-auth".
Inputs: ...
Outputs: ...
```

### Tool Use for Structured Outputs

**Current approach:**
```
Output your feedback as:
FEEDBACK: { "rating": N, "issues": [...], "recommendation": "..." }
```

**Native approach:**
```javascript
tools: [{
  name: "submit_feedback",
  description: "Submit quality rating for prior stage",
  input_schema: {
    type: "object",
    properties: {
      rating: { type: "number", minimum: 1, maximum: 5 },
      issues: { type: "array", items: { type: "string" } },
      recommendation: { enum: ["proceed", "pause", "revise"] }
    },
    required: ["rating", "issues", "recommendation"]
  }
}]
```

### Prompt Caching

- Cache static content (agent specs, guardrails, templates)
- Reduce repeated token transmission
- Leverage Claude's prompt caching feature when available

**Key outcomes:**
- Reduced token costs for static content
- More reliable structured outputs (no parsing errors)
- Faster responses with cached prompts

---

## 5. State & Lifecycle Interactions

- No pipeline state changes
- Tool responses integrated into existing feedback flow
- Caching is transparent to pipeline logic

---

## 6. Rules & Decision Logic

| Rule | Description |
|------|-------------|
| System prompt for static | Agent specs, guardrails go in system prompt |
| User prompt for dynamic | Task-specific instructions in user message |
| Tools for structure | Any JSON output should use tool definitions |
| Cache when possible | Repeated context should leverage caching |

---

## 7. Dependencies

- Claude API access with system prompt support
- Tool use capability in Task tool
- Prompt caching feature (if available)
- SKILL.md restructured for system/user prompt split

---

## 8. Non-Functional Considerations

- **Performance:** Significant token reduction (system prompts may be cached/cheaper)
- **Reliability:** Tool use eliminates JSON parsing errors
- **Complexity:** Requires understanding model-specific features
- **Portability:** Optimizations may be Claude-specific

---

## 9. Assumptions & Open Questions

**Assumptions:**
- Task tool can be configured to use system prompts
- Tool definitions can be passed to sub-agents
- Prompt caching provides meaningful savings

**Open Questions:**
- How does Task tool handle system prompts currently?
- What's the actual cost difference for system vs user tokens?
- Is prompt caching available and how is it triggered?
- Should we abstract these features for multi-model support later?

---

## 10. Impact on System Specification

- Adds model-specific optimization layer
- May need to document Claude-specific features in system spec
- Consider portability implications if multi-model support is planned

---

## 11. Handover to BA (Cass)

**Story themes:**
- Investigate system prompt support in Task tool
- Restructure SKILL.md for system/user prompt split
- Define tool schemas for structured outputs (feedback, handoff)
- Implement tool-based feedback collection
- Investigate and document prompt caching

**Expected story boundaries:**
- One story for system prompt investigation and implementation
- One story for tool schema definitions
- One story for feedback tool integration
- One story for prompt caching investigation

---

## 12. Change Log (Feature-Level)
| Date | Change | Reason | Raised By |
|-----|------|--------|-----------|
| 2026-02-25 | Initial spec | Token efficiency improvement | Claude |

# TICKET_MODEL_CHOICE_PARAMETERS_STUDY

## Objective
Establish a reliable, repeatable process for selecting LLM models for OpenClaw workflows where model output drives application state.

This study is focused on protocol compliance, not just conversational quality.

## Why This Ticket Exists
Recent behavior showed that some lower-cost models failed to emit required control patterns (for example, title directives), even when prompted clearly. This caused downstream state updates to be skipped.

We need to answer:
1. Which model(s) meet required reliability for control-plane behaviors?
2. What model settings materially affect compliance?
3. How should we gate model changes before production rollout?

## Current Evidence (From Live Debugging)
Observed failed models:
1. `orouter/google/gemini-2.5-flash`
2. `orouter/openai/gpt-4o`
3. `orouter/openai/gpt-4o-mini`

Observed successful models:
1. `orouter/anthropic/claude-3-haiku`
2. `orouter/mistralai/mistral-large-2407`

Important finding:
Higher token cost did not imply higher protocol compliance for this workflow.

## Scope
In scope:
1. Model compliance with required output contracts used by the OpenClaw bridge.
2. Variance across repeated runs with same input.
3. Impact of settings such as temperature and max tokens.
4. Cost, latency, and reliability tradeoffs.

Out of scope:
1. Large UI redesign.
2. Replacing current architecture in this ticket.
3. Migrating all flows to structured output in this ticket.

## Working Hypotheses
1. Some models prioritize natural response quality over strict in-band control-tag compliance.
2. Output contract failures increase with longer context windows.
3. Lower temperature improves compliance but does not fully eliminate failures for some model families.
4. Provider routing and default settings can meaningfully change behavior even for similarly named models.

## Study Questions
1. What is per-model compliance rate for required tags and signals?
2. How much run-to-run variance exists for identical inputs?
3. Does compliance degrade with context length, attachment count, or conversation stage?
4. Which model gives best effective cost under required reliability threshold?

## Evaluation Design
### Test Set
Build a fixed fixture set representative of production prompts:
1. Short context, no attachments.
2. Medium context with prior turns.
3. Long context with multiple messages.
4. Cases where title should be set.
5. Cases where acceptance should and should not be signaled.

Target fixture count: 30 to 100 cases.

### Repetitions
Run each fixture multiple times per model to measure stochastic variance.

Minimum recommendation:
1. 5 runs for initial screening.
2. 10 to 20 runs for finalists.

### Candidate Models
Initial candidate list:
1. `orouter/anthropic/claude-3-haiku`
2. `orouter/mistralai/mistral-large-2407`
3. `orouter/openai/gpt-4o-mini`
4. `orouter/openai/gpt-4o`
5. `orouter/google/gemini-2.5-flash`

Add/remove as needed.

### Parameters To Sweep
1. `temperature` (for example: 0.0, 0.2, 0.5)
2. `max_tokens`
3. Any provider-specific reasoning or sampling options exposed by OpenRouter/OpenClaw

Keep one baseline config constant while sweeping one variable at a time.

## Metrics
### Reliability Metrics (Primary)
1. `set_title_tag_rate`: fraction of responses containing required title control tag when expected.
2. `acceptance_signal_rate`: fraction meeting acceptance signal requirements when expected.
3. `malformed_control_output_rate`: fraction with malformed or ambiguous control outputs.
4. `false_positive_control_rate`: control tags emitted when not expected.

### Performance and Cost Metrics (Secondary)
1. Median latency and p95 latency.
2. Input/output token usage.
3. Estimated cost per successful compliant response.

## Decision Criteria
Proposed reliability gate for production control-plane use:
1. `set_title_tag_rate >= 99%` on required cases.
2. `malformed_control_output_rate <= 0.5%`.
3. Stable behavior across repeated runs.

Among models that pass reliability gate, choose lowest effective cost.

## Effective Cost Model
Use a practical cost view instead of token price only:

`effective_cost = model_token_cost + retry_cost + debugging_cost + incident_risk_cost`

## Instrumentation Requirements
For each run, capture:
1. Model id.
2. Parameter set.
3. Prompt fingerprint.
4. Response fingerprint.
5. Contract checks (pass/fail per requirement).
6. Latency.
7. Token usage/cost.
8. Timestamp.

## Deliverables
1. Benchmark matrix (models x parameter sets x metrics).
2. Recommended production model and parameter profile.
3. Backup model for failover.
4. Go/no-go policy for future model swaps.
5. Short lessons learned note for team conventions.

## Execution Checklist
1. Build fixture set and expected outcomes.
2. Create runner script or notebook for repeated eval runs.
3. Run baseline benchmark with current model.
4. Run candidate model benchmarks.
5. Analyze reliability first, then cost/latency.
6. Select model profile and document rationale.
7. Add pre-deploy gate for future model changes.

## Risks
1. Hidden provider-side changes may shift behavior over time.
2. Passing synthetic tests may not fully predict production edge cases.
3. Cost estimates may drift with provider pricing updates.

Mitigation:
1. Keep fixtures versioned and rerun periodically.
2. Add canary checks in production logs.
3. Re-evaluate on major provider or model version changes.

## Open Questions
1. Should control tags remain in free text or move to structured outputs/tool calls?
2. What minimum reliability threshold is acceptable for this workflow?
3. Should different tasks use different model tiers?

## Notes
This ticket is intentionally designed as a research and policy task, not an immediate product change task.


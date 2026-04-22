# 503 Server Hardening Log

## Context
This log summarizes the internal backend hardening changes implemented after the initial request to reduce Gemini-related 503 errors without changing feature behavior.

## Date Range
- Started: 2026-04-21
- Scope: AI route and Gemini client stability hardening

## Objectives
- Reduce transient 503 amplification during provider instability
- Prevent duplicate/parallel request spikes from overloading AI calls
- Keep user-facing feature behavior unchanged

## Summary of Changes

### 1) Centralized Gemini execution path
- Moved the remaining direct Gemini SDK call out of the document extraction route and into the shared mission agent helper.
- Result: all active AI features now go through the shared Gemini client path.

Files:
- app/api/ai/extract-mission-from-document/route.ts
- lib/ai/missionAgent.ts

### 2) Safer retry policy with jitter & Model fallback
- Updated Gemini retry behavior to retry only transient failures.
- Added exponential backoff with jitter to avoid synchronized retry waves.
- Re-routed ultra-fast failing `gemini-2.5-flash` internal 503s queries sequentially to `gemini-2.5-flash-lite`, slowing them down over 1500+ms to break out of node-level overloading loops.
- Result: lower risk of retry storms, immediate mitigations for persistent infrastructure-side issues, and uninterrupted UI flows.

File:
- lib/ai/geminiClient.ts

### 3) In-process concurrency cap for Gemini calls
- Added a small shared concurrency limiter around Gemini generation.
- Result: bursty traffic is queued instead of overwhelming upstream calls.

File:
- lib/ai/geminiClient.ts

### 4) Request deduplication and short-lived caching for identical AI payloads
- Added in-flight deduplication for identical Gemini payloads.
- Added short TTL response cache for repeated identical requests.
- Result: repeated clicks/retries for the same payload avoid repeated provider calls.

File:
- lib/ai/geminiClient.ts

### 5) AI route-level rate limiting
- Added a shared AI route guard using existing in-memory rate-limit utilities.
- Applied to all current AI routes (including stubs) for consistent protection.

Files:
- lib/ai/routeGuards.ts
- app/api/ai/analyze-mission/route.ts
- app/api/ai/optimize-mission/route.ts
- app/api/ai/polish-before-publish/route.ts
- app/api/ai/form-assistant-chat/route.ts
- app/api/ai/extract-mission-from-url/route.ts
- app/api/ai/extract-mission-from-document/route.ts
- app/api/ai/suggest-field/route.ts
- app/api/ai/coherence-check/route.ts

### 6) Duplicate submit mitigation in pre-publish flow
- Fixed pre-publish submit path so submit remains locked while pre-publish AI request is in flight.
- Result: reduced duplicate requests from rapid clicks.

File:
- app/pages/CreerOpportunite.tsx

### 7) Build/type hardening follow-up
- Fixed Gemini SDK typing mismatch by aligning content parts with SDK type `Part`.
- Result: removes TS incompatibility at generateContent call sites.

File:
- lib/ai/geminiClient.ts

## Behavioral Impact
- No intended UX/feature change.
- Changes are internal reliability guardrails only:
  - retries made safer
  - concurrency bounded
  - duplicate work reduced
  - route spikes constrained

## Verification Notes
- Workspace diagnostics reported no file errors after changes.
- A full production build could not be confirmed in-session because build command execution was skipped by user selection during tool runs.

## Known Limits
- In-memory guards (rate limit/cache/dedupe/concurrency) are process-local.
- In multi-instance deployments, global coordination would require a shared store (for example Redis) for cross-instance limits/deduping.

## Related PR Context
- Branch: AISpellCheck+NewAIUI
- Active PR at time of logging: #6 ("Use Part type and simplify ContentPart")

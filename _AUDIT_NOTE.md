# Audit Note — AISalesTrainingSimulator

## Original audit recommendations (batch_07.md §22)

**Missing AI endpoints:** `/objection-database`, `/conversation-analysis`, `/competitive-intelligence`, `/deal-stage-progressor`.

**Missing non-AI features:** sales pipeline management, deal tracking, document repository, team performance analytics, sales enablement library.

**Custom suggestions:** real-time call coaching, post-call analysis, competitor battlecard generator, deal probability scorer, playbook learner, multi-persona negotiation simulation.

## Implemented this pass (3 mechanical)
1. `POST /api/ai/conversation-analysis` — transcript scoring across 6 dimensions, talk-ratio estimate, missed-opportunities, coaching actions; updates leaderboard.
2. `POST /api/ai/deal-stage-progressor` — stage-health, next-best-actions, champion mapping, win-probability, drafted messaging.
3. `POST /api/ai/competitive-intelligence` — competitor battle brief with rebuttals, trap questions, recommended proof assets.

All three reuse `callOpenRouter`, `parseAIJson`, `updateLeaderboard`, `auth`, `aiRateLimiter`. Syntax-checked.

## Backlog (prioritized)
1. `POST /api/ai/objection-database` (mechanical follow-up; learns from prior responses).
2. Sales pipeline / deal tracking domain models (mechanical; needs schema decision).
3. Document repository (mechanical, NEEDS storage decision).
4. Team performance analytics dashboard aggregator (mechanical follow-up).
5. Real-time live-call coaching (NEEDS-PRODUCT-DECISION + STT pipeline).

## Apply pass 3 (frontend)

LEFT-AS-IS. The three pass-2 endpoints already have dedicated client pages (`ConversationAnalysisPage.js`, `DealStageProgressorPage.js`, `CompetitiveIntelligencePage.js`), each wired through the shared axios `services/api.js` (JWT Bearer from localStorage) and registered under `/ai/...` routes in `client/src/App.js`. Server errors (incl. 503 no-key) propagate via toast. No FE files modified.

## Apply pass 6 (close-out)

Items handled:
1. `POST /api/ai/objection-database` — SKIPPED (already exists at `server/routes/ai.js:504` with a richer canonical-library shape from an earlier undocumented pass; appending a duplicate `router.post` at the same path would be dead code since Express matches the first registration only). The existing handler already supports learning from prior responses by loading recent `PitchPractice.aiFeedback` rows as context.
2. `GET /api/ai/team-analytics` — APPENDED (`server/routes/ai.js`). Parses `?period=NNd|w|m` (default 30d), accepts `?team_id` (reserved — no team column in current schema, returned in payload for forward-compat), aggregates `RolePlaySession`, `PitchPractice`, `LeaderboardEntry`, and `User` via Sequelize with `.catch(() => [])` fallbacks. Returns `{ period, team_id, window, per_rep, team_aggregate{avg_score, sessions_completed, pitches_completed, active_reps, top_strengths, top_gaps}, trends{direction, delta_points, recent_half_avg, prior_half_avg}, recommendations }`. Rule-based synthesis only (no LLM call) — keeps endpoint cheap and deterministic for a dashboard polling use-case; an LLM synthesis helper is not present at this layer and the existing `team-performance-analytics` POST already covers the LLM-narrative variant.

Files touched: `server/routes/ai.js` (append-only).
Syntax: PASS (`node --check server/routes/ai.js`).
Mount: already covered by `app.use('/api/ai', aiRoutes)` in `server/index.js:26` — no `index.js` edits.

Remaining backlog:
- NEEDS-SCHEMA: sales pipeline / deal tracking domain models (`DealSimulation` exists but is shallow — no stage history, no pipeline ownership, no forecast snapshots).
- NEEDS-STORAGE: document repository (no blob/object-store wiring; would need S3/local-fs decision + a `Document` model with binary refs).
- NEEDS-PRODUCT-DECISION: real-time live-call coaching + STT pipeline (vendor/self-host choice for streaming ASR, WebRTC ingest, latency budget, privacy posture).

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

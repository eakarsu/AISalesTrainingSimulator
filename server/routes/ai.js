const express = require('express');
const auth = require('../middleware/auth');
const { aiRateLimiter } = require('../middleware/rateLimiter');
const { callOpenRouter, parseAIJson } = require('../services/openrouter');
const {
  RolePlaySession, PitchPractice, LeaderboardEntry, CoachingPlan,
  MessageHistory, ProductKnowledge, BuyerPersona, User
} = require('../models');
const router = express.Router();

// Apply auth + rate limit to all AI routes
router.use(auth);
router.use(aiRateLimiter);

// Helper: extract numeric score from AI text
function extractScore(text) {
  if (!text) return null;
  const patterns = [
    /overall\s+(?:performance\s+)?score[:\s]+(\d+)/i,
    /scored?\s+(\d+)/i,
    /(\d+)\s*\/\s*100/,
    /score[:\s]+(\d+)/i,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) return Math.min(100, Math.max(0, parseInt(m[1])));
  }
  return null;
}

// Helper: upsert leaderboard entry
async function updateLeaderboard(userId, score) {
  if (!userId || score === null) return;
  try {
    const user = await User.findByPk(userId);
    if (!user) return;

    let entry = await LeaderboardEntry.findOne({ where: { userId } });
    if (entry) {
      const newTotal = (parseFloat(entry.totalScore || 0) * parseInt(entry.sessionsCompleted || 0) + score) / (parseInt(entry.sessionsCompleted || 0) + 1);
      await entry.update({
        totalScore: Math.round(newTotal * 10) / 10,
        sessionsCompleted: parseInt(entry.sessionsCompleted || 0) + 1,
        userName: user.name,
      });
    } else {
      await LeaderboardEntry.create({
        userId,
        userName: user.name,
        totalScore: score,
        sessionsCompleted: 1,
        winRate: score >= 70 ? 1 : 0,
        period: new Date().toISOString().substring(0, 7),
      });
    }
  } catch (err) {
    console.error('Leaderboard update error:', err.message);
  }
}

// POST /api/ai/roleplay - with session continuity
router.post('/roleplay', async (req, res) => {
  try {
    const { scenario, userMessage, buyerPersona, sessionId } = req.body;

    // Retrieve conversation history
    let history = [];
    if (sessionId) {
      const msgs = await MessageHistory.findAll({
        where: { sessionId },
        order: [['createdAt', 'ASC']],
      });
      history = msgs.map(m => ({ role: m.role, content: m.content }));
    }

    // DB grounding: inject relevant ProductKnowledge and BuyerPersona
    const products = await ProductKnowledge.findAll({ limit: 5 });
    const personas = await BuyerPersona.findAll({ limit: 3 });
    const productContext = products.length > 0
      ? `\n\nAvailable Products: ${products.map(p => `${p.productName}: ${p.description}`).join('; ')}`
      : '';
    const personaContext = personas.length > 0
      ? `\n\nBuyer Personas: ${personas.map(p => `${p.name} (${p.title}): ${p.painPoints}`).join('; ')}`
      : '';

    const systemContent = `You are an AI buyer persona for sales training. You are playing the role of: ${buyerPersona || 'a senior decision maker at a mid-market company'}.

Scenario: ${scenario || 'General sales meeting'}

Instructions:
- Stay in character as the buyer
- Present realistic objections and questions
- Be professional but challenging
- After 3-4 exchanges, add "---ASSESSMENT---" with scores: Rapport Building, Need Discovery, Value Proposition, Objection Handling (each out of 10) and Overall Score out of 100
${productContext}${personaContext}`;

    // Build messages array with history
    const messages = [
      { role: 'system', content: systemContent },
      ...history,
      { role: 'user', content: userMessage }
    ];

    const response = await callOpenRouter(null, null, { messages });

    // Save turn to message history
    if (sessionId) {
      await MessageHistory.create({ sessionId, role: 'user', content: userMessage });
      await MessageHistory.create({ sessionId, role: 'assistant', content: response });

      // Extract score and update session + leaderboard
      const score = extractScore(response);
      if (response.includes('---ASSESSMENT---') && score !== null) {
        await RolePlaySession.update(
          { transcript: response, score, status: 'completed', feedback: response },
          { where: { id: sessionId } }
        );
        await updateLeaderboard(req.user?.id, score);
      }
    }

    res.json({ response, sessionId, timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
});

// POST /api/ai/analyze-pitch - persist to PitchPractice
router.post('/analyze-pitch', async (req, res) => {
  try {
    const { pitchText, targetAudience, productName, pitchId } = req.body;
    const systemPrompt = `You are an expert sales coach analyzing a sales pitch. Return ONLY valid JSON, no markdown:
{
  "overall_score": 85,
  "scores": { "clarity": 8, "value_proposition": 9, "emotional_appeal": 7, "call_to_action": 8, "credibility": 7, "audience_fit": 9 },
  "strengths": ["...", "...", "..."],
  "improvements": ["...", "...", "..."],
  "improved_pitch": "...",
  "key_talking_points": ["..."]
}`;

    const response = await callOpenRouter(systemPrompt, `Product: ${productName || 'Not specified'}\nAudience: ${targetAudience || 'General'}\n\nPitch:\n${pitchText}`);

    let parsed;
    try { parsed = parseAIJson(response); } catch (_) { parsed = { summary: response, overall_score: 0 }; }

    // Persist to PitchPractice if pitchId provided
    if (pitchId) {
      await PitchPractice.update(
        { aiFeedback: JSON.stringify(parsed), score: parsed.overall_score, status: 'reviewed' },
        { where: { id: pitchId } }
      );
    }

    // Update leaderboard if score found
    if (parsed.overall_score) {
      await updateLeaderboard(req.user?.id, parsed.overall_score);
    }

    res.json({ analysis: parsed, timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
});

// POST /api/ai/handle-objection
router.post('/handle-objection', async (req, res) => {
  try {
    const { objection, context, industry } = req.body;
    const systemPrompt = `You are an expert sales trainer specializing in objection handling. Return ONLY valid JSON:
{
  "underlying_concern": "...",
  "acknowledge": "...",
  "bridge": "...",
  "response_options": { "conservative": "...", "balanced": "...", "bold": "..." },
  "follow_up_questions": ["...", "..."],
  "what_not_to_say": ["...", "..."],
  "practice_script": "..."
}`;
    const response = await callOpenRouter(systemPrompt, `Industry: ${industry || 'General'}\nContext: ${context || 'None'}\nObjection: "${objection}"`);
    let parsed;
    try { parsed = parseAIJson(response); } catch (_) { parsed = { summary: response }; }
    res.json({ response: parsed, timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
});

// POST /api/ai/generate-email
router.post('/generate-email', async (req, res) => {
  try {
    const { emailType, context, recipientInfo, tone } = req.body;
    const systemPrompt = `You are an expert sales email copywriter. Return ONLY valid JSON:
{
  "subject_lines": ["...", "...", "..."],
  "email_body": "...",
  "key_elements": ["..."],
  "short_version": "...",
  "best_send_time": "...",
  "follow_up_sequence": ["...", "...", "..."]
}`;
    const response = await callOpenRouter(systemPrompt, `Type: ${emailType || 'Cold Outreach'}\nTone: ${tone || 'Professional'}\nRecipient: ${recipientInfo || 'Decision maker'}\nContext: ${context || 'Initial outreach'}`);
    let parsed;
    try { parsed = parseAIJson(response); } catch (_) { parsed = { email_body: response }; }
    res.json({ email: parsed, timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
});

// POST /api/ai/generate-script
router.post('/generate-script', async (req, res) => {
  try {
    const { scriptType, industry, targetRole, objective } = req.body;
    const systemPrompt = `You are an expert sales script writer. Return ONLY valid JSON:
{
  "opening": "...",
  "permission_to_continue": "...",
  "value_statement": "...",
  "discovery_questions": ["..."],
  "objection_handles": [{ "objection": "...", "response": "..." }],
  "close": "...",
  "voicemail_version": "...",
  "tips": ["..."]
}`;
    const response = await callOpenRouter(systemPrompt, `Type: ${scriptType || 'Cold Call'}\nIndustry: ${industry || 'Technology'}\nRole: ${targetRole || 'Decision Maker'}\nObjective: ${objective || 'Book a meeting'}`);
    let parsed;
    try { parsed = parseAIJson(response); } catch (_) { parsed = { summary: response }; }
    res.json({ script: parsed, timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
});

// POST /api/ai/deal-strategy
router.post('/deal-strategy', async (req, res) => {
  try {
    const { dealInfo, challenges, stakeholders } = req.body;
    const systemPrompt = `You are a strategic sales advisor. Return ONLY valid JSON:
{
  "deal_health_score": 7,
  "risks": [{ "risk": "...", "mitigation": "..." }],
  "stakeholder_strategy": [{ "stakeholder": "...", "approach": "..." }],
  "next_steps": ["..."],
  "competitive_strategy": "...",
  "closing_strategy": "...",
  "timeline": "...",
  "red_flags": ["..."]
}`;
    const response = await callOpenRouter(systemPrompt, `Deal: ${dealInfo || 'Enterprise deal'}\nChallenges: ${challenges || 'None'}\nStakeholders: ${stakeholders || 'Not mapped'}`);
    let parsed;
    try { parsed = parseAIJson(response); } catch (_) { parsed = { summary: response }; }
    res.json({ strategy: parsed, timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
});

// POST /api/ai/coaching-feedback
router.post('/coaching-feedback', async (req, res) => {
  try {
    const { transcript, context } = req.body;
    const systemPrompt = `You are an expert sales coach. Return ONLY valid JSON:
{
  "overall_score": 78,
  "scorecard": { "rapport_building": 8, "discovery_quality": 7, "value_articulation": 8, "objection_handling": 7, "closing_technique": 7, "active_listening": 9 },
  "things_done_well": ["...", "...", "..."],
  "areas_to_improve": ["...", "...", "..."],
  "key_moments": ["..."],
  "recommended_training": ["..."],
  "rewrite_suggestion": "..."
}`;
    const response = await callOpenRouter(systemPrompt, `Context: ${context || 'Sales call'}\n\nTranscript:\n${transcript}`);
    let parsed;
    try { parsed = parseAIJson(response); } catch (_) { parsed = { summary: response }; }

    // Update leaderboard
    if (parsed.overall_score) {
      await updateLeaderboard(req.user?.id, parsed.overall_score);
    }

    res.json({ feedback: parsed, timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
});

// POST /api/ai/generate-battlecard - with DB grounding
router.post('/generate-battlecard', async (req, res) => {
  try {
    const { competitorName, ourProduct, industry } = req.body;

    // DB grounding: get our product knowledge
    const products = await ProductKnowledge.findAll({ limit: 10 });
    const productContext = products.length > 0
      ? `\nOur Products from DB: ${products.map(p => `${p.productName}: ${p.competitiveAdvantage}`).join('; ')}`
      : '';

    const systemPrompt = `You are a competitive intelligence analyst. Return ONLY valid JSON:
{
  "competitor_overview": "...",
  "their_strengths": ["..."],
  "their_weaknesses": ["..."],
  "our_advantages": ["..."],
  "landmine_questions": ["..."],
  "counter_arguments": [{ "objection": "...", "response": "..." }],
  "pricing_intelligence": "...",
  "quick_response": "..."
}`;
    const response = await callOpenRouter(systemPrompt, `Competitor: ${competitorName}\nOur Product: ${ourProduct || 'AI Sales Training Platform'}\nIndustry: ${industry || 'Sales Technology'}${productContext}`);
    let parsed;
    try { parsed = parseAIJson(response); } catch (_) { parsed = { summary: response }; }
    res.json({ battlecard: parsed, timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
});

// POST /api/ai/simulate-persona - with DB grounding
router.post('/simulate-persona', async (req, res) => {
  try {
    const { personaInfo, question, personaId } = req.body;

    // DB grounding: get specific persona if personaId provided
    let personaData = personaInfo;
    if (personaId) {
      const persona = await BuyerPersona.findByPk(personaId);
      if (persona) {
        personaData = `${persona.name} (${persona.title} at ${persona.company}): Pain points: ${persona.painPoints}. Motivations: ${persona.motivations}. Communication style: ${persona.communicationStyle}`;
      }
    }

    const systemPrompt = `You are simulating a buyer persona for sales training. Persona: ${personaData || 'Senior executive at mid-market company'}. Stay completely in character.`;
    const response = await callOpenRouter(systemPrompt, question || 'Tell me about your current challenges');
    res.json({ response, timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
});

// POST /api/ai/negotiation-coach
router.post('/negotiation-coach', async (req, res) => {
  try {
    const { situation, theirPosition, ourPosition } = req.body;
    const systemPrompt = `You are an expert negotiation coach. Return ONLY valid JSON:
{
  "situation_assessment": "...",
  "their_batna": "...",
  "power_analysis": "...",
  "recommended_strategy": ["..."],
  "tactics": ["..."],
  "what_to_say": ["..."],
  "what_to_avoid": ["..."],
  "best_case": "...",
  "worst_case": "...",
  "walk_away_point": "..."
}`;
    const response = await callOpenRouter(systemPrompt, `Situation: ${situation}\nTheir position: ${theirPosition || 'N/A'}\nOur position: ${ourPosition || 'N/A'}`);
    let parsed;
    try { parsed = parseAIJson(response); } catch (_) { parsed = { summary: response }; }
    res.json({ advice: parsed, timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
});

// POST /api/ai/generate-coaching-plans - weekly batch
router.post('/generate-coaching-plans', async (req, res) => {
  try {
    const users = await User.findAll({ limit: 20 });
    const plans = [];

    for (const user of users) {
      // Get last 5 sessions with scores
      const sessions = await RolePlaySession.findAll({
        where: { userId: user.id },
        order: [['createdAt', 'DESC']],
        limit: 5,
      });

      const scores = sessions.filter(s => s.score).map(s => s.score);
      if (scores.length === 0) continue;

      const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;

      const systemPrompt = `You are a sales coaching AI. Return ONLY valid JSON:
{
  "goals": "...",
  "weakest_areas": ["..."],
  "milestones": ["..."],
  "weekly_actions": ["..."],
  "recommended_modules": ["..."]
}`;
      const response = await callOpenRouter(systemPrompt,
        `Sales rep: ${user.name}\nAverage score: ${avgScore.toFixed(1)}/100\nSession scores: ${scores.join(', ')}\nSessions reviewed: ${sessions.length}`
      );

      let parsed;
      try { parsed = parseAIJson(response); } catch (_) { parsed = { goals: response }; }

      // Create CoachingPlan in DB
      const plan = await CoachingPlan.create({
        title: `AI Coaching Plan - ${user.name} - ${new Date().toISOString().substring(0, 10)}`,
        userId: user.id,
        goals: parsed.goals || '',
        milestones: JSON.stringify(parsed.milestones || []),
        currentPhase: 'Week 1',
        startDate: new Date().toISOString().substring(0, 10),
        status: 'active',
      });

      plans.push({ user: user.name, plan, ai_analysis: parsed });
    }

    res.json({ coaching_plans: plans, total: plans.length });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
});

// POST /api/ai/conversation-analysis — score a transcript on rapport, discovery, objection handling
router.post('/conversation-analysis', async (req, res) => {
  try {
    const { transcript, dealContext, repName } = req.body || {};
    if (!transcript || !transcript.trim()) return res.status(400).json({ error: 'transcript is required' });
    const systemPrompt = `You are an elite sales-call analyst. Analyse the transcript across rapport, discovery, value framing, objection handling, next-step setting. Return ONLY valid JSON:
{
  "overall_score": 0-100,
  "dimensions": {
    "rapport": 0-100, "discovery": 0-100, "value_framing": 0-100,
    "objection_handling": 0-100, "next_step_close": 0-100, "active_listening": 0-100
  },
  "talk_listen_ratio_estimate": "rep:client",
  "filler_word_count_estimate": 0,
  "buying_signals": [], "warning_signals": [],
  "missed_opportunities": [{"moment": "", "why_it_matters": ""}],
  "coaching_actions": [{"focus_area": "", "drill": ""}],
  "next_step_recommendation": "",
  "summary": ""
}`;
    const response = await callOpenRouter(systemPrompt, `Rep: ${repName || 'unknown'}\nDeal: ${JSON.stringify(dealContext || {})}\n\nTranscript:\n${transcript}`);
    const parsed = parseAIJson(response) || { raw: response };
    if (parsed.overall_score) await updateLeaderboard(req.user?.id, parsed.overall_score);
    res.json({ analysis: parsed });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
});

// POST /api/ai/deal-stage-progressor — recommend next steps to advance a deal
router.post('/deal-stage-progressor', async (req, res) => {
  try {
    const { deal, lastTouches } = req.body || {};
    if (!deal) return res.status(400).json({ error: 'deal is required' });
    const systemPrompt = `You are a B2B deal strategist. Given a deal record + last touches, recommend the highest-leverage next moves. Return ONLY JSON:
{
  "current_stage": "",
  "stage_health_score": 0-100,
  "stuck_risks": [],
  "next_best_actions": [{"action": "", "owner": "rep|am|se|exec", "priority": 1-5, "expected_impact": "", "evidence_needed": ""}],
  "champions_to_engage": [],
  "decision_makers_to_engage": [],
  "missing_qualification": [],
  "win_probability_estimate": 0-1,
  "forecasted_close_date": "",
  "recommended_messaging": [{"to": "", "channel": "email|call|inmail", "draft": ""}]
}`;
    const response = await callOpenRouter(systemPrompt, `Deal:\n${JSON.stringify(deal, null, 2)}\n\nLast touches:\n${JSON.stringify(lastTouches || [])}`);
    const parsed = parseAIJson(response) || { raw: response };
    res.json({ progression: parsed });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
});

// POST /api/ai/competitive-intelligence — generate competitor positioning brief
router.post('/competitive-intelligence', async (req, res) => {
  try {
    const { competitor, ownProduct, dealContext } = req.body || {};
    if (!competitor) return res.status(400).json({ error: 'competitor is required' });
    const systemPrompt = `You are a competitive-intelligence analyst. Build a sharp battle brief that helps a rep win against this competitor. Return ONLY JSON:
{
  "competitor": "",
  "their_positioning": "",
  "their_strengths": [], "their_weaknesses": [],
  "where_we_win": [{"point": "", "evidence": ""}],
  "where_we_lose": [{"point": "", "mitigation": ""}],
  "objection_rebuttals": [{"objection": "", "response": ""}],
  "trap_questions_to_ask_buyer": [],
  "pricing_dynamics": "",
  "common_traps_to_avoid": [],
  "recommended_proof_assets": [],
  "summary": ""
}`;
    const response = await callOpenRouter(systemPrompt, `Competitor: ${typeof competitor === 'string' ? competitor : JSON.stringify(competitor)}\n\nOur product:\n${JSON.stringify(ownProduct || {})}\n\nDeal context:\n${JSON.stringify(dealContext || {})}`);
    const parsed = parseAIJson(response) || { raw: response };
    res.json({ intel: parsed });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
});

// POST /api/ai/objection-database — generate canonical objection responses (audit backlog)
router.post('/objection-database', async (req, res) => {
  try {
    const { product, industry, dealStage, knownObjections, persona } = req.body || {};
    if (!product) return res.status(400).json({ error: 'product is required' });

    const priorPitches = await PitchPractice.findAll({ order: [['createdAt', 'DESC']], limit: 10 }).catch(() => []);
    const priorContext = priorPitches.length
      ? priorPitches.map(p => `- ${(p.aiFeedback || p.transcript || '').toString().slice(0, 240)}`).join('\n')
      : '(no prior pitch feedback available)';

    const knownArr = Array.isArray(knownObjections)
      ? knownObjections
      : (typeof knownObjections === 'string' ? knownObjections.split('\n').map(s => s.trim()).filter(Boolean) : []);

    const systemPrompt = `You are a sales objection-library curator. Build a structured objection database covering the most likely buyer objections for this product/industry/stage and return canonical responses. Return ONLY valid JSON:
{
  "product": "",
  "industry": "",
  "deal_stage": "",
  "objections": [
    {
      "category": "price|fit|risk|authority|timing|competitor|trust|other",
      "objection": "",
      "underlying_concern": "",
      "ideal_response": "",
      "supporting_evidence": ["", ""],
      "follow_up_question": "",
      "trap_to_avoid": "",
      "difficulty_1_5": 0
    }
  ],
  "drill_recommendations": [{ "focus_area": "", "drill": "" }],
  "summary": ""
}`;

    const userMessage = `Product: ${product}
Industry: ${industry || 'general B2B'}
Deal stage: ${dealStage || 'unspecified'}
Persona: ${persona || 'unspecified'}

Known objections from the team (incorporate and refine these):
${knownArr.length ? knownArr.map((o, i) => `${i + 1}. ${o}`).join('\n') : '(none provided)'}

Recent pitch feedback excerpts (use to spot recurring objections):
${priorContext}`;

    const response = await callOpenRouter(systemPrompt, userMessage, { maxTokens: 2400 });
    const parsed = parseAIJson(response) || { raw: response };
    res.json({ objection_database: parsed });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
});

// POST /api/ai/team-performance-analytics — synthesise leaderboard + recent activity into coaching priorities
router.post('/team-performance-analytics', async (req, res) => {
  try {
    const { period, focus } = req.body || {};

    const leaders = await LeaderboardEntry.findAll({ order: [['totalScore', 'DESC']], limit: 25 }).catch(() => []);
    const sessions = await RolePlaySession.findAll({ order: [['createdAt', 'DESC']], limit: 30 }).catch(() => []);
    const pitches = await PitchPractice.findAll({ order: [['createdAt', 'DESC']], limit: 30 }).catch(() => []);

    const leaderText = leaders.length
      ? leaders.map(l => `- ${l.userName || ('user#' + l.userId)} | totalScore=${l.totalScore} | sessions=${l.sessionsCompleted} | winRate=${l.winRate} | period=${l.period}`).join('\n')
      : '(no leaderboard data)';
    const sessionText = sessions.length
      ? sessions.map(s => `- session#${s.id} userId=${s.userId} score=${s.score ?? 'n/a'} createdAt=${s.createdAt}`).join('\n')
      : '(no recent sessions)';
    const pitchText = pitches.length
      ? pitches.map(p => `- pitch#${p.id} userId=${p.userId} score=${p.score ?? 'n/a'}`).join('\n')
      : '(no recent pitches)';

    const systemPrompt = `You are a sales-enablement analytics director. Synthesise the team's leaderboard + recent activity into coaching priorities. Return ONLY valid JSON:
{
  "period": "",
  "team_summary": {
    "active_reps": 0,
    "avg_score": 0,
    "median_score": 0,
    "top_quartile_threshold": 0,
    "bottom_quartile_threshold": 0,
    "trend_vs_prior_period": "up|flat|down|insufficient_data"
  },
  "top_performers": [{ "rep": "", "why": "" }],
  "at_risk_reps": [{ "rep": "", "why": "", "recommended_intervention": "" }],
  "skill_gaps_team_wide": [{ "skill": "", "evidence": "", "drill": "" }],
  "coaching_priorities_next_2_weeks": [{ "priority": "", "owner": "manager|enablement|peer", "expected_lift": "" }],
  "recommended_team_drills": [{ "drill": "", "format": "1:1|small_group|all_hands", "duration_minutes": 0 }],
  "kpi_watchlist": [{ "kpi": "", "current": "", "target": "", "deadline": "" }],
  "summary": ""
}`;

    const userMessage = `Period: ${period || 'last 30 days'}
Manager focus areas: ${focus || 'overall pipeline health'}

Leaderboard (top 25):
${leaderText}

Recent sessions (last 30):
${sessionText}

Recent pitches (last 30):
${pitchText}`;

    const response = await callOpenRouter(systemPrompt, userMessage, { maxTokens: 2400 });
    const parsed = parseAIJson(response) || { raw: response };
    res.json({ analytics: parsed });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
});

// GET /api/ai/team-analytics — aggregate training session records into team dashboard (audit backlog: team performance analytics aggregator)
// Query params: ?period=30d&team_id=...
//   period: NNd (days), NNw (weeks), NNm (months); defaults to 30d
//   team_id: reserved for future team scoping; current schema has no team column, so ignored
router.get('/team-analytics', async (req, res) => {
  try {
    const { period, team_id } = req.query || {};
    const periodStr = (period || '30d').toString();
    const m = periodStr.match(/^(\d+)\s*([dwm])?$/i);
    const n = m ? parseInt(m[1], 10) : 30;
    const unit = m && m[2] ? m[2].toLowerCase() : 'd';
    const days = unit === 'w' ? n * 7 : unit === 'm' ? n * 30 : n;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const { Op } = require('sequelize');
    const sessions = await RolePlaySession.findAll({
      where: { createdAt: { [Op.gte]: since } },
      order: [['createdAt', 'DESC']],
    }).catch(() => []);
    const pitches = await PitchPractice.findAll({
      where: { createdAt: { [Op.gte]: since } },
      order: [['createdAt', 'DESC']],
    }).catch(() => []);
    const leaders = await LeaderboardEntry.findAll({ order: [['totalScore', 'DESC']] }).catch(() => []);
    const users = await User.findAll().catch(() => []);

    // Aggregate per rep
    const userMap = new Map(users.map(u => [u.id, u]));
    const perRepAcc = new Map();
    const bump = (uid, kind, score) => {
      if (!uid) return;
      if (!perRepAcc.has(uid)) {
        perRepAcc.set(uid, { user_id: uid, sessions: 0, pitches: 0, scores: [], session_scores: [], pitch_scores: [] });
      }
      const a = perRepAcc.get(uid);
      a[kind === 'session' ? 'sessions' : 'pitches'] += 1;
      if (typeof score === 'number' && !Number.isNaN(score)) {
        a.scores.push(score);
        a[kind === 'session' ? 'session_scores' : 'pitch_scores'].push(score);
      }
    };
    sessions.forEach(s => bump(s.userId, 'session', typeof s.score === 'number' ? s.score : parseFloat(s.score)));
    pitches.forEach(p => bump(p.userId, 'pitch', typeof p.score === 'number' ? p.score : parseFloat(p.score)));

    const avg = arr => arr.length ? Math.round((arr.reduce((x, y) => x + y, 0) / arr.length) * 10) / 10 : null;
    const per_rep = Array.from(perRepAcc.values()).map(a => {
      const u = userMap.get(a.user_id);
      const lb = leaders.find(l => l.userId === a.user_id);
      return {
        user_id: a.user_id,
        name: u?.name || (lb?.userName) || `user#${a.user_id}`,
        role: u?.role || 'rep',
        sessions_completed: a.sessions,
        pitches_completed: a.pitches,
        avg_score: avg(a.scores),
        avg_session_score: avg(a.session_scores),
        avg_pitch_score: avg(a.pitch_scores),
        leaderboard_total: lb ? parseFloat(lb.totalScore) : null,
        leaderboard_win_rate: lb ? parseFloat(lb.winRate) : null,
      };
    }).sort((a, b) => (b.avg_score || 0) - (a.avg_score || 0));

    // Team aggregate
    const allScores = per_rep.flatMap(r => {
      const s = [];
      if (typeof r.avg_session_score === 'number') s.push(r.avg_session_score);
      if (typeof r.avg_pitch_score === 'number') s.push(r.avg_pitch_score);
      return s;
    });
    const sessionsCompleted = sessions.length;
    const team_avg = avg(allScores);

    // Strengths / gaps from session scores by quartile
    const ranked = per_rep.filter(r => typeof r.avg_score === 'number');
    const top = ranked.slice(0, Math.max(1, Math.ceil(ranked.length / 4)));
    const bottom = ranked.slice(-Math.max(1, Math.ceil(ranked.length / 4)));
    const top_strengths = top.map(r => ({ rep: r.name, avg_score: r.avg_score, sessions: r.sessions_completed }));
    const top_gaps = bottom.map(r => ({ rep: r.name, avg_score: r.avg_score, sessions: r.sessions_completed }));

    // Trend: split period in half, compare avg session score
    const mid = new Date(Date.now() - (days / 2) * 24 * 60 * 60 * 1000);
    const recentScores = sessions.filter(s => s.createdAt && new Date(s.createdAt) >= mid).map(s => parseFloat(s.score)).filter(v => !Number.isNaN(v));
    const olderScores = sessions.filter(s => s.createdAt && new Date(s.createdAt) < mid).map(s => parseFloat(s.score)).filter(v => !Number.isNaN(v));
    const recentAvg = avg(recentScores);
    const olderAvg = avg(olderScores);
    let direction = 'insufficient_data';
    let delta = null;
    if (recentAvg !== null && olderAvg !== null) {
      delta = Math.round((recentAvg - olderAvg) * 10) / 10;
      direction = delta > 1 ? 'up' : delta < -1 ? 'down' : 'flat';
    }

    // Recommendations (rule-based, no LLM dependency)
    const recommendations = [];
    if (team_avg !== null && team_avg < 60) {
      recommendations.push({ priority: 'high', area: 'overall_skill', action: 'Schedule team-wide objection-handling and discovery drills; team avg is below 60.' });
    }
    if (top_gaps.length) {
      recommendations.push({ priority: 'high', area: 'bottom_quartile', action: `1:1 coaching for ${top_gaps.map(g => g.rep).join(', ')}; pair with top performers.` });
    }
    if (direction === 'down') {
      recommendations.push({ priority: 'medium', area: 'trend', action: `Score trend is down ${delta} pts vs first half of period; investigate recent deal contexts and refresh battle cards.` });
    }
    if (sessionsCompleted < per_rep.length * 2) {
      recommendations.push({ priority: 'medium', area: 'activity', action: 'Activity volume is low (<2 sessions/rep); set a weekly minimum and surface non-completers.' });
    }
    if (top_strengths.length) {
      recommendations.push({ priority: 'low', area: 'enablement', action: `Capture playbooks from top performers (${top_strengths.map(s => s.rep).join(', ')}) and share in next team review.` });
    }
    if (!recommendations.length) {
      recommendations.push({ priority: 'low', area: 'maintain', action: 'No immediate red flags — continue current cadence and rotate scenarios to avoid drill fatigue.' });
    }

    res.json({
      period: periodStr,
      team_id: team_id || null,
      window: { since: since.toISOString(), until: new Date().toISOString(), days },
      per_rep,
      team_aggregate: {
        avg_score: team_avg,
        sessions_completed: sessionsCompleted,
        pitches_completed: pitches.length,
        active_reps: per_rep.length,
        top_strengths,
        top_gaps,
      },
      trends: {
        direction,
        delta_points: delta,
        recent_half_avg: recentAvg,
        prior_half_avg: olderAvg,
      },
      recommendations,
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
});

module.exports = router;

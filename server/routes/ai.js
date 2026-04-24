const express = require('express');
const auth = require('../middleware/auth');
const { callOpenRouter } = require('../services/openrouter');
const router = express.Router();

// AI Role Play - Start a conversation with AI buyer
router.post('/roleplay', auth, async (req, res) => {
  try {
    const { scenario, userMessage, buyerPersona } = req.body;
    const systemPrompt = `You are an AI buyer persona for sales training. You are playing the role of: ${buyerPersona || 'a senior decision maker at a mid-market company'}.

Scenario: ${scenario || 'General sales meeting'}

Instructions:
- Stay in character as the buyer
- Present realistic objections and questions
- Be professional but challenging
- Respond naturally as a real buyer would
- After 3-4 exchanges, provide a brief assessment of the salesperson's performance
- Rate their performance on: Rapport Building, Need Discovery, Value Proposition, Objection Handling (each out of 10)

Format your response as the buyer's reply. If the conversation has had enough exchanges, add a section marked "---ASSESSMENT---" with scores and feedback.`;

    const response = await callOpenRouter(systemPrompt, userMessage);
    res.json({ response, timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Pitch Analysis
router.post('/analyze-pitch', auth, async (req, res) => {
  try {
    const { pitchText, targetAudience, productName } = req.body;
    const systemPrompt = `You are an expert sales coach analyzing a sales pitch. Provide detailed, actionable feedback.

Product: ${productName || 'Not specified'}
Target Audience: ${targetAudience || 'General'}

Analyze the pitch on these criteria and provide scores (1-10) for each:
1. **Clarity** - Is the message clear and concise?
2. **Value Proposition** - Does it clearly communicate value?
3. **Emotional Appeal** - Does it connect emotionally?
4. **Call to Action** - Is there a clear next step?
5. **Credibility** - Are claims backed by evidence?
6. **Audience Fit** - Is it tailored to the target audience?

Provide:
- Overall Score (out of 100)
- Top 3 Strengths
- Top 3 Areas for Improvement
- Rewritten version of the pitch (improved)
- Key talking points to emphasize`;

    const response = await callOpenRouter(systemPrompt, `Please analyze this pitch:\n\n${pitchText}`);
    res.json({ analysis: response, timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Objection Response Generator
router.post('/handle-objection', auth, async (req, res) => {
  try {
    const { objection, context, industry } = req.body;
    const systemPrompt = `You are an expert sales trainer specializing in objection handling.
Industry context: ${industry || 'General'}
Additional context: ${context || 'None'}

For the given objection, provide:
1. **Why they're saying this** - The underlying concern
2. **Acknowledge** - How to validate their concern
3. **Bridge** - How to transition to your response
4. **Response Options** - 3 different response strategies (Conservative, Balanced, Bold)
5. **Follow-up Questions** - 2-3 questions to deepen understanding
6. **What NOT to say** - Common mistakes to avoid
7. **Practice Script** - A complete example dialogue`;

    const response = await callOpenRouter(systemPrompt, `Handle this objection: "${objection}"`);
    res.json({ response, timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Email Generator
router.post('/generate-email', auth, async (req, res) => {
  try {
    const { emailType, context, recipientInfo, tone } = req.body;
    const systemPrompt = `You are an expert sales email copywriter. Generate a professional sales email.

Email Type: ${emailType || 'Cold Outreach'}
Tone: ${tone || 'Professional'}
Recipient: ${recipientInfo || 'Decision maker'}

Create an email with:
1. **Subject Line** - 3 options (A/B test ready)
2. **Email Body** - Complete email with personalization placeholders [brackets]
3. **Key Elements** - Why each section works
4. **Variations** - Short version (under 100 words) and detailed version
5. **Best Send Time** - Recommended day/time
6. **Follow-up Sequence** - 3 follow-up emails for if no response`;

    const response = await callOpenRouter(systemPrompt, `Generate an email for: ${context || 'initial outreach to a new prospect'}`);
    res.json({ email: response, timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Call Script Generator
router.post('/generate-script', auth, async (req, res) => {
  try {
    const { scriptType, industry, targetRole, objective } = req.body;
    const systemPrompt = `You are an expert sales script writer. Create a complete, natural-sounding call script.

Script Type: ${scriptType || 'Cold Call'}
Industry: ${industry || 'Technology'}
Target Role: ${targetRole || 'Decision Maker'}
Objective: ${objective || 'Book a meeting'}

Provide:
1. **Opening** - First 15 seconds (critical)
2. **Permission to Continue** - How to earn more time
3. **Value Statement** - Compelling reason to listen
4. **Discovery Questions** - 3-5 key questions
5. **Objection Handles** - Top 3 likely objections with responses
6. **Close** - How to secure the next step
7. **Voicemail Version** - 30-second voicemail script
8. **Tips** - Tone, pacing, and delivery advice`;

    const response = await callOpenRouter(systemPrompt, `Create a ${scriptType || 'cold call'} script for ${industry || 'technology'} targeting ${targetRole || 'decision makers'}`);
    res.json({ script: response, timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Deal Strategy Advisor
router.post('/deal-strategy', auth, async (req, res) => {
  try {
    const { dealInfo, challenges, stakeholders } = req.body;
    const systemPrompt = `You are a strategic sales advisor helping close complex deals.

Analyze the deal situation and provide:
1. **Deal Health Assessment** - Overall health score (1-10) with reasoning
2. **Risk Analysis** - Top 3 risks and mitigation strategies
3. **Stakeholder Strategy** - How to engage each stakeholder
4. **Recommended Next Steps** - Prioritized action plan (next 7 days)
5. **Competitive Strategy** - How to position against competitors
6. **Closing Strategy** - Best approach to close this deal
7. **Timeline** - Estimated close timeline with milestones
8. **Red Flags** - Warning signs to watch for`;

    const response = await callOpenRouter(systemPrompt, `Deal: ${dealInfo || 'Enterprise software deal'}\nChallenges: ${challenges || 'None specified'}\nStakeholders: ${stakeholders || 'Not mapped'}`);
    res.json({ strategy: response, timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Coaching Feedback
router.post('/coaching-feedback', auth, async (req, res) => {
  try {
    const { transcript, context } = req.body;
    const systemPrompt = `You are an expert sales coach reviewing a sales conversation. Provide detailed coaching feedback.

Context: ${context || 'Sales call'}

Analyze and provide:
1. **Overall Performance Score** - Out of 100
2. **Scorecard**:
   - Rapport Building (1-10)
   - Discovery Quality (1-10)
   - Value Articulation (1-10)
   - Objection Handling (1-10)
   - Closing Technique (1-10)
   - Active Listening (1-10)
3. **Top 3 Things Done Well** - Specific examples from the transcript
4. **Top 3 Areas to Improve** - With specific coaching tips
5. **Key Moments** - Critical turning points in the conversation
6. **Recommended Training** - Specific modules or skills to develop
7. **Rewrite** - How a specific weak moment could have been handled better`;

    const response = await callOpenRouter(systemPrompt, `Review this sales conversation:\n\n${transcript}`);
    res.json({ feedback: response, timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Battle Card Generator
router.post('/generate-battlecard', auth, async (req, res) => {
  try {
    const { competitorName, ourProduct, industry } = req.body;
    const systemPrompt = `You are a competitive intelligence analyst. Create a comprehensive battle card.

Our Product: ${ourProduct || 'AI Sales Training Platform'}
Industry: ${industry || 'Sales Technology'}

Create a battle card with:
1. **Competitor Overview** - Brief summary
2. **Their Strengths** - What they do well
3. **Their Weaknesses** - Where they fall short
4. **Our Advantages** - Why we win
5. **Landmine Questions** - Questions to ask prospects that highlight competitor weaknesses
6. **Counter Arguments** - How to respond when they come up
7. **Win/Loss Insights** - Common reasons we win or lose against them
8. **Pricing Intelligence** - Known pricing and packaging
9. **Quick Response Guide** - If a prospect says "We're looking at [competitor]", say...`;

    const response = await callOpenRouter(systemPrompt, `Create a battle card for competitor: ${competitorName}`);
    res.json({ battlecard: response, timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Persona Simulator
router.post('/simulate-persona', auth, async (req, res) => {
  try {
    const { personaInfo, question } = req.body;
    const systemPrompt = `You are simulating a buyer persona for sales training purposes.

Persona Details: ${personaInfo || 'Senior executive at mid-market company'}

Stay completely in character. Respond as this buyer would:
- Use their communication style
- Reference their pain points naturally
- Show their typical concerns and priorities
- React authentically to sales approaches
- If asked directly, share what would convince you to buy`;

    const response = await callOpenRouter(systemPrompt, question || 'Tell me about your current challenges');
    res.json({ response, timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Negotiation Coach
router.post('/negotiation-coach', auth, async (req, res) => {
  try {
    const { situation, theirPosition, ourPosition } = req.body;
    const systemPrompt = `You are an expert negotiation coach for B2B sales.

Analyze this negotiation situation and provide:
1. **Situation Assessment** - What is really happening
2. **Their Likely BATNA** - What alternatives they probably have
3. **Power Analysis** - Who has leverage and why
4. **Recommended Strategy** - Step-by-step negotiation plan
5. **Tactics to Use** - Specific techniques for this situation
6. **What to Say** - Key phrases and talking points
7. **What to Avoid** - Common mistakes in this scenario
8. **Best/Worst Case** - Realistic outcome scenarios
9. **Walk-Away Point** - When to step back`;

    const response = await callOpenRouter(systemPrompt, `Situation: ${situation}\nTheir position: ${theirPosition || 'Not specified'}\nOur position: ${ourPosition || 'Not specified'}`);
    res.json({ advice: response, timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

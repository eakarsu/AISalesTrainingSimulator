const express = require('express');

const router = express.Router();

router.post('/coach', (req, res) => {
  const {
    deal = { stage: 'proposal', daysInStage: 24, value: 68000 },
    signals = ['no executive sponsor', 'pricing objection', 'security review pending'],
  } = req.body || {};
  const days = Number(deal.daysInStage || 0);
  const value = Number(deal.value || 0);
  const risk = Math.min(100, Math.round(days * 2 + (Array.isArray(signals) ? signals.length * 12 : 0) + (value > 50000 ? 10 : 0)));

  res.json({
    risk,
    stage: deal.stage || 'unknown',
    nextDrill: risk >= 70 ? 'executive reframe roleplay' : 'objection pressure test',
    coachPlan: [
      'Practice a concise mutual action plan reset.',
      'Roleplay the strongest economic objection twice.',
      'Prepare one proof point tied to the buyer metric.',
    ],
    repTalkTrack: `This deal is stuck because ${Array.isArray(signals) && signals[0] ? signals[0] : 'momentum slowed'}. Re-anchor on business impact and ask for a dated decision path.`,
  });
});

module.exports = router;

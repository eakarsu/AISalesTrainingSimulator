const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { sequelize } = require('./models');
const createCrudRouter = require('./routes/crud');
const authRoutes = require('./routes/auth');
const aiRoutes = require('./routes/ai');

const app = express();
const PORT = process.env.SERVER_PORT || 4000;

app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

// Auth routes
app.use('/api/auth', authRoutes);

// AI routes
app.use('/api/ai', aiRoutes);

// CRUD routes for all features
app.use('/api/scenarios', createCrudRouter('SalesScenario'));
app.use('/api/sessions', createCrudRouter('RolePlaySession'));
app.use('/api/objections', createCrudRouter('Objection'));
app.use('/api/pitches', createCrudRouter('PitchPractice'));
app.use('/api/playbooks', createCrudRouter('Playbook'));
app.use('/api/metrics', createCrudRouter('PerformanceMetric'));
app.use('/api/products', createCrudRouter('ProductKnowledge'));
app.use('/api/coaching', createCrudRouter('CoachingPlan'));
app.use('/api/scripts', createCrudRouter('CallScript'));
app.use('/api/emails', createCrudRouter('EmailTemplate'));
app.use('/api/deals', createCrudRouter('DealSimulation'));
app.use('/api/personas', createCrudRouter('BuyerPersona'));
app.use('/api/battlecards', createCrudRouter('BattleCard'));
app.use('/api/training', createCrudRouter('TrainingModule'));
app.use('/api/negotiations', createCrudRouter('NegotiationTactic'));
app.use('/api/leaderboard', createCrudRouter('LeaderboardEntry'));
app.use('/api/message-history', createCrudRouter('MessageHistory'));
app.use('/api/stalled-deal-clinic', require('./routes/stalledDealClinic'));

// Serve React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
}

async function start() {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');
    await sequelize.sync({ alter: false });
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();

// AI feature mount: deal-scorer
app.use('/api/ai/deal-scorer', require('./routes/ai-deal-scorer'));
// === Batch 07 Gaps & Frontend Mounts ===
app.use('/api/gap-no-objectiondatabase-learn-from-past-objecti', require('./routes/gap-no-objectiondatabase-learn-from-past-objecti'));
app.use('/api/gap-no-conversationanalysis-real-call-transcript', require('./routes/gap-no-conversationanalysis-real-call-transcript'));
app.use('/api/gap-no-competitiveintelligence-retrieval', require('./routes/gap-no-competitiveintelligence-retrieval'));
app.use('/api/gap-no-dealstageprogressor-nextbestaction', require('./routes/gap-no-dealstageprogressor-nextbestaction'));
app.use('/api/gap-no-realtime-call-coaching-live-audio', require('./routes/gap-no-realtime-call-coaching-live-audio'));
app.use('/api/gap-no-sales-pipeline-opportunity-management', require('./routes/gap-no-sales-pipeline-opportunity-management'));
app.use('/api/gap-no-deal-tracking-with-stages', require('./routes/gap-no-deal-tracking-with-stages'));
app.use('/api/gap-no-collateralcontent-repository-case-studies', require('./routes/gap-no-collateralcontent-repository-case-studies'));
app.use('/api/gap-no-team-performance-analytics', require('./routes/gap-no-team-performance-analytics'));
app.use('/api/gap-no-sales-enablement-content-library', require('./routes/gap-no-sales-enablement-content-library'));
app.use('/api/gap-no-crm-integration-salesforce-hubspot', require('./routes/gap-no-crm-integration-salesforce-hubspot'));
app.use('/api/gap-no-call-recording-ingestion', require('./routes/gap-no-call-recording-ingestion'));
app.use('/api/gap-no-notifications-or-audit-log', require('./routes/gap-no-notifications-or-audit-log'));
// === End Batch 07 ===

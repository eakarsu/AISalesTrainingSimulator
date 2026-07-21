const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config({ path:path.join(__dirname,'../.env') });

const { sequelize } = require('./models');
const createCrudRouter = require('./routes/crud');
const auth = require('./middleware/auth');
const { validateRuntime } = require('./governance/runtime');
const { createProviderGate } = require('./governance/providerGate');

validateRuntime();

const app = express();
const PORT = process.env.SERVER_PORT || 4000;
const origins=String(process.env.CORS_ORIGINS||process.env.CLIENT_URL||'http://localhost:3000').split(',').map((value)=>value.trim()).filter(Boolean);

app.use(helmet());
app.use(cors({origin(origin,callback){if(!origin||origins.includes(origin))return callback(null,true);return callback(new Error('CORS origin denied'));},credentials:true}));
app.use(express.json({limit:'1mb'}));
app.use('/api/auth',require('./routes/auth'));
app.get('/api/health',(_req,res)=>res.json({status:'ok',timestamp:new Date().toISOString()}));
app.use(createProviderGate(['/api/ai','/api/gap','/api/stalled-deal-clinic']));
app.use('/api/governed-training-outcomes',require('./governance/router'));
app.use('/api',auth);

for(const [route,model] of [
  ['/api/scenarios','SalesScenario'],['/api/sessions','RolePlaySession'],['/api/objections','Objection'],
  ['/api/pitches','PitchPractice'],['/api/playbooks','Playbook'],['/api/metrics','PerformanceMetric'],
  ['/api/products','ProductKnowledge'],['/api/coaching','CoachingPlan'],['/api/scripts','CallScript'],
  ['/api/emails','EmailTemplate'],['/api/deals','DealSimulation'],['/api/personas','BuyerPersona'],
  ['/api/battlecards','BattleCard'],['/api/training','TrainingModule'],['/api/negotiations','NegotiationTactic'],
  ['/api/leaderboard','LeaderboardEntry'],['/api/message-history','MessageHistory'],
]) app.use(route,createCrudRouter(model));

if(process.env.ENABLE_LEGACY_PROVIDER_ROUTES==='true'){
  app.use('/api/ai',require('./routes/ai'));
  app.use('/api/stalled-deal-clinic',require('./routes/stalledDealClinic'));
  app.use('/api/ai/deal-scorer',require('./routes/ai-deal-scorer'));
  app.use('/api/gap-no-objectiondatabase-learn-from-past-objecti',require('./routes/gap-no-objectiondatabase-learn-from-past-objecti'));
  app.use('/api/gap-no-conversationanalysis-real-call-transcript',require('./routes/gap-no-conversationanalysis-real-call-transcript'));
  app.use('/api/gap-no-competitiveintelligence-retrieval',require('./routes/gap-no-competitiveintelligence-retrieval'));
  app.use('/api/gap-no-dealstageprogressor-nextbestaction',require('./routes/gap-no-dealstageprogressor-nextbestaction'));
  app.use('/api/gap-no-realtime-call-coaching-live-audio',require('./routes/gap-no-realtime-call-coaching-live-audio'));
  app.use('/api/gap-no-sales-pipeline-opportunity-management',require('./routes/gap-no-sales-pipeline-opportunity-management'));
  app.use('/api/gap-no-deal-tracking-with-stages',require('./routes/gap-no-deal-tracking-with-stages'));
  app.use('/api/gap-no-collateralcontent-repository-case-studies',require('./routes/gap-no-collateralcontent-repository-case-studies'));
  app.use('/api/gap-no-team-performance-analytics',require('./routes/gap-no-team-performance-analytics'));
  app.use('/api/gap-no-sales-enablement-content-library',require('./routes/gap-no-sales-enablement-content-library'));
  app.use('/api/gap-no-crm-integration-salesforce-hubspot',require('./routes/gap-no-crm-integration-salesforce-hubspot'));
  app.use('/api/gap-no-call-recording-ingestion',require('./routes/gap-no-call-recording-ingestion'));
  app.use('/api/gap-no-notifications-or-audit-log',require('./routes/gap-no-notifications-or-audit-log'));
}

if(process.env.NODE_ENV==='production'){
  app.use(express.static(path.join(__dirname,'../client/build')));
  app.get('*',(_req,res)=>res.sendFile(path.join(__dirname,'../client/build/index.html')));
}
app.use((err,_req,res,_next)=>{console.error('Server error:',err.message);res.status(err.status||500).json({error:err.status?err.message:'Internal server error'});});

async function start(){
  try{
    await sequelize.authenticate();
    if(process.env.ENABLE_LEGACY_SCHEMA_BOOTSTRAP==='true')await sequelize.sync({alter:false});
    app.listen(PORT,()=>console.log(`Server running on port ${PORT}`));
  }catch(error){console.error('Failed to start server:',error.message);process.exitCode=1;}
}
start();

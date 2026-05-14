const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

// User Model
const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM('admin', 'manager', 'rep'), defaultValue: 'rep' },
  avatar: { type: DataTypes.STRING, defaultValue: '' }
}, { tableName: 'users', timestamps: true });

// 1. Sales Scenarios
const SalesScenario = sequelize.define('SalesScenario', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  industry: { type: DataTypes.STRING },
  difficulty: { type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'), defaultValue: 'intermediate' },
  buyerPersona: { type: DataTypes.TEXT },
  objectives: { type: DataTypes.TEXT },
  status: { type: DataTypes.ENUM('active', 'draft', 'archived'), defaultValue: 'active' }
}, { tableName: 'sales_scenarios', timestamps: true });

// 2. Role Play Sessions
const RolePlaySession = sequelize.define('RolePlaySession', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  scenarioId: { type: DataTypes.INTEGER, references: { model: 'sales_scenarios', key: 'id' } },
  userId: { type: DataTypes.INTEGER, references: { model: 'users', key: 'id' } },
  transcript: { type: DataTypes.TEXT },
  score: { type: DataTypes.FLOAT },
  feedback: { type: DataTypes.TEXT },
  duration: { type: DataTypes.INTEGER },
  status: { type: DataTypes.ENUM('in_progress', 'completed', 'reviewed'), defaultValue: 'in_progress' }
}, { tableName: 'role_play_sessions', timestamps: true });

// 3. Objection Handling Library
const Objection = sequelize.define('Objection', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  objectionText: { type: DataTypes.TEXT, allowNull: false },
  category: { type: DataTypes.STRING },
  suggestedResponse: { type: DataTypes.TEXT },
  industry: { type: DataTypes.STRING },
  difficulty: { type: DataTypes.ENUM('easy', 'medium', 'hard'), defaultValue: 'medium' },
  frequency: { type: DataTypes.ENUM('common', 'occasional', 'rare'), defaultValue: 'common' }
}, { tableName: 'objections', timestamps: true });

// 4. Pitch Practice
const PitchPractice = sequelize.define('PitchPractice', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  userId: { type: DataTypes.INTEGER, references: { model: 'users', key: 'id' } },
  pitchText: { type: DataTypes.TEXT },
  productName: { type: DataTypes.STRING },
  targetAudience: { type: DataTypes.STRING },
  aiFeedback: { type: DataTypes.TEXT },
  score: { type: DataTypes.FLOAT },
  status: { type: DataTypes.ENUM('draft', 'submitted', 'reviewed'), defaultValue: 'draft' }
}, { tableName: 'pitch_practices', timestamps: true });

// 5. Sales Playbooks
const Playbook = sequelize.define('Playbook', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  category: { type: DataTypes.STRING },
  steps: { type: DataTypes.TEXT },
  bestPractices: { type: DataTypes.TEXT },
  industry: { type: DataTypes.STRING },
  status: { type: DataTypes.ENUM('active', 'draft', 'archived'), defaultValue: 'active' }
}, { tableName: 'playbooks', timestamps: true });

// 6. Performance Analytics
const PerformanceMetric = sequelize.define('PerformanceMetric', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, references: { model: 'users', key: 'id' } },
  metricName: { type: DataTypes.STRING, allowNull: false },
  metricValue: { type: DataTypes.FLOAT },
  category: { type: DataTypes.STRING },
  period: { type: DataTypes.STRING },
  trend: { type: DataTypes.ENUM('up', 'down', 'stable'), defaultValue: 'stable' },
  notes: { type: DataTypes.TEXT }
}, { tableName: 'performance_metrics', timestamps: true });

// 7. Product Knowledge Base
const ProductKnowledge = sequelize.define('ProductKnowledge', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  productName: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  features: { type: DataTypes.TEXT },
  pricing: { type: DataTypes.STRING },
  competitiveAdvantage: { type: DataTypes.TEXT },
  targetMarket: { type: DataTypes.STRING },
  category: { type: DataTypes.STRING }
}, { tableName: 'product_knowledge', timestamps: true });

// 8. Coaching Plans
const CoachingPlan = sequelize.define('CoachingPlan', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  userId: { type: DataTypes.INTEGER, references: { model: 'users', key: 'id' } },
  goals: { type: DataTypes.TEXT },
  milestones: { type: DataTypes.TEXT },
  currentPhase: { type: DataTypes.STRING },
  startDate: { type: DataTypes.DATEONLY },
  endDate: { type: DataTypes.DATEONLY },
  status: { type: DataTypes.ENUM('active', 'completed', 'paused'), defaultValue: 'active' }
}, { tableName: 'coaching_plans', timestamps: true });

// 9. Call Scripts
const CallScript = sequelize.define('CallScript', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  scriptType: { type: DataTypes.STRING },
  content: { type: DataTypes.TEXT },
  industry: { type: DataTypes.STRING },
  talkingPoints: { type: DataTypes.TEXT },
  closingTechnique: { type: DataTypes.STRING },
  status: { type: DataTypes.ENUM('active', 'draft', 'archived'), defaultValue: 'active' }
}, { tableName: 'call_scripts', timestamps: true });

// 10. Email Templates
const EmailTemplate = sequelize.define('EmailTemplate', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  subject: { type: DataTypes.STRING },
  body: { type: DataTypes.TEXT },
  templateType: { type: DataTypes.STRING },
  industry: { type: DataTypes.STRING },
  conversionRate: { type: DataTypes.FLOAT },
  status: { type: DataTypes.ENUM('active', 'draft', 'archived'), defaultValue: 'active' }
}, { tableName: 'email_templates', timestamps: true });

// 11. Deal Simulations
const DealSimulation = sequelize.define('DealSimulation', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  dealValue: { type: DataTypes.FLOAT },
  companyName: { type: DataTypes.STRING },
  industry: { type: DataTypes.STRING },
  stage: { type: DataTypes.STRING },
  stakeholders: { type: DataTypes.TEXT },
  challenges: { type: DataTypes.TEXT },
  outcome: { type: DataTypes.ENUM('won', 'lost', 'in_progress'), defaultValue: 'in_progress' }
}, { tableName: 'deal_simulations', timestamps: true });

// 12. Buyer Personas
const BuyerPersona = sequelize.define('BuyerPersona', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  title: { type: DataTypes.STRING },
  company: { type: DataTypes.STRING },
  industry: { type: DataTypes.STRING },
  painPoints: { type: DataTypes.TEXT },
  motivations: { type: DataTypes.TEXT },
  communicationStyle: { type: DataTypes.STRING },
  decisionCriteria: { type: DataTypes.TEXT }
}, { tableName: 'buyer_personas', timestamps: true });

// 13. Competition Battle Cards
const BattleCard = sequelize.define('BattleCard', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  competitorName: { type: DataTypes.STRING, allowNull: false },
  strengths: { type: DataTypes.TEXT },
  weaknesses: { type: DataTypes.TEXT },
  ourAdvantage: { type: DataTypes.TEXT },
  counterArguments: { type: DataTypes.TEXT },
  pricingComparison: { type: DataTypes.TEXT },
  marketShare: { type: DataTypes.STRING }
}, { tableName: 'battle_cards', timestamps: true });

// 14. Training Modules
const TrainingModule = sequelize.define('TrainingModule', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  category: { type: DataTypes.STRING },
  content: { type: DataTypes.TEXT },
  duration: { type: DataTypes.INTEGER },
  difficulty: { type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'), defaultValue: 'intermediate' },
  completionRate: { type: DataTypes.FLOAT, defaultValue: 0 },
  status: { type: DataTypes.ENUM('active', 'draft', 'archived'), defaultValue: 'active' }
}, { tableName: 'training_modules', timestamps: true });

// 15. Negotiation Tactics
const NegotiationTactic = sequelize.define('NegotiationTactic', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  category: { type: DataTypes.STRING },
  whenToUse: { type: DataTypes.TEXT },
  example: { type: DataTypes.TEXT },
  effectiveness: { type: DataTypes.ENUM('high', 'medium', 'low'), defaultValue: 'medium' },
  riskLevel: { type: DataTypes.ENUM('high', 'medium', 'low'), defaultValue: 'medium' }
}, { tableName: 'negotiation_tactics', timestamps: true });

// 16. Leaderboard
const LeaderboardEntry = sequelize.define('LeaderboardEntry', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, references: { model: 'users', key: 'id' } },
  userName: { type: DataTypes.STRING },
  totalScore: { type: DataTypes.FLOAT },
  sessionsCompleted: { type: DataTypes.INTEGER },
  winRate: { type: DataTypes.FLOAT },
  rank: { type: DataTypes.INTEGER },
  badge: { type: DataTypes.STRING },
  period: { type: DataTypes.STRING }
}, { tableName: 'leaderboard', timestamps: true });

// 17. Message History (for roleplay session continuity)
const MessageHistory = sequelize.define('MessageHistory', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  sessionId: { type: DataTypes.INTEGER, references: { model: 'role_play_sessions', key: 'id' } },
  role: { type: DataTypes.ENUM('user', 'assistant', 'system'), allowNull: false },
  content: { type: DataTypes.TEXT, allowNull: false },
}, { tableName: 'message_history', timestamps: true });

// Associations
User.hasMany(RolePlaySession, { foreignKey: 'userId' });
RolePlaySession.belongsTo(User, { foreignKey: 'userId' });
SalesScenario.hasMany(RolePlaySession, { foreignKey: 'scenarioId' });
RolePlaySession.belongsTo(SalesScenario, { foreignKey: 'scenarioId' });
User.hasMany(PitchPractice, { foreignKey: 'userId' });
User.hasMany(PerformanceMetric, { foreignKey: 'userId' });
User.hasMany(CoachingPlan, { foreignKey: 'userId' });
User.hasMany(LeaderboardEntry, { foreignKey: 'userId' });
RolePlaySession.hasMany(MessageHistory, { foreignKey: 'sessionId' });
MessageHistory.belongsTo(RolePlaySession, { foreignKey: 'sessionId' });

module.exports = {
  sequelize,
  User,
  SalesScenario,
  RolePlaySession,
  Objection,
  PitchPractice,
  Playbook,
  PerformanceMetric,
  ProductKnowledge,
  CoachingPlan,
  CallScript,
  EmailTemplate,
  DealSimulation,
  BuyerPersona,
  BattleCard,
  TrainingModule,
  NegotiationTactic,
  LeaderboardEntry,
  MessageHistory,
};

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import FeaturePage from './pages/FeaturePage';
import RoleplayChatPage from './pages/RoleplayChatPage';
import LeaderboardPage from './pages/LeaderboardPage';
import CoachingPlansPage from './pages/CoachingPlansPage';
import MySessionsPage from './pages/MySessionsPage';
import ConversationAnalysisPage from './pages/ConversationAnalysisPage';
import DealStageProgressorPage from './pages/DealStageProgressorPage';
import CompetitiveIntelligencePage from './pages/CompetitiveIntelligencePage';
import ObjectionDatabasePage from './pages/ObjectionDatabasePage';
import TeamPerformanceAnalyticsPage from './pages/TeamPerformanceAnalyticsPage';
import Sidebar from './components/Sidebar';

// === Batch 07 Gaps & Frontend Mounts ===
import CfRealtimeCoachingDuringCalls from './pages/CfRealtimeCoachingDuringCalls';
import CfPostcallAnalysisCoaching from './pages/CfPostcallAnalysisCoaching';
import CfCompetitorBattlecardGenerator from './pages/CfCompetitorBattlecardGenerator';
import CfDealProbabilityScorer from './pages/CfDealProbabilityScorer';
import CfPlaybookLearner from './pages/CfPlaybookLearner';
import CfNegotiationSimulationWithMultiplePersona from './pages/CfNegotiationSimulationWithMultiplePersona';
import GapNoObjectiondatabaseLearnFromPastObjecti from './pages/GapNoObjectiondatabaseLearnFromPastObjecti';
import GapNoConversationanalysisRealCallTranscript from './pages/GapNoConversationanalysisRealCallTranscript';
import GapNoCompetitiveintelligenceRetrieval from './pages/GapNoCompetitiveintelligenceRetrieval';
import GapNoDealstageprogressorNextbestaction from './pages/GapNoDealstageprogressorNextbestaction';
import GapNoRealtimeCallCoachingLiveAudio from './pages/GapNoRealtimeCallCoachingLiveAudio';
import GapNoSalesPipelineOpportunityManagement from './pages/GapNoSalesPipelineOpportunityManagement';
import GapNoDealTrackingWithStages from './pages/GapNoDealTrackingWithStages';
import GapNoCollateralcontentRepositoryCaseStudies from './pages/GapNoCollateralcontentRepositoryCaseStudies';
import GapNoTeamPerformanceAnalytics from './pages/GapNoTeamPerformanceAnalytics';
import GapNoSalesEnablementContentLibrary from './pages/GapNoSalesEnablementContentLibrary';
import GapNoCrmIntegrationSalesforceHubspot from './pages/GapNoCrmIntegrationSalesforceHubspot';
import GapNoCallRecordingIngestion from './pages/GapNoCallRecordingIngestion';
import GapNoNotificationsOrAuditLog from './pages/GapNoNotificationsOrAuditLog';
// === End Batch 07 ===


const features = [
  { key: 'scenarios', label: 'Sales Scenarios', icon: '🎯', api: '/scenarios', desc: 'Practice realistic sales situations', aiAction: 'roleplay' },
  { key: 'sessions', label: 'Role Play Sessions', icon: '🎭', api: '/sessions', desc: 'AI-powered role play training', aiAction: 'roleplay' },
  { key: 'objections', label: 'Objection Handling', icon: '🛡️', api: '/objections', desc: 'Master objection responses', aiAction: 'handle-objection' },
  { key: 'pitches', label: 'Pitch Practice', icon: '🎤', api: '/pitches', desc: 'Perfect your sales pitch', aiAction: 'analyze-pitch' },
  { key: 'playbooks', label: 'Sales Playbooks', icon: '📋', api: '/playbooks', desc: 'Proven sales strategies', aiAction: null },
  { key: 'metrics', label: 'Performance Analytics', icon: '📊', api: '/metrics', desc: 'Track your progress', aiAction: null },
  { key: 'products', label: 'Product Knowledge', icon: '💡', api: '/products', desc: 'Master product details', aiAction: null },
  { key: 'coaching', label: 'Coaching Plans', icon: '🏋️', api: '/coaching', desc: 'Personalized development', aiAction: 'coaching-feedback' },
  { key: 'scripts', label: 'Call Scripts', icon: '📞', api: '/scripts', desc: 'Ready-to-use call scripts', aiAction: 'generate-script' },
  { key: 'emails', label: 'Email Templates', icon: '📧', api: '/emails', desc: 'High-converting templates', aiAction: 'generate-email' },
  { key: 'deals', label: 'Deal Simulations', icon: '💰', api: '/deals', desc: 'Simulate complex deals', aiAction: 'deal-strategy' },
  { key: 'personas', label: 'Buyer Personas', icon: '👤', api: '/personas', desc: 'Understand your buyers', aiAction: 'simulate-persona' },
  { key: 'battlecards', label: 'Battle Cards', icon: '⚔️', api: '/battlecards', desc: 'Competitive intelligence', aiAction: 'generate-battlecard' },
  { key: 'training', label: 'Training Modules', icon: '🎓', api: '/training', desc: 'Structured learning paths', aiAction: null },
  { key: 'negotiations', label: 'Negotiation Tactics', icon: '🤝', api: '/negotiations', desc: 'Advanced negotiation skills', aiAction: 'negotiation-coach' },
  { key: 'leaderboard', label: 'Leaderboard', icon: '🏆', api: '/leaderboard', desc: 'Rankings & achievements', aiAction: null }
];

function App() {
  const [user, setUser] = useState(null);
  const [activeFeature, setActiveFeature] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  if (!user) {
    return (
      <>
        <Login onLogin={handleLogin} />
        <ToastContainer theme="dark" position="bottom-right" />
      </>
    );
  }

  return (
    <Router>
      <div className="app-layout">
        <Sidebar
          features={features}
          activeFeature={activeFeature}
          setActiveFeature={setActiveFeature}
          user={user}
          onLogout={handleLogout}
        />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard features={features} setActiveFeature={setActiveFeature} />} />
            {features.map(f => (
              <Route key={f.key} path={`/${f.key}`} element={<FeaturePage feature={f} />} />
            ))}
            <Route path="/roleplay-chat" element={<RoleplayChatPage />} />
            <Route path="/leaderboard-page" element={<LeaderboardPage />} />
            <Route path="/coaching-plans-page" element={<CoachingPlansPage />} />
            <Route path="/my-sessions" element={<MySessionsPage />} />
            <Route path="/ai/conversation-analysis" element={<ConversationAnalysisPage />} />
            <Route path="/ai/deal-stage-progressor" element={<DealStageProgressorPage />} />
            <Route path="/ai/competitive-intelligence" element={<CompetitiveIntelligencePage />} />
            <Route path="/ai/objection-database" element={<ObjectionDatabasePage />} />
            <Route path="/ai/team-performance-analytics" element={<TeamPerformanceAnalyticsPage />} />
            <Route path="*" element={<Navigate to="/" />} />
          // === Batch 07 Gaps & Frontend Mounts ===
          <Route path='/cf-realtime-coaching-during-calls' element={<CfRealtimeCoachingDuringCalls />} />
          <Route path='/cf-postcall-analysis-coaching' element={<CfPostcallAnalysisCoaching />} />
          <Route path='/cf-competitor-battlecard-generator' element={<CfCompetitorBattlecardGenerator />} />
          <Route path='/cf-deal-probability-scorer' element={<CfDealProbabilityScorer />} />
          <Route path='/cf-playbook-learner' element={<CfPlaybookLearner />} />
          <Route path='/cf-negotiation-simulation-with-multiple-persona' element={<CfNegotiationSimulationWithMultiplePersona />} />
          <Route path='/gap-no-objectiondatabase-learn-from-past-objecti' element={<GapNoObjectiondatabaseLearnFromPastObjecti />} />
          <Route path='/gap-no-conversationanalysis-real-call-transcript' element={<GapNoConversationanalysisRealCallTranscript />} />
          <Route path='/gap-no-competitiveintelligence-retrieval' element={<GapNoCompetitiveintelligenceRetrieval />} />
          <Route path='/gap-no-dealstageprogressor-nextbestaction' element={<GapNoDealstageprogressorNextbestaction />} />
          <Route path='/gap-no-realtime-call-coaching-live-audio' element={<GapNoRealtimeCallCoachingLiveAudio />} />
          <Route path='/gap-no-sales-pipeline-opportunity-management' element={<GapNoSalesPipelineOpportunityManagement />} />
          <Route path='/gap-no-deal-tracking-with-stages' element={<GapNoDealTrackingWithStages />} />
          <Route path='/gap-no-collateralcontent-repository-case-studies' element={<GapNoCollateralcontentRepositoryCaseStudies />} />
          <Route path='/gap-no-team-performance-analytics' element={<GapNoTeamPerformanceAnalytics />} />
          <Route path='/gap-no-sales-enablement-content-library' element={<GapNoSalesEnablementContentLibrary />} />
          <Route path='/gap-no-crm-integration-salesforce-hubspot' element={<GapNoCrmIntegrationSalesforceHubspot />} />
          <Route path='/gap-no-call-recording-ingestion' element={<GapNoCallRecordingIngestion />} />
          <Route path='/gap-no-notifications-or-audit-log' element={<GapNoNotificationsOrAuditLog />} />
          // === End Batch 07 ===
          </Routes>
        </main>
      </div>
      <ToastContainer theme="dark" position="bottom-right" />
    </Router>
  );
}

export default App;

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import FeaturePage from './pages/FeaturePage';
import Sidebar from './components/Sidebar';

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
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
      <ToastContainer theme="dark" position="bottom-right" />
    </Router>
  );
}

export default App;

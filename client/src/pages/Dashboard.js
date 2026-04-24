import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function Dashboard({ features, setActiveFeature }) {
  const navigate = useNavigate();
  const [counts, setCounts] = useState({});

  useEffect(() => {
    const fetchCounts = async () => {
      const results = {};
      for (const f of features) {
        try {
          const { data } = await api.get(f.api);
          results[f.key] = Array.isArray(data) ? data.length : 0;
        } catch {
          results[f.key] = 0;
        }
      }
      setCounts(results);
    };
    fetchCounts();
  }, [features]);

  const handleCardClick = (feature) => {
    setActiveFeature(feature.key);
    navigate(`/${feature.key}`);
  };

  return (
    <div className="animate-fade">
      <div className="page-header">
        <div>
          <h1>Sales Training Dashboard</h1>
          <p className="desc">AI-powered sales enablement platform</p>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-label">Total Features</div>
          <div className="stat-value">16</div>
          <div className="stat-change up">All Active</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">AI-Powered Features</div>
          <div className="stat-value">10</div>
          <div className="stat-change up">OpenRouter Integrated</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Training Items</div>
          <div className="stat-value">{Object.values(counts).reduce((a, b) => a + b, 0)}</div>
          <div className="stat-change up">Ready to use</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Per Seat Pricing</div>
          <div className="stat-value">$50-200</div>
          <div className="stat-change stable">/month</div>
        </div>
      </div>

      <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: 'var(--text-primary)' }}>
        All Features
      </h2>

      <div className="dashboard-grid">
        {features.map(f => (
          <div key={f.key} className="feature-card" onClick={() => handleCardClick(f)}>
            <div className="card-icon">{f.icon}</div>
            <h3>{f.label}</h3>
            <p>{f.desc}</p>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <span className="card-count">
                {counts[f.key] || 0} items
              </span>
              {f.aiAction && (
                <span className="badge badge-primary">AI Powered</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;

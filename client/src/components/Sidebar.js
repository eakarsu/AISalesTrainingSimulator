import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function Sidebar({ features, activeFeature, setActiveFeature, user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNav = (feature) => {
    setActiveFeature(feature.key);
    navigate(`/${feature.key}`);
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>AI Sales Trainer</h2>
        <p>Enterprise Sales Enablement</p>
      </div>

      <nav className="sidebar-nav">
        <div
          className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}
          onClick={() => { setActiveFeature(null); navigate('/'); }}
        >
          <span className="icon">📈</span>
          Dashboard
        </div>

        {features.map(f => (
          <div
            key={f.key}
            className={`nav-item ${location.pathname === `/${f.key}` ? 'active' : ''}`}
            onClick={() => handleNav(f)}
          >
            <span className="icon">{f.icon}</span>
            {f.label}
          </div>
        ))}

        <div style={{ borderTop: '1px solid var(--border)', margin: '8px 0', paddingTop: '8px' }}>
          <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', padding: '4px 12px', marginBottom: '4px' }}>Training Tools</div>
          {[
            { path: '/roleplay-chat', label: 'Roleplay Chat', icon: '💬' },
            { path: '/leaderboard-page', label: 'Score Rankings', icon: '🏆' },
            { path: '/coaching-plans-page', label: 'Coaching Plans', icon: '🏋️' },
            { path: '/my-sessions', label: 'My Sessions', icon: '📊' },
          ].map(item => (
            <div
              key={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => { setActiveFeature(null); navigate(item.path); }}
            >
              <span className="icon">{item.icon}</span>
              {item.label}
            </div>
          ))}
        </div>
      </nav>

      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">{user.avatar || user.name?.charAt(0)}</div>
          <div className="user-details">
            <div className="name">{user.name}</div>
            <div className="role">{user.role}</div>
          </div>
          <button className="close-btn" onClick={onLogout} title="Logout">✕</button>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;

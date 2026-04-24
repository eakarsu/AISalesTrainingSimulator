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

import React from 'react';

function DetailPanel({ item, feature, onClose, onEdit, onDelete }) {
  if (!item) return null;

  const excludeKeys = ['id', 'createdAt', 'updatedAt'];

  const formatKey = (key) => {
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
  };

  const formatValue = (key, value) => {
    if (value === null || value === undefined) return '—';
    if (key === 'dealValue') return `$${Number(value).toLocaleString()}`;
    if (key === 'score' || key === 'metricValue') return Number(value).toFixed(1);
    if (key === 'conversionRate' || key === 'winRate' || key === 'completionRate') return `${value}%`;
    if (key === 'duration') return `${value} min`;
    return String(value);
  };

  const getBadgeClass = (key, value) => {
    const v = String(value).toLowerCase();
    if (['active', 'completed', 'reviewed', 'won', 'high', 'common'].includes(v)) return 'badge-success';
    if (['draft', 'in_progress', 'intermediate', 'medium', 'occasional'].includes(v)) return 'badge-warning';
    if (['archived', 'lost', 'hard', 'rare', 'low'].includes(v)) return 'badge-danger';
    if (['beginner', 'easy', 'paused'].includes(v)) return 'badge-info';
    return 'badge-primary';
  };

  const isBadgeField = (key) => {
    return ['status', 'difficulty', 'outcome', 'effectiveness', 'riskLevel', 'frequency', 'trend', 'role'].includes(key);
  };

  return (
    <div className="detail-overlay" onClick={onClose}>
      <div className="detail-panel" onClick={e => e.stopPropagation()}>
        <div className="detail-header">
          <h2>{feature.icon} {item.title || item.name || item.competitorName || item.productName || item.metricName || `Item #${item.id}`}</h2>
          <div className="actions">
            <button className="btn btn-sm btn-secondary" onClick={onEdit}>Edit</button>
            <button className="btn btn-sm btn-danger" onClick={onDelete}>Delete</button>
            <button className="close-btn" onClick={onClose}>✕</button>
          </div>
        </div>
        <div className="detail-body">
          {Object.entries(item)
            .filter(([key]) => !excludeKeys.includes(key))
            .map(([key, value]) => (
              <div className="detail-field" key={key}>
                <label>{formatKey(key)}</label>
                <div className="value">
                  {isBadgeField(key) ? (
                    <span className={`badge ${getBadgeClass(key, value)}`}>{String(value)}</span>
                  ) : (
                    formatValue(key, value)
                  )}
                </div>
              </div>
            ))}

          <div className="detail-field" style={{ borderTop: '1px solid var(--border)', paddingTop: 16, marginTop: 8 }}>
            <label>Created</label>
            <div className="value" style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {new Date(item.createdAt).toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DetailPanel;

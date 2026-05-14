import React, { useState, useEffect } from 'react';
import api from '../services/api';

function MySessionsPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/sessions?limit=100')
      .then(r => {
        const data = r.data?.data || r.data || [];
        setSessions([...data].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)));
      })
      .catch(() => setSessions([]))
      .finally(() => setLoading(false));
  }, []);

  const sessionsWithScores = sessions.filter(s => s.score);

  const statusColor = { completed: '#10b981', in_progress: '#3b82f6', reviewed: '#8b5cf6' };

  return (
    <div>
      <div className="page-header">
        <h1>My Sessions</h1>
      </div>

      {sessionsWithScores.length > 0 && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
          <h3 style={{ marginBottom: '16px', fontSize: '15px' }}>Score Trend</h3>
          <div style={{ position: 'relative', height: '120px', display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
            {sessionsWithScores.map((s, i) => {
              const h = Math.max(8, (s.score / 100) * 100);
              const color = s.score >= 80 ? '#10b981' : s.score >= 60 ? '#3b82f6' : '#f59e0b';
              return (
                <div key={s.id} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{s.score?.toFixed(0)}</div>
                  <div style={{ width: '100%', height: `${h}px`, background: color, borderRadius: '4px 4px 0 0', transition: 'height 0.3s' }} title={`Session ${i + 1}: ${s.score}`} />
                  <div style={{ fontSize: '9px', color: 'var(--text-secondary)' }}>{i + 1}</div>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: '12px', display: 'flex', gap: '24px', fontSize: '13px' }}>
            <div>
              <span style={{ color: 'var(--text-secondary)' }}>Avg Score: </span>
              <strong>{(sessionsWithScores.reduce((a, s) => a + s.score, 0) / sessionsWithScores.length).toFixed(1)}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-secondary)' }}>Best: </span>
              <strong style={{ color: '#10b981' }}>{Math.max(...sessionsWithScores.map(s => s.score)).toFixed(1)}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-secondary)' }}>Sessions: </span>
              <strong>{sessionsWithScores.length}</strong>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>Loading...</div>
      ) : sessions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text-secondary)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🎭</div>
          <p>No sessions yet. Go to Roleplay Chat to start your first session!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[...sessions].reverse().map((session) => (
            <div key={session.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '4px' }}>{session.title}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {new Date(session.createdAt).toLocaleString()} |
                  Duration: {session.duration ? `${session.duration}min` : 'N/A'}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {session.score && (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '20px', fontWeight: '700', color: session.score >= 80 ? '#10b981' : session.score >= 60 ? '#3b82f6' : '#f59e0b' }}>
                      {session.score?.toFixed(0)}
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>score</div>
                  </div>
                )}
                <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', background: `${statusColor[session.status] || '#6b7280'}15`, color: statusColor[session.status] || '#6b7280', border: `1px solid ${statusColor[session.status] || '#6b7280'}30`, textTransform: 'capitalize' }}>
                  {session.status?.replace('_', ' ') || 'unknown'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MySessionsPage;

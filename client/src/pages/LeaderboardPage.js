import React, { useState, useEffect } from 'react';
import api from '../services/api';

function LeaderboardPage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/leaderboard?limit=50')
      .then(r => {
        const data = r.data?.data || r.data || [];
        // Sort by totalScore desc
        const sorted = [...data].sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0));
        setEntries(sorted.map((e, i) => ({ ...e, rank: i + 1 })));
      })
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, []);

  const badge = (score) => {
    if (score >= 90) return { label: 'Elite', color: '#f59e0b', icon: '👑' };
    if (score >= 80) return { label: 'Expert', color: '#8b5cf6', icon: '⭐' };
    if (score >= 70) return { label: 'Pro', color: '#3b82f6', icon: '🥇' };
    if (score >= 60) return { label: 'Rising', color: '#10b981', icon: '🥈' };
    return { label: 'Trainee', color: '#6b7280', icon: '🥉' };
  };

  const rankStyle = (rank) => {
    if (rank === 1) return { background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)' };
    if (rank === 2) return { background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)' };
    if (rank === 3) return { background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)' };
    return { background: 'var(--bg-card)', border: '1px solid var(--border)' };
  };

  return (
    <div>
      <div className="page-header">
        <h1>🏆 Leaderboard</h1>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>Loading...</div>
      ) : entries.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🏆</div>
          <p>No scores yet. Complete roleplay sessions to appear here!</p>
        </div>
      ) : (
        <>
          {/* Top 3 podium */}
          {entries.length >= 3 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '32px', alignItems: 'flex-end' }}>
              {[entries[1], entries[0], entries[2]].map((e, i) => {
                const heights = [180, 220, 160];
                const colors = ['#8b5cf6', '#f59e0b', '#10b981'];
                const podiumRanks = [2, 1, 3];
                return (
                  <div key={e?.id || i} style={{ textAlign: 'center', width: '140px' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '8px' }}>{badge(e?.totalScore)?.icon}</div>
                    <div style={{ fontWeight: '700', fontSize: '15px', marginBottom: '4px' }}>{e?.userName || '—'}</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>{e?.totalScore?.toFixed(1) || 0} pts</div>
                    <div style={{ height: `${heights[i]}px`, background: `${colors[i]}30`, border: `2px solid ${colors[i]}`, borderRadius: '8px 8px 0 0', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '12px' }}>
                      <span style={{ fontSize: '24px', fontWeight: '800', color: colors[i] }}>#{podiumRanks[i]}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Full rankings */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {entries.map((entry) => {
              const b = badge(entry.totalScore || 0);
              return (
                <div key={entry.id} style={{ ...rankStyle(entry.rank), borderRadius: '12px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: entry.rank <= 3 ? '#f59e0b20' : 'var(--bg)', fontWeight: '700', fontSize: '15px', color: entry.rank <= 3 ? '#f59e0b' : 'var(--text-secondary)', border: `1px solid ${entry.rank <= 3 ? '#f59e0b40' : 'var(--border)'}` }}>
                    {entry.rank}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', fontSize: '15px' }}>{entry.userName || 'Unknown'}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {entry.sessionsCompleted || 0} sessions completed
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '22px', fontWeight: '700', color: b.color }}>{(entry.totalScore || 0).toFixed(1)}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>score</div>
                  </div>
                  <div style={{ padding: '4px 12px', borderRadius: '20px', background: `${b.color}15`, border: `1px solid ${b.color}30`, fontSize: '12px', fontWeight: '600', color: b.color }}>
                    {b.icon} {b.label}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export default LeaderboardPage;

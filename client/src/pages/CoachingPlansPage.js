import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';

function CoachingPlansPage() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selected, setSelected] = useState(null);

  const fetchPlans = () => {
    setLoading(true);
    api.get('/coaching?limit=50')
      .then(r => setPlans(r.data?.data || r.data || []))
      .catch(() => setPlans([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchPlans(); }, []);

  const generatePlans = async () => {
    setGenerating(true);
    try {
      const { data } = await api.post('/ai/generate-coaching-plans');
      toast.success(`Generated ${data.total} coaching plan(s)!`);
      fetchPlans();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to generate plans');
    }
    setGenerating(false);
  };

  const statusColor = { active: '#10b981', completed: '#3b82f6', paused: '#f59e0b' };

  return (
    <div>
      <div className="page-header">
        <h1>Coaching Plans</h1>
        <button className="btn btn-ai" onClick={generatePlans} disabled={generating}>
          {generating ? 'Generating...' : '✦ Generate AI Plans'}
        </button>
      </div>

      <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
        AI generates personalized coaching plans based on each rep's session performance, targeting their weakest areas.
      </p>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>Loading...</div>
      ) : plans.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text-secondary)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🏋️</div>
          <p>No coaching plans yet. Click "Generate AI Plans" to create personalized plans for all users.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {plans.map(plan => (
            <div
              key={plan.id}
              onClick={() => setSelected(selected?.id === plan.id ? null : plan)}
              style={{ background: 'var(--bg-card)', border: `1px solid ${selected?.id === plan.id ? 'var(--accent)' : 'var(--border)'}`, borderRadius: '12px', padding: '20px', cursor: 'pointer', transition: 'all 0.15s' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '600', lineHeight: '1.4' }}>{plan.title}</h3>
                <span style={{ padding: '2px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', background: `${statusColor[plan.status]}15`, color: statusColor[plan.status], border: `1px solid ${statusColor[plan.status]}30`, textTransform: 'capitalize', whiteSpace: 'nowrap', marginLeft: '8px' }}>
                  {plan.status}
                </span>
              </div>

              {plan.currentPhase && (
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  Phase: {plan.currentPhase}
                </div>
              )}

              {plan.goals && (
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
                  {plan.goals.substring(0, 120)}{plan.goals.length > 120 ? '...' : ''}
                </p>
              )}

              {selected?.id === plan.id && (
                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                  {plan.milestones && (
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase' }}>Milestones</div>
                      <div style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                        {(() => {
                          try {
                            const parsed = JSON.parse(plan.milestones);
                            return Array.isArray(parsed) ? parsed.map((m, i) => (
                              <div key={i} style={{ padding: '4px 0', display: 'flex', gap: '8px' }}>
                                <span style={{ color: '#10b981' }}>✓</span> {m}
                              </div>
                            )) : plan.milestones;
                          } catch (_) {
                            return plan.milestones;
                          }
                        })()}
                      </div>
                    </div>
                  )}
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    Start: {plan.startDate || 'Not set'} | End: {plan.endDate || 'Ongoing'}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CoachingPlansPage;

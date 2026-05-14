import React, { useState } from 'react';
import api from '../services/api';
import AIResponse from '../components/AIResponse';
import { toast } from 'react-toastify';

const STAGES = ['Prospecting', 'Discovery', 'Qualification', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];

function DealStageProgressorPage() {
  const [dealName, setDealName] = useState('');
  const [currentStage, setCurrentStage] = useState('Discovery');
  const [dealValue, setDealValue] = useState('');
  const [stakeholders, setStakeholders] = useState('');
  const [recentActivity, setRecentActivity] = useState('');
  const [blockers, setBlockers] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!dealName.trim()) {
      setError('Deal name is required.');
      return;
    }
    setLoading(true); setError(''); setResult(null);
    try {
      const res = await api.post('/ai/deal-stage-progressor', {
        dealName,
        currentStage,
        dealValue: dealValue ? Number(dealValue) : undefined,
        stakeholders,
        recentActivity,
        blockers,
      });
      setResult(res.data?.analysis || res.data);
    } catch (err) {
      const msg = err.response?.data?.error || 'Stage analysis failed';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="feature-page">
      <header className="page-header">
        <h1>💰 Deal Stage Progressor</h1>
        <p>Stage health, next-best actions, champion mapping, win probability, and drafted messaging.</p>
      </header>

      <div className="card" style={{ marginBottom: 20 }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Deal name *</label>
            <input className="form-control" value={dealName} onChange={(e) => setDealName(e.target.value)} required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label>Current stage</label>
              <select className="form-control" value={currentStage} onChange={(e) => setCurrentStage(e.target.value)}>
                {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Deal value ($)</label>
              <input
                type="number"
                min="0"
                className="form-control"
                value={dealValue}
                onChange={(e) => setDealValue(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Stakeholders</label>
            <textarea
              className="form-control"
              rows={3}
              value={stakeholders}
              onChange={(e) => setStakeholders(e.target.value)}
              placeholder="e.g. EB: VP Eng (lukewarm), Champion: Senior Eng (engaged), Procurement: not yet looped in"
            />
          </div>

          <div className="form-group">
            <label>Recent activity</label>
            <textarea
              className="form-control"
              rows={3}
              value={recentActivity}
              onChange={(e) => setRecentActivity(e.target.value)}
              placeholder="Recent meetings, demos, mutual action plan progress, emails..."
            />
          </div>

          <div className="form-group">
            <label>Blockers / risks</label>
            <textarea
              className="form-control"
              rows={2}
              value={blockers}
              onChange={(e) => setBlockers(e.target.value)}
              placeholder="Anything slowing this deal down..."
            />
          </div>

          {error && <div className="error-msg">{error}</div>}

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Analyzing...' : 'Progress Deal'}
          </button>
        </form>
      </div>

      {loading && <div className="loading">AI is analyzing the deal...</div>}
      {result && <AIResponse data={result} />}
    </div>
  );
}

export default DealStageProgressorPage;

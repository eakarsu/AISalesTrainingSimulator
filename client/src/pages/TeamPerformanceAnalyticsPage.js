import React, { useState } from 'react';
import api from '../services/api';
import AIResponse from '../components/AIResponse';
import { toast } from 'react-toastify';

function TeamPerformanceAnalyticsPage() {
  const [period, setPeriod] = useState('last 30 days');
  const [focus, setFocus] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setResult(null);
    try {
      const res = await api.post('/ai/team-performance-analytics', { period, focus });
      setResult(res.data?.analytics || res.data);
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.error || 'Team analytics request failed';
      const decorated = status === 503 ? `${msg} (server is missing the LLM API key)` : msg;
      setError(decorated);
      toast.error(decorated);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="feature-page">
      <header className="page-header">
        <h1>📊 Team Performance Analytics</h1>
        <p>Synthesise leaderboard + recent sessions/pitches into coaching priorities and a 2-week action plan.</p>
      </header>

      <div className="card" style={{ marginBottom: 20 }}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label>Period</label>
              <input
                className="form-control"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                placeholder="e.g. last 30 days, Q3, this month"
              />
            </div>
            <div className="form-group">
              <label>Manager focus (optional)</label>
              <input
                className="form-control"
                value={focus}
                onChange={(e) => setFocus(e.target.value)}
                placeholder="e.g. discovery quality, late-stage closing"
              />
            </div>
          </div>

          {error && <div className="error-msg">{error}</div>}

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Analyzing...' : 'Generate Team Analytics'}
          </button>
        </form>
      </div>

      {loading && <div className="loading">AI is analysing team activity...</div>}
      {result && <AIResponse data={result} />}
    </div>
  );
}

export default TeamPerformanceAnalyticsPage;

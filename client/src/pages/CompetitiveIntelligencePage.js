import React, { useState } from 'react';
import api from '../services/api';
import AIResponse from '../components/AIResponse';
import { toast } from 'react-toastify';

function CompetitiveIntelligencePage() {
  const [competitor, setCompetitor] = useState('');
  const [ourProduct, setOurProduct] = useState('');
  const [dealContext, setDealContext] = useState('');
  const [knownStrengths, setKnownStrengths] = useState('');
  const [knownWeaknesses, setKnownWeaknesses] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!competitor.trim()) {
      setError('Competitor name is required.');
      return;
    }
    setLoading(true); setError(''); setResult(null);
    try {
      const res = await api.post('/ai/competitive-intelligence', {
        competitor,
        ourProduct,
        dealContext,
        knownStrengths,
        knownWeaknesses,
      });
      setResult(res.data?.brief || res.data?.analysis || res.data);
    } catch (err) {
      const msg = err.response?.data?.error || 'Intelligence brief failed';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="feature-page">
      <header className="page-header">
        <h1>⚔️ Competitive Intelligence</h1>
        <p>Competitor battle brief with rebuttals, trap questions, and recommended proof assets.</p>
      </header>

      <div className="card" style={{ marginBottom: 20 }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Competitor *</label>
            <input className="form-control" value={competitor} onChange={(e) => setCompetitor(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Our product</label>
            <input className="form-control" value={ourProduct} onChange={(e) => setOurProduct(e.target.value)} placeholder="e.g. CloudOptimize Pro" />
          </div>
          <div className="form-group">
            <label>Deal context</label>
            <textarea
              className="form-control"
              rows={3}
              value={dealContext}
              onChange={(e) => setDealContext(e.target.value)}
              placeholder="Industry, deal size, decision criteria, evaluation timeline..."
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label>Their known strengths</label>
              <textarea
                className="form-control"
                rows={3}
                value={knownStrengths}
                onChange={(e) => setKnownStrengths(e.target.value)}
                placeholder="What customers like about them..."
              />
            </div>
            <div className="form-group">
              <label>Their known weaknesses</label>
              <textarea
                className="form-control"
                rows={3}
                value={knownWeaknesses}
                onChange={(e) => setKnownWeaknesses(e.target.value)}
                placeholder="Where they fall short..."
              />
            </div>
          </div>

          {error && <div className="error-msg">{error}</div>}

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Generating...' : 'Generate Battle Brief'}
          </button>
        </form>
      </div>

      {loading && <div className="loading">AI is generating competitive intel...</div>}
      {result && <AIResponse data={result} />}
    </div>
  );
}

export default CompetitiveIntelligencePage;

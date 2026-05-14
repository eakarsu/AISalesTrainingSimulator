import React, { useState } from 'react';
import api from '../services/api';
import AIResponse from '../components/AIResponse';
import { toast } from 'react-toastify';

function ObjectionDatabasePage() {
  const [product, setProduct] = useState('');
  const [industry, setIndustry] = useState('');
  const [dealStage, setDealStage] = useState('');
  const [persona, setPersona] = useState('');
  const [knownObjections, setKnownObjections] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!product.trim()) {
      setError('Product is required.');
      return;
    }
    setLoading(true); setError(''); setResult(null);
    try {
      const res = await api.post('/ai/objection-database', {
        product,
        industry,
        dealStage,
        persona,
        knownObjections,
      });
      setResult(res.data?.objection_database || res.data);
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.error || 'Objection database generation failed';
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
        <h1>🛡️ Objection Database</h1>
        <p>Generate a structured objection library with canonical responses, traps to avoid, and follow-up questions.</p>
      </header>

      <div className="card" style={{ marginBottom: 20 }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Product *</label>
            <input
              className="form-control"
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              placeholder="e.g. CloudOptimize Pro"
              required
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label>Industry</label>
              <input
                className="form-control"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="e.g. mid-market fintech"
              />
            </div>
            <div className="form-group">
              <label>Deal stage</label>
              <input
                className="form-control"
                value={dealStage}
                onChange={(e) => setDealStage(e.target.value)}
                placeholder="e.g. evaluation, procurement, negotiation"
              />
            </div>
          </div>
          <div className="form-group">
            <label>Buyer persona</label>
            <input
              className="form-control"
              value={persona}
              onChange={(e) => setPersona(e.target.value)}
              placeholder="e.g. VP Engineering, CFO, Director of IT"
            />
          </div>
          <div className="form-group">
            <label>Known objections (one per line)</label>
            <textarea
              className="form-control"
              rows={5}
              value={knownObjections}
              onChange={(e) => setKnownObjections(e.target.value)}
              placeholder={'We already have a tool for this\nWe can build it ourselves\nNot in the budget this quarter'}
            />
          </div>

          {error && <div className="error-msg">{error}</div>}

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Generating...' : 'Generate Objection Database'}
          </button>
        </form>
      </div>

      {loading && <div className="loading">AI is curating your objection library...</div>}
      {result && <AIResponse data={result} />}
    </div>
  );
}

export default ObjectionDatabasePage;

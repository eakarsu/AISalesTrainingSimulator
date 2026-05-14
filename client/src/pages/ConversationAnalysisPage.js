import React, { useState } from 'react';
import api from '../services/api';
import AIResponse from '../components/AIResponse';
import { toast } from 'react-toastify';

function ConversationAnalysisPage() {
  const [transcript, setTranscript] = useState('');
  const [scenario, setScenario] = useState('');
  const [productName, setProductName] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!transcript.trim()) {
      setError('Transcript is required.');
      return;
    }
    setLoading(true); setError(''); setResult(null);
    try {
      const res = await api.post('/ai/conversation-analysis', {
        transcript,
        scenario,
        productName,
      });
      setResult(res.data?.analysis || res.data);
    } catch (err) {
      const msg = err.response?.data?.error || 'Conversation analysis failed';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="feature-page">
      <header className="page-header">
        <h1>🎙️ Conversation Analysis</h1>
        <p>Score a sales-call transcript across 6 dimensions, with talk-ratio, missed opportunities, and coaching actions.</p>
      </header>

      <div className="card" style={{ marginBottom: 20 }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Transcript *</label>
            <textarea
              className="form-control"
              rows={10}
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder={'Rep: ...\nProspect: ...\nRep: ...\n'}
            />
          </div>
          <div className="form-group">
            <label>Scenario context</label>
            <input
              className="form-control"
              value={scenario}
              onChange={(e) => setScenario(e.target.value)}
              placeholder="e.g. Discovery call with VP Engineering at fintech, 200 employees"
            />
          </div>
          <div className="form-group">
            <label>Product name</label>
            <input
              className="form-control"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="e.g. CloudOptimize Pro"
            />
          </div>

          {error && <div className="error-msg">{error}</div>}

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Analyzing...' : 'Analyze Conversation'}
          </button>
        </form>
      </div>

      {loading && <div className="loading">AI is analyzing the conversation...</div>}
      {result && <AIResponse data={result} />}
    </div>
  );
}

export default ConversationAnalysisPage;

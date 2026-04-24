import React, { useState } from 'react';
import api from '../services/api';
import AIResponse from './AIResponse';

const aiConfigs = {
  roleplay: {
    title: 'AI Role Play',
    fields: [
      { key: 'scenario', label: 'Scenario', placeholder: 'Describe the sales scenario...', type: 'textarea' },
      { key: 'buyerPersona', label: 'Buyer Persona', placeholder: 'e.g., CTO of mid-market tech company' },
      { key: 'userMessage', label: 'Your Message', placeholder: 'Start the conversation...', type: 'textarea' }
    ],
    endpoint: '/ai/roleplay'
  },
  'handle-objection': {
    title: 'AI Objection Handler',
    fields: [
      { key: 'objection', label: 'Objection', placeholder: 'Enter the objection you received...', type: 'textarea' },
      { key: 'industry', label: 'Industry', placeholder: 'e.g., Technology, Healthcare...' },
      { key: 'context', label: 'Context', placeholder: 'Additional context about the situation...', type: 'textarea' }
    ],
    endpoint: '/ai/handle-objection'
  },
  'analyze-pitch': {
    title: 'AI Pitch Analyzer',
    fields: [
      { key: 'pitchText', label: 'Your Pitch', placeholder: 'Enter your sales pitch...', type: 'textarea' },
      { key: 'productName', label: 'Product Name', placeholder: 'e.g., CloudOptimize Pro' },
      { key: 'targetAudience', label: 'Target Audience', placeholder: 'e.g., CTO, VP Sales...' }
    ],
    endpoint: '/ai/analyze-pitch'
  },
  'coaching-feedback': {
    title: 'AI Coach',
    fields: [
      { key: 'transcript', label: 'Call Transcript', placeholder: 'Paste the call transcript here...', type: 'textarea' },
      { key: 'context', label: 'Context', placeholder: 'e.g., Discovery call with enterprise prospect' }
    ],
    endpoint: '/ai/coaching-feedback'
  },
  'generate-script': {
    title: 'AI Script Generator',
    fields: [
      { key: 'scriptType', label: 'Script Type', placeholder: 'e.g., Cold Call, Discovery, Demo...' },
      { key: 'industry', label: 'Industry', placeholder: 'e.g., Technology, Healthcare...' },
      { key: 'targetRole', label: 'Target Role', placeholder: 'e.g., CTO, VP Sales...' },
      { key: 'objective', label: 'Objective', placeholder: 'e.g., Book a meeting, Demo...' }
    ],
    endpoint: '/ai/generate-script'
  },
  'generate-email': {
    title: 'AI Email Generator',
    fields: [
      { key: 'emailType', label: 'Email Type', placeholder: 'e.g., Cold Outreach, Follow-up...' },
      { key: 'context', label: 'Context', placeholder: 'Describe the situation...', type: 'textarea' },
      { key: 'recipientInfo', label: 'Recipient', placeholder: 'e.g., CTO at Series B startup' },
      { key: 'tone', label: 'Tone', placeholder: 'e.g., Professional, Casual, Urgent...' }
    ],
    endpoint: '/ai/generate-email'
  },
  'deal-strategy': {
    title: 'AI Deal Strategist',
    fields: [
      { key: 'dealInfo', label: 'Deal Information', placeholder: 'Describe the deal...', type: 'textarea' },
      { key: 'challenges', label: 'Challenges', placeholder: 'What obstacles are you facing?', type: 'textarea' },
      { key: 'stakeholders', label: 'Stakeholders', placeholder: 'List key stakeholders and roles...' }
    ],
    endpoint: '/ai/deal-strategy'
  },
  'simulate-persona': {
    title: 'AI Persona Simulator',
    fields: [
      { key: 'personaInfo', label: 'Persona Details', placeholder: 'Describe the buyer persona...', type: 'textarea' },
      { key: 'question', label: 'Your Question/Pitch', placeholder: 'What do you want to say to this persona?', type: 'textarea' }
    ],
    endpoint: '/ai/simulate-persona'
  },
  'generate-battlecard': {
    title: 'AI Battle Card Generator',
    fields: [
      { key: 'competitorName', label: 'Competitor Name', placeholder: 'e.g., Salesforce, HubSpot...' },
      { key: 'ourProduct', label: 'Our Product', placeholder: 'Describe our product...' },
      { key: 'industry', label: 'Industry', placeholder: 'e.g., Sales Technology...' }
    ],
    endpoint: '/ai/generate-battlecard'
  },
  'negotiation-coach': {
    title: 'AI Negotiation Coach',
    fields: [
      { key: 'situation', label: 'Situation', placeholder: 'Describe the negotiation...', type: 'textarea' },
      { key: 'theirPosition', label: 'Their Position', placeholder: 'What are they asking for?' },
      { key: 'ourPosition', label: 'Our Position', placeholder: 'What is our ideal outcome?' }
    ],
    endpoint: '/ai/negotiation-coach'
  }
};

function AIPanel({ feature, onClose }) {
  const config = aiConfigs[feature.aiAction];
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);

  if (!config) return null;

  const handleChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResponse(null);
    try {
      const { data } = await api.post(config.endpoint, formData);
      setResponse(data);
    } catch (err) {
      setResponse({ error: err.response?.data?.error || 'AI request failed. Check your OpenRouter API key.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-response animate-fade" style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3>{config.title}</h3>
        <button className="close-btn" onClick={onClose}>✕</button>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: config.fields.length > 2 ? '1fr 1fr' : '1fr', gap: 12 }}>
          {config.fields.map(field => (
            <div className="form-group" key={field.key} style={field.type === 'textarea' ? { gridColumn: '1 / -1' } : {}}>
              <label>{field.label}</label>
              {field.type === 'textarea' ? (
                <textarea
                  value={formData[field.key] || ''}
                  onChange={e => handleChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  style={{ minHeight: 80 }}
                />
              ) : (
                <input
                  type="text"
                  value={formData[field.key] || ''}
                  onChange={e => handleChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                />
              )}
            </div>
          ))}
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: 12 }}>
          {loading ? 'AI is thinking...' : `Generate with AI`}
        </button>
      </form>

      {loading && (
        <div className="ai-loading" style={{ marginTop: 16 }}>
          <div className="dots">
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
          AI is analyzing and generating response...
        </div>
      )}

      {response && !loading && <AIResponse data={response} />}
    </div>
  );
}

export default AIPanel;

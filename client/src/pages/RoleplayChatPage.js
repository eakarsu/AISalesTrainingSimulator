import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';

function RoleplayChatPage() {
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [scenario, setScenario] = useState('Enterprise software sale');
  const [buyerPersona, setBuyerPersona] = useState('CFO at a 500-person manufacturing company');
  const [sessionStarted, setSessionStarted] = useState(false);
  const [assessment, setAssessment] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startSession = async () => {
    try {
      const { data } = await api.post('/sessions', {
        title: `Roleplay - ${scenario} - ${new Date().toLocaleString()}`,
        status: 'in_progress',
      });
      setSessionId(data.id || data?.data?.id);
      setSessionStarted(true);
      setMessages([{
        role: 'system',
        content: `Session started. Scenario: ${scenario}. Buyer: ${buyerPersona}. Begin your pitch!`,
      }]);
    } catch (err) {
      toast.error('Failed to start session');
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const { data } = await api.post('/ai/roleplay', {
        sessionId,
        userMessage: userMsg,
        scenario,
        buyerPersona,
      });

      const aiResponse = data.response;
      setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);

      // Check for assessment
      if (aiResponse.includes('---ASSESSMENT---')) {
        const assessmentPart = aiResponse.split('---ASSESSMENT---')[1];
        setAssessment(assessmentPart);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to get response');
    }
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const resetSession = () => {
    setSessionId(null);
    setMessages([]);
    setSessionStarted(false);
    setAssessment(null);
    setInput('');
  };

  const roleColor = { user: '#3b82f6', assistant: '#8b5cf6', system: '#6b7280' };
  const roleBg = { user: 'rgba(59,130,246,0.08)', assistant: 'rgba(139,92,246,0.08)', system: 'rgba(107,114,128,0.08)' };
  const roleLabel = { user: 'You (Sales Rep)', assistant: 'AI Buyer', system: 'System' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 60px)' }}>
      <div className="page-header" style={{ flexShrink: 0 }}>
        <h1>Roleplay Chat</h1>
        {sessionStarted && (
          <button className="btn btn-secondary" onClick={resetSession}>New Session</button>
        )}
      </div>

      {!sessionStarted ? (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '28px', maxWidth: '600px' }}>
          <h3 style={{ marginBottom: '20px' }}>Configure Your Roleplay Session</h3>
          <div className="form-group">
            <label>Sales Scenario</label>
            <textarea
              value={scenario}
              onChange={e => setScenario(e.target.value)}
              rows={2}
              placeholder="Describe the sales scenario..."
            />
          </div>
          <div className="form-group">
            <label>Buyer Persona</label>
            <input
              type="text"
              value={buyerPersona}
              onChange={e => setBuyerPersona(e.target.value)}
              placeholder="e.g., CFO at a mid-market company..."
            />
          </div>
          <button className="btn btn-primary" onClick={startSession}>
            Start Roleplay Session
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', gap: '16px' }}>
          {/* Session info */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 16px', fontSize: '13px', color: 'var(--text-secondary)', flexShrink: 0 }}>
            <strong>Scenario:</strong> {scenario} | <strong>Buyer:</strong> {buyerPersona} | Session #{sessionId}
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: '8px' }}>
            {messages.map((msg, i) => (
              <div key={i} style={{
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '75%',
                background: roleBg[msg.role] || 'var(--bg-card)',
                border: `1px solid ${roleColor[msg.role] || 'var(--border)'}30`,
                borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                padding: '12px 16px',
              }}>
                <div style={{ fontSize: '11px', fontWeight: '600', color: roleColor[msg.role] || 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase' }}>
                  {roleLabel[msg.role] || msg.role}
                </div>
                <div style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>
                  {msg.content.split('---ASSESSMENT---')[0]}
                </div>
                {msg.content.includes('---ASSESSMENT---') && (
                  <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(16,185,129,0.1)', borderRadius: '8px', borderLeft: '3px solid #10b981' }}>
                    <div style={{ fontSize: '12px', fontWeight: '700', color: '#10b981', marginBottom: '6px' }}>ASSESSMENT</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>
                      {msg.content.split('---ASSESSMENT---')[1]}
                    </div>
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div style={{ alignSelf: 'flex-start', padding: '12px 16px', background: 'rgba(139,92,246,0.08)', borderRadius: '14px', fontSize: '14px', color: '#8b5cf6' }}>
                AI Buyer is thinking...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          {!assessment ? (
            <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your sales message... (Enter to send, Shift+Enter for new line)"
                style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)', resize: 'none', minHeight: '60px', fontSize: '14px' }}
                rows={2}
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="btn btn-primary"
                style={{ alignSelf: 'flex-end', height: '44px' }}
              >
                Send
              </button>
            </div>
          ) : (
            <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid #10b981', borderRadius: '10px', padding: '16px', textAlign: 'center', flexShrink: 0 }}>
              <div style={{ fontWeight: '600', color: '#10b981', marginBottom: '8px' }}>Session Complete - Assessment Recorded!</div>
              <button className="btn btn-primary" onClick={resetSession}>Start New Session</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default RoleplayChatPage;

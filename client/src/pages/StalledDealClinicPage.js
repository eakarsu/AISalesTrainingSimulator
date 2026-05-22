import React, { useState } from 'react';

const sample = JSON.stringify({
  deal: { stage: 'proposal', daysInStage: 24, value: 68000 },
  signals: ['no executive sponsor', 'pricing objection', 'security review pending']
}, null, 2);

export default function StalledDealClinicPage() {
  const [payload, setPayload] = useState(sample);
  const [result, setResult] = useState(null);

  async function run() {
    const response = await fetch('/api/stalled-deal-clinic/coach', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
    });
    setResult(await response.json());
  }

  return (
    <div className="page">
      <h1>Stalled Deal Clinic</h1>
      <p>Diagnose stuck opportunities and assign the rep a targeted coaching drill.</p>
      <textarea value={payload} onChange={(event) => setPayload(event.target.value)} rows={12} style={{ width: '100%', fontFamily: 'monospace' }} />
      <button className="btn btn-primary" onClick={run}>Coach deal</button>
      {result && (
        <div className="card">
          <h2>Risk {result.risk}/100</h2>
          <p><strong>Next drill:</strong> {result.nextDrill}</p>
          <p>{result.repTalkTrack}</p>
          <ul>{result.coachPlan.map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
      )}
    </div>
  );
}

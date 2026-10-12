import NativeAIControls from "../components/NativeAIControls";
import AIResponse from "../components/AIResponse";
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
    <NativeAIControls context="Sales training" presets={[0,1,2].map(index=>({name:['Quick brief','Team planning','Detailed review'][index],fill:()=>{setPayload(JSON.stringify({deal:{stage:['discovery','proposal','negotiation'][index],daysInStage:[10,24,35][index],value:[24000,68000,95000][index]},signals:['Fictional training deal: no confirmed sponsor','Pricing question pending','Security review not started']},null,2));return{filled:1,manual:[]};}}))}><div className="page">
      <h1>Stalled Deal Clinic</h1>
      <p>Diagnose stuck opportunities and assign the rep a targeted coaching drill.</p>
      <textarea value={payload} onChange={(event) => setPayload(event.target.value)} rows={12} style={{ width: '100%', fontFamily: 'monospace' }} />
      <button className="btn btn-primary" onClick={run}>Coach deal</button>
      {result && <AIResponse data={result}/> }
    </div></NativeAIControls>
  );
}

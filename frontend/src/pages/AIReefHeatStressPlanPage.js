import React, { useState } from 'react';
import { reefHeatStressPlan } from '../services/api';

export default function AIReefHeatStressPlanPage() {
  const [payload, setPayload] = useState('{"reef_site":"Key Largo North","degree_heating_weeks":5.2,"temp_anomaly_c":1.6,"recent_bleaching_pct":18,"nursery_capacity":240}');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const run = async () => {
    setError('');
    try { setResult(await reefHeatStressPlan(JSON.parse(payload || '{}'))); }
    catch (e) { setError(e.message); }
  };
  return (
    <div className="page">
      <div className="page-header"><h2>AI Reef Heat Stress Plan</h2><button className="btn primary" onClick={run}>Score Site</button></div>
      <div className="card"><textarea rows={8} value={payload} onChange={(e) => setPayload(e.target.value)} /></div>
      {error && <div className="alert danger">{error}</div>}
      {result && <pre className="card">{JSON.stringify(result, null, 2)}</pre>}
    </div>
  );
}

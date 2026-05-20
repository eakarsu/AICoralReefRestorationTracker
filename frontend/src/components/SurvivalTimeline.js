import React, { useEffect, useState } from 'react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import { API_BASE, getToken } from '../services/api';

export default function SurvivalTimeline() {
  const [series, setSeries] = useState([]);
  const [err, setErr] = useState(null);

  useEffect(() => {
    const token = getToken();
    fetch(`${API_BASE}/custom-views/survival-timeline`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((d) => setSeries(d.series || []))
      .catch((e) => setErr(e.message));
  }, []);

  return (
    <div style={{ width: '100%', height: 360 }}>
      {err && <div style={{ color: '#fca5a5' }}>Chart load error: {err}</div>}
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={series} margin={{ top: 16, right: 24, left: 0, bottom: 8 }}>
          <defs>
            <linearGradient id="survGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.85} />
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="month" stroke="#94a3b8" />
          <YAxis domain={[0, 100]} stroke="#94a3b8" unit="%" />
          <Tooltip
            contentStyle={{ background: '#0f172a', border: '1px solid #334155', color: '#e2e8f0' }}
            formatter={(v, n) => (n === 'survival_pct' ? [`${v}%`, 'Survival'] : [v, n])}
          />
          <Legend />
          <Area
            type="monotone"
            dataKey="survival_pct"
            name="Survival %"
            stroke="#22c55e"
            fill="url(#survGrad)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

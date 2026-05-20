import React, { useEffect, useState } from 'react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import { API_BASE, getToken } from '../services/api';

const COLORS = {
  temperature: '#f97316',
  pH:          '#3b82f6',
  turbidity:   '#a855f7',
};

export default function WaterQualityChart() {
  const [series, setSeries] = useState([]);
  const [err, setErr] = useState(null);

  useEffect(() => {
    const token = getToken();
    fetch(`${API_BASE}/custom-views/water-quality-series`, {
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
        <LineChart data={series} margin={{ top: 16, right: 24, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="ts" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" />
          <Tooltip
            contentStyle={{ background: '#0f172a', border: '1px solid #334155', color: '#e2e8f0' }}
          />
          <Legend />
          <Line type="monotone" dataKey="temperature" stroke={COLORS.temperature} strokeWidth={2} dot={{ r: 3 }} connectNulls />
          <Line type="monotone" dataKey="pH"          stroke={COLORS.pH}          strokeWidth={2} dot={{ r: 3 }} connectNulls />
          <Line type="monotone" dataKey="turbidity"   stroke={COLORS.turbidity}   strokeWidth={2} dot={{ r: 3 }} connectNulls />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

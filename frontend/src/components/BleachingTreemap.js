import React, { useEffect, useState } from 'react';
import { ResponsiveContainer, Treemap, Tooltip } from 'recharts';
import { API_BASE, getToken } from '../services/api';

const SEVERITY_COLOR = {
  low:      '#22c55e',
  medium:   '#facc15',
  high:     '#fb923c',
  critical: '#ef4444',
};

function CustomTreemapContent(props) {
  const { x, y, width, height, name, payload } = props;
  const sev = String(payload?.severity || 'low').toLowerCase();
  const fill = SEVERITY_COLOR[sev] || '#6366f1';
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill={fill} stroke="#0f172a" strokeWidth={1} />
      {width > 80 && height > 30 && (
        <text x={x + 6} y={y + 18} fill="#0f172a" fontSize={12} fontWeight={700}>
          {name}
        </text>
      )}
      {width > 80 && height > 50 && (
        <text x={x + 6} y={y + 34} fill="#0f172a" fontSize={11}>
          {payload?.avg_bleached_pct}% avg · {payload?.events} ev
        </text>
      )}
    </g>
  );
}

export default function BleachingTreemap() {
  const [items, setItems] = useState([]);
  const [err, setErr] = useState(null);

  useEffect(() => {
    const token = getToken();
    fetch(`${API_BASE}/custom-views/bleaching-treemap`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((d) => setItems(d.items || []))
      .catch((e) => setErr(e.message));
  }, []);

  return (
    <div style={{ width: '100%', height: 360 }}>
      {err && <div style={{ color: '#fca5a5' }}>Chart load error: {err}</div>}
      <ResponsiveContainer width="100%" height="100%">
        <Treemap
          data={items}
          dataKey="size"
          nameKey="name"
          stroke="#0f172a"
          content={<CustomTreemapContent />}
        >
          <Tooltip
            contentStyle={{ background: '#0f172a', border: '1px solid #334155', color: '#e2e8f0' }}
            formatter={(value, name, p) => {
              const d = p && p.payload;
              if (!d) return [value, name];
              return [`${d.avg_bleached_pct}% avg / ${d.events} events / worst: ${d.severity}`, d.name];
            }}
          />
        </Treemap>
      </ResponsiveContainer>
    </div>
  );
}

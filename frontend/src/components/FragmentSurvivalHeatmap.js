import React, { useEffect, useState } from 'react';
import { API_BASE, getToken } from '../services/api';

// Color helper: returns background color and text color for survival %.
function colorFor(pct) {
  if (pct == null || isNaN(pct)) return { bg: '#11192b', fg: '#475569' };
  if (pct < 40)  return { bg: '#ef4444', fg: '#0b1220' }; // red
  if (pct < 70)  return { bg: '#f59e0b', fg: '#0b1220' }; // amber
  return            { bg: '#22c55e', fg: '#052e16' };     // green
}

function formatMonth(ym) {
  // ym = "YYYY-MM" -> "MMM 'YY"
  const [y, m] = String(ym).split('-');
  const mi = parseInt(m, 10) - 1;
  const names = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  if (isNaN(mi) || mi < 0 || mi > 11) return ym;
  return `${names[mi]} '${String(y).slice(-2)}`;
}

export default function FragmentSurvivalHeatmap() {
  const [payload, setPayload] = useState({ sites: [], months: [], data: [] });
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    fetch(`${API_BASE}/custom-views/fragment-survival-heatmap`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((d) => setPayload({
        sites:  Array.isArray(d.sites)  ? d.sites  : [],
        months: Array.isArray(d.months) ? d.months : [],
        data:   Array.isArray(d.data)   ? d.data   : [],
      }))
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ color: '#94a3b8' }}>Loading heatmap...</div>;
  if (err)     return <div style={{ color: '#fca5a5' }}>Heatmap error: {err}</div>;

  const { sites, months, data } = payload;

  if (!sites.length || !months.length) {
    return <div style={{ color: '#94a3b8' }}>No survival data available.</div>;
  }

  // CSS grid: first column = site label, then one column per month.
  const gridTemplateColumns = `170px repeat(${months.length}, minmax(54px, 1fr))`;

  const headerCellStyle = {
    fontSize: 11,
    color: '#94a3b8',
    textAlign: 'center',
    padding: '4px 2px',
    borderBottom: '1px solid #1e293b',
  };
  const siteCellStyle = {
    fontSize: 12,
    color: '#cbd5e1',
    padding: '0 8px',
    display: 'flex',
    alignItems: 'center',
    borderRight: '1px solid #1e293b',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  };

  return (
    <div data-testid="fragment-survival-heatmap">
      <div
        style={{
          display: 'grid',
          gridTemplateColumns,
          gap: 2,
          background: '#0b1220',
        }}
      >
        {/* Header row */}
        <div style={{ ...headerCellStyle, textAlign: 'left', paddingLeft: 8 }}>Site \ Month</div>
        {months.map((m) => (
          <div key={`h-${m}`} style={headerCellStyle}>{formatMonth(m)}</div>
        ))}

        {/* Body rows */}
        {sites.map((s, i) => (
          <React.Fragment key={s.site_id || i}>
            <div style={siteCellStyle} title={`${s.site_id} - ${s.name}`}>
              <span style={{ color: '#94a3b8', marginRight: 6 }}>{s.site_id}</span>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.name}</span>
            </div>
            {months.map((m, j) => {
              const v = data[i] ? data[i][j] : null;
              const c = colorFor(v);
              return (
                <div
                  key={`c-${i}-${j}`}
                  className="heatmap-cell"
                  data-testid="heatmap-cell"
                  data-site={s.site_id}
                  data-month={m}
                  title={`${s.site_id} - ${formatMonth(m)}: ${v == null ? 'no data' : v + '%'}`}
                  style={{
                    background: c.bg,
                    color: c.fg,
                    fontSize: 11,
                    fontWeight: 600,
                    height: 34,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 3,
                    opacity: v == null ? 0.35 : 1,
                  }}
                >
                  {v == null ? '' : `${Math.round(v)}%`}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 14, flexWrap: 'wrap' }}>
        <span style={{ color: '#94a3b8', fontSize: 12 }}>Survival %:</span>
        <LegendSwatch color="#ef4444" label="0–40% (low)" />
        <LegendSwatch color="#f59e0b" label="40–70% (medium)" />
        <LegendSwatch color="#22c55e" label="70–100% (high)" />
        <LegendSwatch color="#11192b" label="no data" dim />
      </div>
    </div>
  );
}

function LegendSwatch({ color, label, dim }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <span style={{
        width: 18, height: 14, background: color, borderRadius: 3,
        border: '1px solid #1e293b', opacity: dim ? 0.45 : 1,
      }} />
      <span style={{ color: '#cbd5e1', fontSize: 12 }}>{label}</span>
    </span>
  );
}

import React, { useEffect, useState } from 'react';
import { API_BASE, getToken } from '../services/api';

// Pick an icon based on the visit's conditions text. Falls back to a wave.
function iconForVisit(visit) {
  const c = String(visit.conditions || '').toLowerCase();
  const f = String(visit.findings || '').toLowerCase();
  if (/bleach|thermal/.test(f)) return { icon: 'B', color: '#f59e0b', label: 'bleaching' };
  if (/predat|snail|starfish|crown/.test(f)) return { icon: 'P', color: '#ef4444', label: 'predator' };
  if (/recruit|spat|nursery|growth|outplant/.test(f)) return { icon: 'G', color: '#22c55e', label: 'growth' };
  if (/turbid|silty|runoff/.test(c) || /turbid|silty/.test(f)) return { icon: 'T', color: '#a78bfa', label: 'turbid' };
  if (/rough|choppy|swell/.test(c)) return { icon: 'W', color: '#38bdf8', label: 'rough' };
  if (/clear/.test(c)) return { icon: 'C', color: '#06b6d4', label: 'clear' };
  return { icon: 'V', color: '#64748b', label: 'visit' };
}

function fmtDate(iso) {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return String(iso);
    return d.toLocaleString(undefined, {
      year: 'numeric', month: 'short', day: '2-digit',
      hour: '2-digit', minute: '2-digit',
    });
  } catch (_) { return String(iso); }
}

export default function DiveLogTimeline() {
  const [items, setItems] = useState([]);
  const [err, setErr]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    fetch(`${API_BASE}/custom-views/dive-log`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((d) => setItems(Array.isArray(d) ? d : []))
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ color: '#94a3b8' }}>Loading dive log...</div>;
  if (err)     return <div style={{ color: '#fca5a5' }}>Dive log error: {err}</div>;
  if (!items.length) return <div style={{ color: '#94a3b8' }}>No monitoring visits recorded.</div>;

  // Visible vertical rail to left, circles centered on it.
  const RAIL_LEFT  = 22;   // px from container left edge
  const CIRCLE_DIA = 28;
  const RAIL_W     = 2;

  return (
    <div data-testid="dive-log-timeline" style={{ position: 'relative', paddingLeft: RAIL_LEFT + CIRCLE_DIA / 2 + 16 }}>
      {/* Vertical rail */}
      <div
        style={{
          position: 'absolute',
          top: 6,
          bottom: 6,
          left: RAIL_LEFT + CIRCLE_DIA / 2 - RAIL_W / 2,
          width: RAIL_W,
          background: 'linear-gradient(#0ea5e9, #1e293b)',
          borderRadius: 1,
        }}
      />

      {items.map((it, i) => {
        const ic = iconForVisit(it);
        return (
          <div
            key={it.visit_id || i}
            className="dive-log-event"
            data-testid="dive-log-event"
            style={{ position: 'relative', marginBottom: 18 }}
          >
            {/* Circle on rail */}
            <div
              title={ic.label}
              style={{
                position: 'absolute',
                left: -(CIRCLE_DIA / 2 + 16),
                top: 4,
                width: CIRCLE_DIA,
                height: CIRCLE_DIA,
                borderRadius: '50%',
                background: ic.color,
                color: '#0b1220',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: 13,
                boxShadow: '0 0 0 3px #0b1220',
              }}
            >
              {ic.icon}
            </div>

            {/* Card */}
            <div
              style={{
                background: '#0f172a',
                border: '1px solid #1e293b',
                borderRadius: 10,
                padding: '10px 14px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                <div style={{ color: '#e2e8f0', fontWeight: 600 }}>
                  {it.site_name}
                  <span style={{ color: '#64748b', fontWeight: 400, marginLeft: 8, fontSize: 12 }}>
                    ({it.site_id})
                  </span>
                </div>
                <div style={{ color: '#94a3b8', fontSize: 12 }}>{fmtDate(it.visit_at)}</div>
              </div>
              <div style={{ color: '#cbd5e1', fontSize: 13, marginTop: 4 }}>
                <span style={{ color: '#94a3b8' }}>Lead diver:</span> {it.lead_diver || '—'}
                <span style={{ color: '#94a3b8', marginLeft: 12 }}>Conditions:</span> {it.conditions || '—'}
              </div>
              {it.findings && (
                <div style={{ color: '#e2e8f0', fontSize: 13, marginTop: 6 }}>
                  {it.findings}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

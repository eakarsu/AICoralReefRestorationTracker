import React, { useEffect, useState, useCallback } from 'react';
import { getNoaaCrwStatus, getNoaaCrwIngests, triggerNoaaCrw } from '../services/api';

export default function NoaaCrwPage() {
  const [status, setStatus] = useState(null);
  const [ingests, setIngests] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [trigError, setTrigError] = useState(null);
  const [trigResult, setTrigResult] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const s = await getNoaaCrwStatus();
      setStatus(s);
      const i = await getNoaaCrwIngests();
      setIngests(i);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const trigger = async () => {
    setTrigError(null);
    setTrigResult(null);
    try {
      const r = await triggerNoaaCrw({ dataset: 'sst', region: 'global' });
      setTrigResult(r);
      load();
    } catch (e) {
      setTrigError(e.message);
    }
  };

  return (
    <div>
      <h1>NOAA Coral Reef Watch Ingest</h1>
      <p style={{ color: '#666' }}>
        Scheduled fetcher for NOAA Coral Reef Watch SST / DHW / bleaching-alert tiles.
        Returns <strong>503</strong> until <code>NOAA_CRW_ENABLED=true</code> is set on the API host.
      </p>

      {loading && <p>Loading…</p>}
      {error && <p style={{ color: 'crimson' }}>{error}</p>}

      {status && (
        <div style={{ background: status.enabled ? '#eaffea' : '#fff4e6', padding: 12, borderRadius: 6, marginBottom: 16 }}>
          <strong>Status: {status.enabled ? 'ENABLED' : 'DISABLED (NEEDS-CREDS)'}</strong>
          <p style={{ margin: '8px 0 0 0' }}>{status.message}</p>
        </div>
      )}

      <button className="btn primary" onClick={trigger}>Trigger manual ingest</button>
      {trigError && <p style={{ color: 'crimson' }}>{trigError}</p>}
      {trigResult && <pre style={{ background: '#f7f7f7', padding: 12 }}>{JSON.stringify(trigResult, null, 2)}</pre>}

      <h3 style={{ marginTop: 24 }}>Recent ingest runs</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr>
            <th style={th}>ID</th>
            <th style={th}>Dataset</th>
            <th style={th}>Region</th>
            <th style={th}>Status</th>
            <th style={th}>Started</th>
            <th style={th}>Finished</th>
            <th style={th}>Records</th>
            <th style={th}>Message</th>
          </tr>
        </thead>
        <tbody>
          {ingests.map((r) => (
            <tr key={r.id}>
              <td style={td}>{r.ingest_id}</td>
              <td style={td}>{r.dataset}</td>
              <td style={td}>{r.region}</td>
              <td style={td}>{r.status}</td>
              <td style={td}>{r.started_at ? new Date(r.started_at).toLocaleString() : '—'}</td>
              <td style={td}>{r.finished_at ? new Date(r.finished_at).toLocaleString() : '—'}</td>
              <td style={td}>{r.records}</td>
              <td style={td}>{(r.message || '').slice(0, 200)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const th = { borderBottom: '1px solid #ddd', padding: 6, textAlign: 'left' };
const td = { borderBottom: '1px solid #f0f0f0', padding: 6 };

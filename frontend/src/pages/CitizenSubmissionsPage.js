import React, { useEffect, useState, useCallback } from 'react';
import {
  citizenSubmissionsApi,
  moderateCitizenSubmission,
  getCitizenQueue,
  getCitizenLeaderboard,
} from '../services/api';

export default function CitizenSubmissionsPage() {
  const [tab, setTab] = useState('queue'); // queue | all | leaderboard
  const [rows, setRows] = useState([]);
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (tab === 'queue') {
        setRows(await getCitizenQueue());
      } else if (tab === 'all') {
        setRows(await citizenSubmissionsApi.list());
      } else if (tab === 'leaderboard') {
        setLeaders(await getCitizenLeaderboard());
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => { load(); }, [load]);

  const moderate = async (id, decision) => {
    try {
      const points = decision === 'approved' ? 10 : 0;
      await moderateCitizenSubmission(id, { decision, reward_points: points });
      load();
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div>
      <h1>Citizen Submissions</h1>
      <p style={{ color: '#666' }}>
        Public coral-reef observations submitted via the citizen-science portal.
      </p>

      <div style={{ display: 'flex', gap: 12, margin: '16px 0' }}>
        <button onClick={() => setTab('queue')}      className={tab === 'queue' ? 'btn primary' : 'btn secondary'}>Moderation Queue</button>
        <button onClick={() => setTab('all')}        className={tab === 'all'   ? 'btn primary' : 'btn secondary'}>All Submissions</button>
        <button onClick={() => setTab('leaderboard')}className={tab === 'leaderboard' ? 'btn primary' : 'btn secondary'}>Leaderboard</button>
      </div>

      {loading && <p>Loading…</p>}
      {error && <p style={{ color: 'crimson' }}>{error}</p>}

      {tab === 'leaderboard' ? (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={th}>Submitter</th>
              <th style={th}>Email</th>
              <th style={th}>Submissions</th>
              <th style={th}>Approved</th>
              <th style={th}>Points</th>
            </tr>
          </thead>
          <tbody>
            {leaders.map((r, i) => (
              <tr key={i}>
                <td style={td}>{r.submitter_name}</td>
                <td style={td}>{r.submitter_email || '—'}</td>
                <td style={td}>{r.submissions}</td>
                <td style={td}>{r.approved}</td>
                <td style={td}><strong>{r.total_points}</strong></td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={th}>ID</th>
              <th style={th}>Submitter</th>
              <th style={th}>Type</th>
              <th style={th}>Site</th>
              <th style={th}>Observed</th>
              <th style={th}>Description</th>
              <th style={th}>Status</th>
              <th style={th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td style={td}>{r.submission_id}</td>
                <td style={td}>{r.submitter_name || '—'}</td>
                <td style={td}>{r.observation_type}</td>
                <td style={td}>{r.site_id || '—'}</td>
                <td style={td}>{r.observed_at ? new Date(r.observed_at).toLocaleString() : '—'}</td>
                <td style={td}>{(r.description || '').slice(0, 120)}</td>
                <td style={td}>{r.moderation_status}</td>
                <td style={td}>
                  <button className="btn primary"   onClick={() => moderate(r.id, 'approved')}>Approve</button>
                  <button className="btn secondary" onClick={() => moderate(r.id, 'rejected')}>Reject</button>
                  <button className="btn secondary" onClick={() => moderate(r.id, 'needs_info')}>Needs info</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const th = { borderBottom: '1px solid #ddd', padding: 8, textAlign: 'left', fontWeight: 600 };
const td = { borderBottom: '1px solid #f0f0f0', padding: 8, fontSize: 14 };

import React, { useState } from 'react';
import { getFragmentLineage } from '../services/api';

export default function FragmentLineagePage() {
  const [fragId, setFragId] = useState('FRG-0001');
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchLineage = async () => {
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const r = await getFragmentLineage(fragId);
      setData(r);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Fragment Lineage</h1>
      <p style={{ color: '#666' }}>
        Walk the parent / child chain plus genotype cohort for a fragment.
      </p>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', margin: '12px 0' }}>
        <input
          value={fragId}
          onChange={(e) => setFragId(e.target.value)}
          placeholder="FRG-0001"
          style={{ padding: 8, width: 200 }}
        />
        <button className="btn primary" onClick={fetchLineage} disabled={loading || !fragId}>
          {loading ? 'Loading…' : 'Show lineage'}
        </button>
      </div>

      {error && <p style={{ color: 'crimson' }}>{error}</p>}

      {data && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <Section title="Fragment">
            <Json data={data.fragment} />
          </Section>
          <Section title={`Genotype cohort (${data.genotype_cohort?.length || 0})`}>
            <List rows={data.genotype_cohort || []} cols={['frag_id', 'species', 'genotype_id', 'thermal_tolerance_c']} />
          </Section>
          <Section title={`Ancestors (${data.ancestors?.length || 0})`}>
            <List rows={data.ancestors || []} cols={['depth', 'frag_id', 'species', 'genotype_id']} />
          </Section>
          <Section title={`Descendants (${data.descendants?.length || 0})`}>
            <List rows={data.descendants || []} cols={['depth', 'frag_id', 'species', 'genotype_id']} />
          </Section>
          <Section title={`Siblings (${data.siblings?.length || 0})`}>
            <List rows={data.siblings || []} cols={['frag_id', 'species', 'genotype_id']} />
          </Section>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ background: '#fafafa', padding: 12, borderRadius: 6 }}>
      <h3 style={{ margin: '0 0 8px 0' }}>{title}</h3>
      {children}
    </div>
  );
}

function Json({ data }) {
  return <pre style={{ fontSize: 12, overflowX: 'auto' }}>{JSON.stringify(data, null, 2)}</pre>;
}

function List({ rows, cols }) {
  if (!rows || rows.length === 0) return <p style={{ color: '#999' }}>(none)</p>;
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
      <thead>
        <tr>{cols.map((c) => <th key={c} style={th}>{c}</th>)}</tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i}>
            {cols.map((c) => <td key={c} style={td}>{r[c] == null ? '—' : String(r[c])}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const th = { borderBottom: '1px solid #ddd', padding: 6, textAlign: 'left' };
const td = { borderBottom: '1px solid #f0f0f0', padding: 6 };

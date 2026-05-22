import React, { useState } from 'react';
import { submitCitizenPublic } from '../services/api';

const TYPES = ['bleaching', 'disease', 'predation', 'fish_sighting', 'water_event', 'other'];

export default function CitizenPortalPage() {
  const [form, setForm] = useState({
    submitter_name:    '',
    submitter_email:   '',
    site_id:           '',
    observation_type:  'bleaching',
    species:           '',
    description:       '',
    photo_url:         '',
    latitude:          '',
    longitude:         '',
    observed_at:       '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const setField = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  const submit = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const r = await submitCitizenPublic(form);
      setResult(r);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Citizen Science Portal</h1>
      <p style={{ color: '#666' }}>
        Help us monitor coral reefs. Public submissions are reviewed by our team and
        contribute to your leaderboard score once approved.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, maxWidth: 900 }}>
        <Field label="Your name"      value={form.submitter_name}    onChange={(v) => setField('submitter_name', v)} />
        <Field label="Your email"     value={form.submitter_email}   onChange={(v) => setField('submitter_email', v)} />
        <Field label="Site ID"        value={form.site_id}           onChange={(v) => setField('site_id', v)}            placeholder="e.g. SITE-001 (optional)" />
        <SelectField label="Observation type" value={form.observation_type} onChange={(v) => setField('observation_type', v)} options={TYPES} />
        <Field label="Species"        value={form.species}           onChange={(v) => setField('species', v)} />
        <Field label="Photo URL"      value={form.photo_url}         onChange={(v) => setField('photo_url', v)} />
        <Field label="Latitude"       value={form.latitude}          onChange={(v) => setField('latitude', v)}  type="number" />
        <Field label="Longitude"      value={form.longitude}         onChange={(v) => setField('longitude', v)} type="number" />
        <Field label="Observed at"    value={form.observed_at}       onChange={(v) => setField('observed_at', v)} placeholder="YYYY-MM-DDTHH:MM" />
      </div>
      <div style={{ marginTop: 12 }}>
        <label style={{ display: 'block', fontSize: 13, color: '#444' }}>Description</label>
        <textarea
          rows={5}
          style={{ width: '100%', maxWidth: 900, padding: 8 }}
          value={form.description}
          onChange={(e) => setField('description', e.target.value)}
        />
      </div>

      <button className="btn primary" disabled={loading} onClick={submit} style={{ marginTop: 16 }}>
        {loading ? 'Submitting…' : 'Submit observation'}
      </button>

      {error && <p style={{ color: 'crimson' }}>{error}</p>}
      {result && (
        <pre style={{ background: '#f7f7f7', padding: 12, marginTop: 16 }}>
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', placeholder }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 13, color: '#444' }}>{label}</label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        style={{ width: '100%', padding: 8 }}
      />
    </div>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 13, color: '#444' }}>{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} style={{ width: '100%', padding: 8 }}>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

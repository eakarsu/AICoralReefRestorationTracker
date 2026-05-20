import React from 'react';
import AIPage from '../components/AIPage';
import { aiBleachingForecast } from '../services/api';

export default function AIBleachingForecastPage() {
  return (
    <AIPage
      title="AI · Bleaching Event Forecast"
      feature="bleaching-event-forecast"
      subtitle="Forecast bleaching risk per site over the next 60 days."
      inputs={[
        { key: 'site_id',   label: 'Site ID', placeholder: 'e.g. SITE-001 (leave blank for program-wide)' },
        { key: 'sst_notes', label: 'SST / Thermal Stress Notes', type: 'textarea', placeholder: 'Free-form SST anomalies, NOAA DHW, ENSO state, etc.' },
      ]}
      run={(v) => aiBleachingForecast({ site_id: v.site_id, sst_notes: v.sst_notes })}
    />
  );
}

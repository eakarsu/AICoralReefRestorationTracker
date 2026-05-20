import React from 'react';
import CrudPage from '../components/CrudPage';
import { weatherLogsApi } from '../services/api';

export default function WeatherLogsPage() {
  return (
    <CrudPage
      title="Weather Logs"
      subtitle="Sea state, swell and visibility per site."
      api={weatherLogsApi}
      statusKey="sea_state"
      fields={[
        { key: 'log_id',       label: 'Log ID' },
        { key: 'site_id',      label: 'Site ID' },
        { key: 'ts',           label: 'Timestamp',     type: 'datetime-local' },
        { key: 'sea_state',    label: 'Sea State',     type: 'select', options: ['calm','slight','moderate','rough','very_rough'] },
        { key: 'visibility_m', label: 'Visibility (m)',type: 'number' },
        { key: 'swell_m',      label: 'Swell (m)',     type: 'number' },
        { key: 'notes',        label: 'Notes',         type: 'textarea' },
      ]}
    />
  );
}

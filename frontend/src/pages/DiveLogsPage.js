import React from 'react';
import CrudPage from '../components/CrudPage';
import { diveLogsApi } from '../services/api';

export default function DiveLogsPage() {
  return (
    <CrudPage
      title="Dive Logs"
      subtitle="Unified dive log — depth, bottom time, SAC and gas mix per dive."
      api={diveLogsApi}
      fields={[
        { key: 'dive_log_id',         label: 'Dive Log ID' },
        { key: 'diver_id',            label: 'Diver ID' },
        { key: 'site_id',             label: 'Site ID' },
        { key: 'dive_at',             label: 'Dive At (ISO)' },
        { key: 'max_depth_m',         label: 'Max Depth (m)',         type: 'number' },
        { key: 'avg_depth_m',         label: 'Avg Depth (m)',         type: 'number' },
        { key: 'bottom_time_min',     label: 'Bottom Time (min)',     type: 'number' },
        { key: 'sac_l_per_min',       label: 'SAC (L/min)',           type: 'number' },
        { key: 'gas_mix',             label: 'Gas Mix' },
        { key: 'start_pressure_bar',  label: 'Start Pressure (bar)',  type: 'number' },
        { key: 'end_pressure_bar',    label: 'End Pressure (bar)',    type: 'number' },
        { key: 'water_temp_c',        label: 'Water Temp (°C)',       type: 'number' },
        { key: 'visibility_m',        label: 'Visibility (m)',        type: 'number' },
        { key: 'buddy',               label: 'Buddy' },
        { key: 'notes',               label: 'Notes',                 type: 'textarea' },
      ]}
    />
  );
}

import React from 'react';
import CrudPage from '../components/CrudPage';
import { bleachingEventsApi } from '../services/api';

export default function BleachingEventsPage() {
  return (
    <CrudPage
      title="Bleaching Events"
      subtitle="Severity, duration and bleached percentage by event."
      api={bleachingEventsApi}
      statusKey="severity"
      fields={[
        { key: 'event_id',     label: 'Event ID' },
        { key: 'site_id',      label: 'Site ID' },
        { key: 'severity',     label: 'Severity',      type: 'select', options: ['low','medium','high','critical'] },
        { key: 'started_at',   label: 'Started',       type: 'date' },
        { key: 'ended_at',     label: 'Ended',         type: 'date' },
        { key: 'bleached_pct', label: 'Bleached %',    type: 'number' },
        { key: 'notes',        label: 'Notes',         type: 'textarea' },
      ]}
    />
  );
}

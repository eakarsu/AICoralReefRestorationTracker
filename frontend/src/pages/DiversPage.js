import React from 'react';
import CrudPage from '../components/CrudPage';
import { diversApi } from '../services/api';

export default function DiversPage() {
  return (
    <CrudPage
      title="Divers"
      subtitle="Field divers, certifications and dive hours."
      api={diversApi}
      statusKey="status"
      fields={[
        { key: 'diver_id',       label: 'Diver ID' },
        { key: 'name',           label: 'Name' },
        { key: 'certifications', label: 'Certifications' },
        { key: 'hours_total',    label: 'Hours Total',    type: 'number' },
        { key: 'last_dive',      label: 'Last Dive',      type: 'date' },
        { key: 'status',         label: 'Status',         type: 'select', options: ['active','training','medical_hold','inactive'] },
        { key: 'notes',          label: 'Notes',          type: 'textarea' },
      ]}
    />
  );
}

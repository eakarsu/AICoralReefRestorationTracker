import React from 'react';
import CrudPage from '../components/CrudPage';
import { nurseriesApi } from '../services/api';

export default function NurseriesPage() {
  return (
    <CrudPage
      title="Nurseries"
      subtitle="Coral propagation nurseries across sites."
      api={nurseriesApi}
      statusKey="status"
      fields={[
        { key: 'nursery_id',     label: 'Nursery ID' },
        { key: 'site_id',        label: 'Site ID' },
        { key: 'type',           label: 'Type',           type: 'select', options: ['tree','table','line','land_based'] },
        { key: 'frags_count',    label: 'Frag Count',     type: 'number' },
        { key: 'established_at', label: 'Established',    type: 'date' },
        { key: 'status',         label: 'Status',         type: 'select', options: ['active','monitored','inactive'] },
        { key: 'notes',          label: 'Notes',          type: 'textarea' },
      ]}
    />
  );
}

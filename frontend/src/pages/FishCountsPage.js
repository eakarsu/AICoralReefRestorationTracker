import React from 'react';
import CrudPage from '../components/CrudPage';
import { fishCountsApi } from '../services/api';

export default function FishCountsPage() {
  return (
    <CrudPage
      title="Fish Counts"
      subtitle="Indicator and reef-associated fish surveys."
      api={fishCountsApi}
      fields={[
        { key: 'count_id', label: 'Count ID' },
        { key: 'site_id',  label: 'Site ID' },
        { key: 'species',  label: 'Species' },
        { key: 'count',    label: 'Count',    type: 'number' },
        { key: 'observer', label: 'Observer' },
        { key: 'ts',       label: 'Timestamp', type: 'datetime-local' },
        { key: 'notes',    label: 'Notes',     type: 'textarea' },
      ]}
    />
  );
}

import React from 'react';
import CrudPage from '../components/CrudPage';
import { outplantsApi } from '../services/api';

export default function OutplantsPage() {
  return (
    <CrudPage
      title="Outplants"
      subtitle="Field outplants with survivor status."
      api={outplantsApi}
      statusKey="survivor_status"
      fields={[
        { key: 'outplant_id',     label: 'Outplant ID' },
        { key: 'site_id',         label: 'Site ID' },
        { key: 'frag_id',         label: 'Fragment ID' },
        { key: 'planted_at',      label: 'Planted At',      type: 'date' },
        { key: 'survivor_status', label: 'Survivor Status', type: 'select', options: ['alive','partial','dead','unknown'] },
        { key: 'last_check',      label: 'Last Check',      type: 'date' },
        { key: 'notes',           label: 'Notes',           type: 'textarea' },
      ]}
    />
  );
}

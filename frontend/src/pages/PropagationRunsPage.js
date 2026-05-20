import React from 'react';
import CrudPage from '../components/CrudPage';
import { propagationRunsApi } from '../services/api';

export default function PropagationRunsPage() {
  return (
    <CrudPage
      title="Propagation Runs"
      subtitle="Per-nursery propagation runs and success rate."
      api={propagationRunsApi}
      fields={[
        { key: 'run_id',          label: 'Run ID' },
        { key: 'nursery_id',      label: 'Nursery ID' },
        { key: 'fragments_added', label: 'Fragments Added', type: 'number' },
        { key: 'success_pct',     label: 'Success %',       type: 'number' },
        { key: 'started_at',      label: 'Started',         type: 'date' },
        { key: 'ended_at',        label: 'Ended',           type: 'date' },
        { key: 'notes',           label: 'Notes',           type: 'textarea' },
      ]}
    />
  );
}

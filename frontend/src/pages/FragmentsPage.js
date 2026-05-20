import React from 'react';
import CrudPage from '../components/CrudPage';
import { fragmentsApi } from '../services/api';

export default function FragmentsPage() {
  return (
    <CrudPage
      title="Fragments"
      subtitle="Source-colony lineage and health-scored fragments."
      api={fragmentsApi}
      fields={[
        { key: 'frag_id',       label: 'Fragment ID' },
        { key: 'nursery_id',    label: 'Nursery ID' },
        { key: 'species',       label: 'Species' },
        { key: 'source_colony', label: 'Source Colony' },
        { key: 'age_months',    label: 'Age (months)',  type: 'number' },
        { key: 'health_score',  label: 'Health Score',  type: 'number' },
        { key: 'notes',         label: 'Notes',         type: 'textarea' },
      ]}
    />
  );
}

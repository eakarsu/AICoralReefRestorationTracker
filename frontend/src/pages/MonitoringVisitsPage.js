import React from 'react';
import CrudPage from '../components/CrudPage';
import { monitoringVisitsApi } from '../services/api';

export default function MonitoringVisitsPage() {
  return (
    <CrudPage
      title="Monitoring Visits"
      subtitle="Site visit logs and dive findings."
      api={monitoringVisitsApi}
      fields={[
        { key: 'visit_id',   label: 'Visit ID' },
        { key: 'site_id',    label: 'Site ID' },
        { key: 'lead_diver', label: 'Lead Diver' },
        { key: 'visit_at',   label: 'Visit At',   type: 'datetime-local' },
        { key: 'conditions', label: 'Conditions' },
        { key: 'findings',   label: 'Findings',   type: 'textarea' },
      ]}
    />
  );
}

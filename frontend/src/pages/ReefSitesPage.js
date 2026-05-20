import React from 'react';
import CrudPage from '../components/CrudPage';
import { reefSitesApi } from '../services/api';

export default function ReefSitesPage() {
  return (
    <CrudPage
      title="Reef Sites"
      subtitle="Active, monitored and restricted restoration sites."
      api={reefSitesApi}
      statusKey="status"
      fields={[
        { key: 'site_id',  label: 'Site ID' },
        { key: 'name',     label: 'Name' },
        { key: 'location', label: 'Location' },
        { key: 'depth_m',  label: 'Depth (m)',  type: 'number' },
        { key: 'area_m2',  label: 'Area (m2)',  type: 'number' },
        { key: 'status',   label: 'Status',     type: 'select', options: ['active','monitored','restricted','closed'] },
        { key: 'notes',    label: 'Notes',      type: 'textarea' },
      ]}
    />
  );
}

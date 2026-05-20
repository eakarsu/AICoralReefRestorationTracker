import React from 'react';
import CrudPage from '../components/CrudPage';
import { vesselsApi } from '../services/api';

export default function VesselsPage() {
  return (
    <CrudPage
      title="Vessels"
      subtitle="Research vessels, capacity and fuel status."
      api={vesselsApi}
      statusKey="status"
      fields={[
        { key: 'vessel_id',   label: 'Vessel ID' },
        { key: 'name',        label: 'Name' },
        { key: 'capacity',    label: 'Capacity', type: 'number' },
        { key: 'fuel_status', label: 'Fuel Status' },
        { key: 'location',    label: 'Location' },
        { key: 'status',      label: 'Status',   type: 'select', options: ['available','in_use','maintenance','docked','retired'] },
        { key: 'notes',       label: 'Notes',    type: 'textarea' },
      ]}
    />
  );
}

import React from 'react';
import CrudPage from '../components/CrudPage';
import { equipmentApi } from '../services/api';

export default function EquipmentPage() {
  return (
    <CrudPage
      title="Equipment"
      subtitle="BCDs, regulators, sensors, ROVs and tools."
      api={equipmentApi}
      statusKey="status"
      fields={[
        { key: 'eq_id',        label: 'Equipment ID' },
        { key: 'type',         label: 'Type' },
        { key: 'sn',           label: 'Serial' },
        { key: 'location',     label: 'Location' },
        { key: 'last_service', label: 'Last Service', type: 'date' },
        { key: 'status',       label: 'Status',       type: 'select', options: ['available','in_service','maintenance','calibration','retired'] },
        { key: 'notes',        label: 'Notes',        type: 'textarea' },
      ]}
    />
  );
}

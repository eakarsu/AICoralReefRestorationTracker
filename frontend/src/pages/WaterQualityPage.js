import React from 'react';
import CrudPage from '../components/CrudPage';
import { waterQualityApi } from '../services/api';

export default function WaterQualityPage() {
  return (
    <CrudPage
      title="Water Quality"
      subtitle="Temperature, salinity, pH, turbidity, DO, nitrate."
      api={waterQualityApi}
      fields={[
        { key: 'reading_id', label: 'Reading ID' },
        { key: 'site_id',    label: 'Site ID' },
        { key: 'parameter',  label: 'Parameter',  type: 'select', options: ['temperature','salinity','pH','turbidity','DO','nitrate'] },
        { key: 'value',      label: 'Value',      type: 'number' },
        { key: 'units',      label: 'Units' },
        { key: 'ts',         label: 'Timestamp',  type: 'datetime-local' },
        { key: 'notes',      label: 'Notes',      type: 'textarea' },
      ]}
    />
  );
}

import React from 'react';
import CrudPage from '../components/CrudPage';
import { partnersApi } from '../services/api';

export default function PartnersPage() {
  return (
    <CrudPage
      title="Partners"
      subtitle="NGOs, funders, universities and contributors."
      api={partnersApi}
      statusKey="status"
      fields={[
        { key: 'partner_id',       label: 'Partner ID' },
        { key: 'name',             label: 'Name' },
        { key: 'type',             label: 'Type',            type: 'select', options: ['government','ngo','research','university','consortium','corporate','funder'] },
        { key: 'country',          label: 'Country' },
        { key: 'contribution_usd', label: 'Contribution (USD)', type: 'number' },
        { key: 'status',           label: 'Status',          type: 'select', options: ['active','monitored','blocked','closed'] },
        { key: 'notes',            label: 'Notes',           type: 'textarea' },
      ]}
    />
  );
}

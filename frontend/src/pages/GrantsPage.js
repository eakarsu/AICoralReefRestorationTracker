import React from 'react';
import CrudPage from '../components/CrudPage';
import { grantsApi } from '../services/api';

export default function GrantsPage() {
  return (
    <CrudPage
      title="Grants"
      subtitle="Active, pending, closing and closed grants."
      api={grantsApi}
      statusKey="status"
      fields={[
        { key: 'grant_id',   label: 'Grant ID' },
        { key: 'funder',     label: 'Funder' },
        { key: 'amount_usd', label: 'Amount (USD)', type: 'number' },
        { key: 'period',     label: 'Period' },
        { key: 'status',     label: 'Status',     type: 'select', options: ['active','pending','closing','closed'] },
        { key: 'owner',      label: 'Owner' },
        { key: 'notes',      label: 'Notes',      type: 'textarea' },
      ]}
    />
  );
}

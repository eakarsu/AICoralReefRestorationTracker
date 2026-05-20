import React from 'react';
import CrudPage from '../components/CrudPage';
import { auditLogApi } from '../services/api';

export default function AuditLogPage() {
  return (
    <CrudPage
      title="Audit Log"
      subtitle="Governance trail of actor / target / action / result."
      api={auditLogApi}
      statusKey="result"
      fields={[
        { key: 'entry_id', label: 'Entry ID' },
        { key: 'actor',    label: 'Actor' },
        { key: 'target',   label: 'Target' },
        { key: 'action',   label: 'Action' },
        { key: 'result',   label: 'Result',   type: 'select', options: ['success','failure','partial','denied'] },
        { key: 'ts',       label: 'Timestamp', type: 'datetime-local' },
        { key: 'notes',    label: 'Notes',     type: 'textarea' },
      ]}
    />
  );
}

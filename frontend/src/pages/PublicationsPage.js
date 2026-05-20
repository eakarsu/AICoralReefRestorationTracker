import React from 'react';
import CrudPage from '../components/CrudPage';
import { publicationsApi } from '../services/api';

export default function PublicationsPage() {
  return (
    <CrudPage
      title="Publications"
      subtitle="Peer-reviewed outputs and in-review pipeline."
      api={publicationsApi}
      statusKey="status"
      fields={[
        { key: 'pub_id',  label: 'Pub ID' },
        { key: 'title',   label: 'Title' },
        { key: 'authors', label: 'Authors', type: 'textarea' },
        { key: 'journal', label: 'Journal' },
        { key: 'year',    label: 'Year',    type: 'number' },
        { key: 'status',  label: 'Status',  type: 'select', options: ['published','in_press','in_review','draft','rejected'] },
        { key: 'notes',   label: 'Notes',   type: 'textarea' },
      ]}
    />
  );
}

import React from 'react';
import AIPage from '../components/AIPage';
import { aiExecutiveBrief } from '../services/api';

export default function AIExecutiveBriefPage() {
  return (
    <AIPage
      title="AI · Executive Brief"
      feature="executive-brief"
      subtitle="Program-wide executive narrative from live snapshot."
      inputs={[
        { key: 'notes', label: 'Bias / Focus Notes (optional)', type: 'textarea' },
      ]}
      run={(v, requestOptions) => aiExecutiveBrief({ notes: v.notes }, requestOptions)}
    />
  );
}

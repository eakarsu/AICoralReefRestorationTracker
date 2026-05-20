import React from 'react';
import AIPage from '../components/AIPage';
import { aiPropagationSuccess } from '../services/api';

export default function AIPropagationSuccessPage() {
  return (
    <AIPage
      title="AI · Propagation Success Rate"
      feature="propagation-success-rate"
      subtitle="Analyze per-nursery propagation effectiveness."
      inputs={[
        { key: 'window',          label: 'Window',          placeholder: 'e.g. last_180_days' },
        { key: 'nursery_filter',  label: 'Nursery Filter',  placeholder: 'comma-separated NUR-IDs (blank = all)' },
      ]}
      run={(v) => aiPropagationSuccess({ window: v.window, nursery_filter: v.nursery_filter })}
    />
  );
}

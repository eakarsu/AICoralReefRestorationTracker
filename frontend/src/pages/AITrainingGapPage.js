import React from 'react';
import AIPage from '../components/AIPage';
import { aiTrainingGap } from '../services/api';

export default function AITrainingGapPage() {
  return (
    <AIPage
      title="AI · Training Gap Analysis"
      feature="training-gap-analysis"
      subtitle="Gaps in diver training and certifications."
      inputs={[
        { key: 'window_months', label: 'Window (months)', type: 'number' },
        { key: 'role_filter',   label: 'Role Filter',     placeholder: 'e.g. field, volunteer, new_hire, senior' },
      ]}
      run={(v) => aiTrainingGap({ window_months: Number(v.window_months || 12), role_filter: v.role_filter })}
    />
  );
}

import React from 'react';
import AIPage from '../components/AIPage';
import { aiSurvivalPredict } from '../services/api';

export default function AISurvivalPredictPage() {
  return (
    <AIPage
      title="AI · Survival Predict"
      feature="survival-predict"
      subtitle="Predict 12-month survival for each outplant."
      inputs={[
        { key: 'site_filter', label: 'Site Filter (comma-separated, blank = all)', placeholder: 'e.g. SITE-001,SITE-002' },
        { key: 'notes',       label: 'Additional Notes', type: 'textarea' },
      ]}
      run={(v) => aiSurvivalPredict({ site_filter: v.site_filter, notes: v.notes })}
    />
  );
}

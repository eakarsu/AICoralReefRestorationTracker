import React from 'react';
import AIPage from '../components/AIPage';
import { aiGrowthRateModel } from '../services/api';

export default function AIGrowthRateModelPage() {
  return (
    <AIPage
      title="AI · Growth Rate Model"
      feature="growth-rate-model"
      subtitle="Project monthly growth and projected sizes from a fragment time-series."
      inputs={[
        { key: 'frag_id',         label: 'Fragment ID',          placeholder: 'e.g. FRG-0001' },
        { key: 'horizon_months',  label: 'Horizon (months)',     type: 'number', defaultValue: 12 },
        { key: 'notes',           label: 'Notes',                type: 'textarea' },
      ]}
      run={(v) => aiGrowthRateModel({
        frag_id: v.frag_id,
        horizon_months: v.horizon_months,
        notes: v.notes,
      })}
    />
  );
}

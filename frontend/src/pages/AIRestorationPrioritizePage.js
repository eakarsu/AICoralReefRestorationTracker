import React from 'react';
import AIPage from '../components/AIPage';
import { aiRestorationPrior } from '../services/api';

export default function AIRestorationPrioritizePage() {
  return (
    <AIPage
      title="AI · Restoration Prioritize"
      feature="restoration-prioritize"
      subtitle="Rank sites for the next restoration cycle."
      inputs={[
        { key: 'region',              label: 'Region',               placeholder: 'e.g. Caribbean, Indo-Pacific, All' },
        { key: 'budget_usd',          label: 'Budget (USD)',         type: 'number' },
        { key: 'capacity_diver_days', label: 'Capacity (diver-days)', type: 'number' },
      ]}
      run={(v) => aiRestorationPrior({
        region: v.region,
        budget_usd: Number(v.budget_usd || 0),
        capacity_diver_days: Number(v.capacity_diver_days || 0),
      })}
    />
  );
}

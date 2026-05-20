import React from 'react';
import AIPage from '../components/AIPage';
import { aiDonorNarrative } from '../services/api';

export default function AIDonorNarrativePage() {
  return (
    <AIPage
      title="AI · Donor Narrative"
      feature="donor-narrative"
      subtitle="Craft a donor-facing story arc + key stats."
      inputs={[
        { key: 'tone',     label: 'Tone',     type: 'select', options: ['inspiring','urgent','reflective','confident','heartfelt'] },
        { key: 'audience', label: 'Audience', placeholder: 'e.g. donors, corporate, community' },
      ]}
      run={(v) => aiDonorNarrative({ tone: v.tone, audience: v.audience })}
    />
  );
}

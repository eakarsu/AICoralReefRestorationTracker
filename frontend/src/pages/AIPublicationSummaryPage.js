import React from 'react';
import AIPage from '../components/AIPage';
import { aiPublicationSummary } from '../services/api';

export default function AIPublicationSummaryPage() {
  return (
    <AIPage
      title="AI · Publication Summary"
      feature="publication-summary"
      subtitle="Audience-specific summary of a publication."
      inputs={[
        { key: 'pub_id',   label: 'Publication ID',  placeholder: 'e.g. PUB-2026-001' },
        { key: 'audience', label: 'Audience',        type: 'select', options: ['donor','media','policy','internal','scientific'] },
      ]}
      run={(v) => aiPublicationSummary({ pub_id: v.pub_id, audience: v.audience })}
    />
  );
}

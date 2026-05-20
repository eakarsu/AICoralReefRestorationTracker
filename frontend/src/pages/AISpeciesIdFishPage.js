import React from 'react';
import AIPage from '../components/AIPage';
import { aiSpeciesIdFish } from '../services/api';

export default function AISpeciesIdFishPage() {
  return (
    <AIPage
      title="AI · Species ID (Fish)"
      feature="species-id-fish"
      subtitle="Probable fish species from an observation."
      inputs={[
        { key: 'description', label: 'Observation',  type: 'textarea', placeholder: 'Size, color, behavior, depth, habitat...' },
        { key: 'site_id',     label: 'Site ID (optional)' },
      ]}
      run={(v) => aiSpeciesIdFish({ description: v.description, site_id: v.site_id })}
    />
  );
}

import React from 'react';
import AIPage from '../components/AIPage';
import { aiSpeciesMixRecommend } from '../services/api';

export default function AISpeciesMixRecommendPage() {
  return (
    <AIPage
      title="AI · Species Mix Recommend"
      feature="species-mix-recommend"
      subtitle="Recommend an outplant species / genotype mix optimized for site conditions and thermal resilience."
      inputs={[
        { key: 'site_id',          label: 'Site ID',          placeholder: 'e.g. SITE-001' },
        { key: 'target_diversity', label: 'Target Diversity', placeholder: 'low | medium | high' },
        { key: 'max_species',      label: 'Max Species',      type: 'number', defaultValue: 4 },
        { key: 'notes',            label: 'Notes',            type: 'textarea' },
      ]}
      run={(v) => aiSpeciesMixRecommend({
        site_id: v.site_id,
        target_diversity: v.target_diversity,
        max_species: v.max_species,
        notes: v.notes,
      })}
    />
  );
}

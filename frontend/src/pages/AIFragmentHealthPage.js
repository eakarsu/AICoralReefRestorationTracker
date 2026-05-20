import React from 'react';
import AIPage from '../components/AIPage';
import { aiFragmentHealth } from '../services/api';

export default function AIFragmentHealthPage() {
  return (
    <AIPage
      title="AI · Fragment Health Vision"
      feature="fragment-health-vision"
      subtitle="Health classification from observations / photo notes."
      inputs={[
        { key: 'notes', label: 'Observations / Photo Notes', type: 'textarea', placeholder: 'What did the diver/camera see? Color, lesions, predation...' },
      ]}
      run={(v) => aiFragmentHealth({ notes: v.notes })}
    />
  );
}

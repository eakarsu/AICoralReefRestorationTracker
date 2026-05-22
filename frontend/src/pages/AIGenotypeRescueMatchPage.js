import React from 'react';
import AIPage from '../components/AIPage';
import { aiGenotypeRescueMatch } from '../services/api';

export default function AIGenotypeRescueMatchPage() {
  return (
    <AIPage
      title="AI · Genotype Rescue Match"
      feature="genotype-rescue-match"
      subtitle="Match donor genotypes to recipient sites on thermal-tolerance and disease-resistance traits."
      inputs={[
        { key: 'donor_filter',     label: 'Donor Site Filter (comma-separated, blank = all)',     placeholder: 'e.g. SITE-001,SITE-002' },
        { key: 'recipient_filter', label: 'Recipient Site Filter (comma-separated, blank = all)', placeholder: 'e.g. SITE-003,SITE-005' },
        { key: 'notes',            label: 'Notes',                                                type: 'textarea' },
      ]}
      run={(v) => aiGenotypeRescueMatch({
        donor_filter: v.donor_filter,
        recipient_filter: v.recipient_filter,
        notes: v.notes,
      })}
    />
  );
}

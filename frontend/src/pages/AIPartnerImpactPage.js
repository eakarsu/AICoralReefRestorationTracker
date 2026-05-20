import React from 'react';
import AIPage from '../components/AIPage';
import { aiPartnerImpact } from '../services/api';

export default function AIPartnerImpactPage() {
  return (
    <AIPage
      title="AI · Partner Impact Report"
      feature="partner-impact-report"
      subtitle="Compose a partner-facing impact narrative + metrics."
      inputs={[
        { key: 'partner_id', label: 'Partner ID', placeholder: 'e.g. PRT-001' },
        { key: 'period',     label: 'Period',     placeholder: 'e.g. FY26 Q3' },
      ]}
      run={(v) => aiPartnerImpact({ partner_id: v.partner_id, period: v.period })}
    />
  );
}

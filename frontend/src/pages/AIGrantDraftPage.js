import React from 'react';
import AIPage from '../components/AIPage';
import { aiGrantDraft } from '../services/api';

export default function AIGrantDraftPage() {
  return (
    <AIPage
      title="AI · Grant Application Draft"
      feature="grant-application-draft"
      subtitle="Draft a grant narrative, deliverables and budget."
      inputs={[
        { key: 'funder',     label: 'Funder',         placeholder: 'e.g. NSF OCE, NOAA CRCP, Bezos Earth Fund' },
        { key: 'amount_usd', label: 'Amount (USD)',   type: 'number' },
        { key: 'period',     label: 'Period',         placeholder: 'e.g. 2026-2029' },
        { key: 'aims',       label: 'Specific Aims',  type: 'textarea' },
      ]}
      run={(v) => aiGrantDraft({
        funder: v.funder,
        amount_usd: Number(v.amount_usd || 0),
        period: v.period,
        aims: v.aims,
      })}
    />
  );
}

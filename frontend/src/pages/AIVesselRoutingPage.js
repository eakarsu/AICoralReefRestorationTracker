import React from 'react';
import AIPage from '../components/AIPage';
import { aiVesselRouting } from '../services/api';

export default function AIVesselRoutingPage() {
  return (
    <AIPage
      title="AI · Vessel Routing"
      feature="vessel-routing"
      subtitle="Optimal day-plan for vessels across sites."
      inputs={[
        { key: 'day',     label: 'Day',     type: 'date' },
        { key: 'sites',   label: 'Sites',   placeholder: 'comma-separated SITE-IDs' },
        { key: 'vessels', label: 'Vessels', placeholder: 'comma-separated VES-IDs' },
      ]}
      run={(v) => aiVesselRouting({ day: v.day, sites: v.sites, vessels: v.vessels })}
    />
  );
}

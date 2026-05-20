import React from 'react';
import AIPage from '../components/AIPage';
import { aiDiverSafetyBrief } from '../services/api';

export default function AIDiverSafetyBriefPage() {
  return (
    <AIPage
      title="AI · Diver Safety Brief"
      feature="diver-safety-brief"
      subtitle="Pre-dive go / no-go, hazards and emergency plan."
      inputs={[
        { key: 'site_id',         label: 'Site ID' },
        { key: 'target_depth_m',  label: 'Target Depth (m)', type: 'number' },
        { key: 'planned_minutes', label: 'Planned Bottom (min)', type: 'number' },
        { key: 'divers',          label: 'Divers',           placeholder: 'comma-separated' },
        { key: 'conditions',      label: 'Conditions',       type: 'textarea' },
      ]}
      run={(v) => aiDiverSafetyBrief({
        site_id: v.site_id,
        target_depth_m: Number(v.target_depth_m || 0),
        planned_minutes: Number(v.planned_minutes || 0),
        divers: v.divers,
        conditions: v.conditions,
      })}
    />
  );
}

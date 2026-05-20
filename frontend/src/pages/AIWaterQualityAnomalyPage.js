import React from 'react';
import AIPage from '../components/AIPage';
import { aiWaterQualityAnomaly } from '../services/api';

export default function AIWaterQualityAnomalyPage() {
  return (
    <AIPage
      title="AI · Water Quality Anomaly"
      feature="water-quality-anomaly"
      subtitle="Detect anomalies in recent water-quality readings."
      inputs={[
        { key: 'window_days', label: 'Window (days)', type: 'number' },
        { key: 'site_filter', label: 'Site Filter (comma-separated, blank = all)' },
      ]}
      run={(v) => aiWaterQualityAnomaly({ window_days: Number(v.window_days || 30), site_filter: v.site_filter })}
    />
  );
}

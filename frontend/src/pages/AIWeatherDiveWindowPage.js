import React from 'react';
import AIPage from '../components/AIPage';
import { aiWeatherDiveWindow } from '../services/api';

export default function AIWeatherDiveWindowPage() {
  return (
    <AIPage
      title="AI · Weather Dive Window"
      feature="weather-dive-window"
      subtitle="Next viable dive window per site."
      inputs={[
        { key: 'site_id',        label: 'Site ID' },
        { key: 'forecast_notes', label: 'Forecast Notes', type: 'textarea', placeholder: 'Wind, swell, viz, fronts, monsoon...' },
      ]}
      run={(v) => aiWeatherDiveWindow({ site_id: v.site_id, forecast_notes: v.forecast_notes })}
    />
  );
}

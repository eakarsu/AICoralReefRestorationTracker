import React from 'react';
import 'leaflet/dist/leaflet.css';

import ReefMap                 from '../components/ReefMap';
import SurvivalTimeline        from '../components/SurvivalTimeline';
import WaterQualityChart       from '../components/WaterQualityChart';
import BleachingTreemap        from '../components/BleachingTreemap';
import DiveLogTimeline         from '../components/DiveLogTimeline';
import FragmentSurvivalHeatmap from '../components/FragmentSurvivalHeatmap';

const cardStyle = {
  background: '#0b1220',
  border: '1px solid #1e293b',
  borderRadius: 12,
  padding: 16,
  marginBottom: 20,
};
const titleStyle = {
  margin: '0 0 4px 0',
  fontSize: 18,
  color: '#e2e8f0',
};
const subStyle = {
  margin: '0 0 12px 0',
  fontSize: 13,
  color: '#94a3b8',
};

export default function CustomViewsPage() {
  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ margin: 0, color: '#e2e8f0' }}>Reef Analytics</h1>
        <p style={{ margin: '4px 0 0 0', color: '#94a3b8' }}>
          Cross-cutting visual analytics on sites, outplants, water quality and bleaching.
        </p>
      </div>

      <div style={cardStyle}>
        <h2 style={titleStyle}>Reef Sites Map</h2>
        <p style={subStyle}>Sites coloured by most recent bleaching severity. Marker size scales with bleached %.</p>
        <ReefMap />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div style={cardStyle}>
          <h2 style={titleStyle}>Fragment Outplant Survival</h2>
          <p style={subStyle}>Survival % by outplant month (alive + 0.5 partial).</p>
          <SurvivalTimeline />
        </div>

        <div style={cardStyle}>
          <h2 style={titleStyle}>Water Quality Trend</h2>
          <p style={subStyle}>Temperature / pH / turbidity over time across all sites.</p>
          <WaterQualityChart />
        </div>
      </div>

      <div style={cardStyle}>
        <h2 style={titleStyle}>Bleaching Severity by Site</h2>
        <p style={subStyle}>Treemap area = total bleached % across events. Color = worst recorded severity.</p>
        <BleachingTreemap />
      </div>

      <div style={cardStyle}>
        <h2 style={titleStyle}>Dive Log Timeline</h2>
        <p style={subStyle}>20 most recent monitoring visits — newest first, icon per visit type.</p>
        <DiveLogTimeline />
      </div>

      <div style={cardStyle}>
        <h2 style={titleStyle}>Fragment Survival Heatmap</h2>
        <p style={subStyle}>Rows = reef sites, columns = last 12 months. Cell color encodes survival % bucket.</p>
        <FragmentSurvivalHeatmap />
      </div>
    </div>
  );
}

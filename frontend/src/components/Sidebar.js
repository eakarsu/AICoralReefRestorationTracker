import React from 'react';
import { NavLink } from 'react-router-dom';
import { logout, getStoredUser } from '../services/api';

// Sidebar groups per spec:
// Overview / Sites & Nurseries / Outplants / Monitoring / Divers & Vessels /
// Partners & Grants / Publications / Governance / AI Forecasting / AI Reporting / Admin
const GROUPS = [
  {
    label: 'Sites & Nurseries',
    links: [
      { to: '/reef-sites',         label: 'Reef Sites' },
      { to: '/nurseries',          label: 'Nurseries' },
      { to: '/fragments',          label: 'Fragments' },
      { to: '/propagation-runs',   label: 'Propagation Runs' },
    ],
  },
  {
    label: 'Outplants',
    links: [
      { to: '/outplants',          label: 'Outplants' },
    ],
  },
  {
    label: 'Monitoring',
    links: [
      { to: '/monitoring-visits',  label: 'Monitoring Visits' },
      { to: '/bleaching-events',   label: 'Bleaching Events' },
      { to: '/water-quality',      label: 'Water Quality' },
      { to: '/fish-counts',        label: 'Fish Counts' },
      { to: '/weather-logs',       label: 'Weather Logs' },
    ],
  },
  {
    label: 'Divers & Vessels',
    links: [
      { to: '/divers',             label: 'Divers' },
      { to: '/equipment',          label: 'Equipment' },
      { to: '/vessels',            label: 'Vessels' },
      { to: '/training-sessions',  label: 'Training Sessions' },
    ],
  },
  {
    label: 'Partners & Grants',
    links: [
      { to: '/partners',           label: 'Partners' },
      { to: '/grants',             label: 'Grants' },
    ],
  },
  {
    label: 'Publications',
    links: [
      { to: '/publications',       label: 'Publications' },
    ],
  },
  {
    label: 'Governance',
    links: [
      { to: '/audit-log',          label: 'Audit Log' },
    ],
  },
  {
    label: 'AI Forecasting',
    links: [
      { to: '/ai/bleaching-event-forecast', label: 'AI · Bleaching Forecast' },
      { to: '/ai/survival-predict',         label: 'AI · Survival Predict' },
      { to: '/ai/water-quality-anomaly',    label: 'AI · Water Anomaly' },
      { to: '/ai/weather-dive-window',      label: 'AI · Weather Dive Window' },
      { to: '/ai/restoration-prioritize',   label: 'AI · Restoration Prioritize' },
      { to: '/ai/vessel-routing',           label: 'AI · Vessel Routing' },
      { to: '/ai/fragment-health-vision',   label: 'AI · Fragment Health' },
      { to: '/ai/species-id-fish',          label: 'AI · Species ID' },
      { to: '/ai/diver-safety-brief',       label: 'AI · Diver Safety' },
      { to: '/ai/propagation-success-rate', label: 'AI · Propagation Success' },
    ],
  },
  {
    label: 'AI Reporting',
    links: [
      { to: '/ai/executive-brief',         label: 'AI · Executive Brief' },
      { to: '/ai/partner-impact-report',   label: 'AI · Partner Impact' },
      { to: '/ai/grant-application-draft', label: 'AI · Grant Draft' },
      { to: '/ai/publication-summary',     label: 'AI · Publication Summary' },
      { to: '/ai/training-gap-analysis',   label: 'AI · Training Gap' },
      { to: '/ai/donor-narrative',         label: 'AI · Donor Narrative' },
    ],
  },
  {
    label: 'Admin',
    links: [
      { to: '/webhooks', label: 'Webhooks' },
    ],
  },
  {
    label: 'Analytics',
    links: [
      { to: '/custom-views', label: 'Reef Analytics' },
    ],
  },
];

export default function Sidebar() {
  const user = getStoredUser();
  return (
    <nav className="sidebar">
      <div className="sidebar-brand">
        <h1>CORAL REEF TRACKER</h1>
        <p>Restoration Operations Hub</p>
      </div>

      <NavLink to="/" end>Overview</NavLink>

      {GROUPS.map((g) => (
        <React.Fragment key={g.label}>
          <div className="sidebar-group-label">{g.label}</div>
          {g.links.map((l) => (
            <NavLink key={l.to} to={l.to}>{l.label}</NavLink>
          ))}
        </React.Fragment>
      ))}

      <div className="sidebar-user">
        {user && (
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user.name || user.email}</div>
            <div className="sidebar-user-role">{user.role || 'user'}</div>
          </div>
        )}
        <button className="btn secondary sidebar-logout" onClick={logout}>Sign Out</button>
      </div>
    </nav>
  );
}

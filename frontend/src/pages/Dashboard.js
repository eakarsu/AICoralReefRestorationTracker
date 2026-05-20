import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboardStats } from '../services/api';

const FEATURES = [
  { path: '/reef-sites',         title: 'Reef Sites',         icon: 'R', color: '#06b6d4', desc: 'Active, monitored and restricted restoration sites.' },
  { path: '/nurseries',          title: 'Nurseries',          icon: 'N', color: '#10b981', desc: 'Tree, table, line and land-based propagation arrays.' },
  { path: '/fragments',          title: 'Fragments',          icon: 'F', color: '#3b82f6', desc: 'Source-colony lineage and health-scored fragments.' },
  { path: '/outplants',          title: 'Outplants',          icon: 'O', color: '#22c55e', desc: 'Field outplants with survivor status.' },
  { path: '/monitoring-visits',  title: 'Monitoring Visits',  icon: 'M', color: '#f59e0b', desc: 'Site visit logs and dive findings.' },
  { path: '/bleaching-events',   title: 'Bleaching Events',   icon: 'B', color: '#ef4444', desc: 'Severity, duration and bleached percentage.' },
  { path: '/water-quality',      title: 'Water Quality',      icon: 'W', color: '#7dd3fc', desc: 'Temperature, salinity, pH, turbidity, DO, nitrate.' },
  { path: '/fish-counts',        title: 'Fish Counts',        icon: 'C', color: '#a78bfa', desc: 'Indicator and reef-associated fish surveys.' },
  { path: '/divers',             title: 'Divers',             icon: 'D', color: '#34d399', desc: 'Field divers, certifications and dive hours.' },
  { path: '/equipment',          title: 'Equipment',          icon: 'E', color: '#facc15', desc: 'BCDs, regulators, sensors, ROVs and tools.' },
  { path: '/weather-logs',       title: 'Weather Logs',       icon: 'L', color: '#60a5fa', desc: 'Sea state, swell and visibility per site.' },
  { path: '/vessels',            title: 'Vessels',            icon: 'V', color: '#0ea5e9', desc: 'Research vessels, capacity and fuel status.' },
  { path: '/propagation-runs',   title: 'Propagation Runs',   icon: 'P', color: '#14b8a6', desc: 'Per-nursery propagation runs and success rate.' },
  { path: '/partners',           title: 'Partners',           icon: 'A', color: '#fb7185', desc: 'NGOs, funders, universities and contributors.' },
  { path: '/grants',             title: 'Grants',             icon: 'G', color: '#a3e635', desc: 'Active, pending and closed grant portfolio.' },
  { path: '/publications',       title: 'Publications',       icon: 'U', color: '#f472b6', desc: 'Peer-reviewed outputs and in-review pipeline.' },
  { path: '/training-sessions',  title: 'Training Sessions',  icon: 'T', color: '#ec4899', desc: 'Diver training, planned and completed.' },
  { path: '/audit-log',          title: 'Audit Log',          icon: 'X', color: '#dc2626', desc: 'Governance trail of actor / action / result.' },

  { path: '/ai/bleaching-event-forecast', title: 'AI · Bleaching Forecast',  icon: '*', color: '#8b5cf6', desc: 'Forecast bleaching risk per site over 60 days.' },
  { path: '/ai/fragment-health-vision',   title: 'AI · Fragment Health',     icon: '*', color: '#8b5cf6', desc: 'Health classification of fragment observations.' },
  { path: '/ai/survival-predict',         title: 'AI · Survival Predict',    icon: '*', color: '#8b5cf6', desc: '12-month outplant survival predictions.' },
  { path: '/ai/restoration-prioritize',   title: 'AI · Restoration Priority',icon: '*', color: '#8b5cf6', desc: 'Rank sites for the next restoration cycle.' },
  { path: '/ai/executive-brief',          title: 'AI · Executive Brief',     icon: '*', color: '#8b5cf6', desc: 'Program-wide executive narrative.' },
  { path: '/ai/water-quality-anomaly',    title: 'AI · Water Anomaly',       icon: '*', color: '#8b5cf6', desc: 'Anomaly detection across recent readings.' },
  { path: '/ai/diver-safety-brief',       title: 'AI · Diver Safety',        icon: '*', color: '#8b5cf6', desc: 'Pre-dive go / no-go and hazard plan.' },
  { path: '/ai/partner-impact-report',    title: 'AI · Partner Impact',      icon: '*', color: '#8b5cf6', desc: 'Partner-facing impact narrative + metrics.' },
  { path: '/ai/grant-application-draft',  title: 'AI · Grant Draft',         icon: '*', color: '#8b5cf6', desc: 'Draft narrative + budget for a funder.' },
  { path: '/ai/propagation-success-rate', title: 'AI · Propagation Success', icon: '*', color: '#8b5cf6', desc: 'Per-nursery propagation effectiveness.' },
  { path: '/ai/vessel-routing',           title: 'AI · Vessel Routing',      icon: '*', color: '#8b5cf6', desc: 'Optimal day-plan for vessels + sites.' },
  { path: '/ai/weather-dive-window',      title: 'AI · Dive Window',         icon: '*', color: '#8b5cf6', desc: 'Next viable dive window per site.' },
  { path: '/ai/species-id-fish',          title: 'AI · Species ID',          icon: '*', color: '#8b5cf6', desc: 'Probable fish species from observation.' },
  { path: '/ai/publication-summary',      title: 'AI · Publication Summary', icon: '*', color: '#8b5cf6', desc: 'Audience-specific paper summary.' },
  { path: '/ai/training-gap-analysis',    title: 'AI · Training Gap',        icon: '*', color: '#8b5cf6', desc: 'Gaps in diver training & certifications.' },
  { path: '/ai/donor-narrative',          title: 'AI · Donor Narrative',     icon: '*', color: '#8b5cf6', desc: 'Donor-ready story arc + key stats.' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    getDashboardStats().then(setStats).catch((e) => setErr(e.message));
  }, []);

  return (
    <div>
      <div className="dashboard-header">
        <h2>Overview</h2>
        <p>Coral reef restoration program · {new Date().toUTCString()}</p>
      </div>

      {err && <div className="ai-error">Stats unavailable: {err}</div>}

      {stats && (
        <div className="stats-grid">
          <div className="stat"><div className="stat-label">Reef Sites</div><div className="stat-value">{stats.reef_sites?.total ?? '—'}</div><div className="stat-sub">{stats.reef_sites?.active ?? 0} active · {stats.reef_sites?.restricted ?? 0} restricted</div></div>
          <div className="stat"><div className="stat-label">Nurseries</div><div className="stat-value">{stats.nurseries?.total ?? '—'}</div><div className="stat-sub">{Number(stats.nurseries?.total_frags || 0).toLocaleString()} frags housed</div></div>
          <div className="stat"><div className="stat-label">Fragments</div><div className="stat-value">{stats.fragments?.total ?? '—'}</div><div className="stat-sub">avg health {stats.fragments?.avg_health ?? '—'}</div></div>
          <div className="stat"><div className="stat-label">Outplants</div><div className="stat-value">{stats.outplants?.total ?? '—'}</div><div className="stat-sub">{stats.outplants?.alive ?? 0} alive · {stats.outplants?.dead ?? 0} dead</div></div>
          <div className="stat"><div className="stat-label">Monitoring</div><div className="stat-value">{stats.monitoring_visits?.total ?? '—'}</div><div className="stat-sub">site visits logged</div></div>
          <div className="stat"><div className="stat-label">Bleaching</div><div className="stat-value">{stats.bleaching_events?.total ?? '—'}</div><div className="stat-sub">{stats.bleaching_events?.critical ?? 0} critical · {stats.bleaching_events?.high ?? 0} high</div></div>
          <div className="stat"><div className="stat-label">Water Quality</div><div className="stat-value">{stats.water_quality?.total ?? '—'}</div><div className="stat-sub">readings on file</div></div>
          <div className="stat"><div className="stat-label">Fish Counts</div><div className="stat-value">{stats.fish_counts?.total ?? '—'}</div><div className="stat-sub">{Number(stats.fish_counts?.total_count || 0).toLocaleString()} fish counted</div></div>
          <div className="stat"><div className="stat-label">Divers</div><div className="stat-value">{stats.divers?.total ?? '—'}</div><div className="stat-sub">{stats.divers?.active ?? 0} active · {stats.divers?.medical_hold ?? 0} medical</div></div>
          <div className="stat"><div className="stat-label">Equipment</div><div className="stat-value">{stats.equipment?.total ?? '—'}</div><div className="stat-sub">{stats.equipment?.available ?? 0} available · {stats.equipment?.maintenance ?? 0} maint.</div></div>
          <div className="stat"><div className="stat-label">Weather Logs</div><div className="stat-value">{stats.weather_logs?.total ?? '—'}</div><div className="stat-sub">recent observations</div></div>
          <div className="stat"><div className="stat-label">Vessels</div><div className="stat-value">{stats.vessels?.total ?? '—'}</div><div className="stat-sub">{stats.vessels?.available ?? 0} available · {stats.vessels?.in_use ?? 0} in-use</div></div>
          <div className="stat"><div className="stat-label">Propagation Runs</div><div className="stat-value">{stats.propagation_runs?.total ?? '—'}</div><div className="stat-sub">avg success {stats.propagation_runs?.avg_success ?? '—'}%</div></div>
          <div className="stat"><div className="stat-label">Partners</div><div className="stat-value">{stats.partners?.total ?? '—'}</div><div className="stat-sub">${Number(stats.partners?.total_usd || 0).toLocaleString()} contributed</div></div>
          <div className="stat"><div className="stat-label">Grants</div><div className="stat-value">{stats.grants?.total ?? '—'}</div><div className="stat-sub">${Number(stats.grants?.total_usd || 0).toLocaleString()} portfolio</div></div>
          <div className="stat"><div className="stat-label">Publications</div><div className="stat-value">{stats.publications?.total ?? '—'}</div><div className="stat-sub">{stats.publications?.published ?? 0} published · {stats.publications?.in_review ?? 0} review</div></div>
          <div className="stat"><div className="stat-label">Trainings</div><div className="stat-value">{stats.training_sessions?.total ?? '—'}</div><div className="stat-sub">{stats.training_sessions?.completed ?? 0} done · {stats.training_sessions?.planned ?? 0} planned</div></div>
          <div className="stat"><div className="stat-label">Audit Log</div><div className="stat-value">{stats.audit_log?.total ?? '—'}</div><div className="stat-sub">governance entries</div></div>
        </div>
      )}

      <h3 style={{ color: '#cbd5e1', margin: '8px 0 14px', fontSize: 15, textTransform: 'uppercase', letterSpacing: 1 }}>Capabilities</h3>
      <div className="feature-grid">
        {FEATURES.map((f) => (
          <div
            key={f.path}
            className="feature-card"
            style={{ ['--card-color']: f.color }}
            onClick={() => navigate(f.path)}
          >
            <div className="feature-card-icon" style={{ background: f.color + '22', color: f.color }}>{f.icon}</div>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

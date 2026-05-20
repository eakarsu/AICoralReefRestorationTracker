import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Dashboard from './pages/Dashboard';

// 18 CRUD pages
import ReefSitesPage         from './pages/ReefSitesPage';
import NurseriesPage         from './pages/NurseriesPage';
import FragmentsPage         from './pages/FragmentsPage';
import OutplantsPage         from './pages/OutplantsPage';
import MonitoringVisitsPage  from './pages/MonitoringVisitsPage';
import BleachingEventsPage   from './pages/BleachingEventsPage';
import WaterQualityPage      from './pages/WaterQualityPage';
import FishCountsPage        from './pages/FishCountsPage';
import DiversPage            from './pages/DiversPage';
import EquipmentPage         from './pages/EquipmentPage';
import WeatherLogsPage       from './pages/WeatherLogsPage';
import PartnersPage          from './pages/PartnersPage';
import GrantsPage            from './pages/GrantsPage';
import PublicationsPage      from './pages/PublicationsPage';
import TrainingSessionsPage  from './pages/TrainingSessionsPage';
import VesselsPage           from './pages/VesselsPage';
import PropagationRunsPage   from './pages/PropagationRunsPage';
import AuditLogPage          from './pages/AuditLogPage';

// 16 AI pages
import AIBleachingForecastPage      from './pages/AIBleachingForecastPage';
import AIFragmentHealthPage         from './pages/AIFragmentHealthPage';
import AISurvivalPredictPage        from './pages/AISurvivalPredictPage';
import AIRestorationPrioritizePage  from './pages/AIRestorationPrioritizePage';
import AIExecutiveBriefPage         from './pages/AIExecutiveBriefPage';
import AIWaterQualityAnomalyPage    from './pages/AIWaterQualityAnomalyPage';
import AIDiverSafetyBriefPage       from './pages/AIDiverSafetyBriefPage';
import AIPartnerImpactPage          from './pages/AIPartnerImpactPage';
import AIGrantDraftPage             from './pages/AIGrantDraftPage';
import AIPropagationSuccessPage     from './pages/AIPropagationSuccessPage';
import AIVesselRoutingPage          from './pages/AIVesselRoutingPage';
import AIWeatherDiveWindowPage      from './pages/AIWeatherDiveWindowPage';
import AISpeciesIdFishPage          from './pages/AISpeciesIdFishPage';
import AIPublicationSummaryPage     from './pages/AIPublicationSummaryPage';
import AITrainingGapPage            from './pages/AITrainingGapPage';
import AIDonorNarrativePage         from './pages/AIDonorNarrativePage';

// Admin
import WebhooksPage from './pages/WebhooksPage';

// Custom Views (Reef Analytics)
import CustomViewsPage from './pages/CustomViewsPage';

import LoginPage from './pages/LoginPage';
import { getToken } from './services/api';

import './App.css';

function RequireAuth({ children }) {
  const location = useLocation();
  if (!getToken()) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
}

function ShellRoutes() {
  return (
    <div className="app">
      <Sidebar />
      <main className="main" style={{ padding: 0 }}>
        <Topbar />
        <div style={{ padding: '24px 32px' }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />

            <Route path="/reef-sites"         element={<ReefSitesPage />} />
            <Route path="/nurseries"          element={<NurseriesPage />} />
            <Route path="/fragments"          element={<FragmentsPage />} />
            <Route path="/outplants"          element={<OutplantsPage />} />
            <Route path="/monitoring-visits"  element={<MonitoringVisitsPage />} />
            <Route path="/bleaching-events"   element={<BleachingEventsPage />} />
            <Route path="/water-quality"      element={<WaterQualityPage />} />
            <Route path="/fish-counts"        element={<FishCountsPage />} />
            <Route path="/divers"             element={<DiversPage />} />
            <Route path="/equipment"          element={<EquipmentPage />} />
            <Route path="/weather-logs"       element={<WeatherLogsPage />} />
            <Route path="/partners"           element={<PartnersPage />} />
            <Route path="/grants"             element={<GrantsPage />} />
            <Route path="/publications"       element={<PublicationsPage />} />
            <Route path="/training-sessions"  element={<TrainingSessionsPage />} />
            <Route path="/vessels"            element={<VesselsPage />} />
            <Route path="/propagation-runs"   element={<PropagationRunsPage />} />
            <Route path="/audit-log"          element={<AuditLogPage />} />

            <Route path="/ai/bleaching-event-forecast" element={<AIBleachingForecastPage />} />
            <Route path="/ai/fragment-health-vision"   element={<AIFragmentHealthPage />} />
            <Route path="/ai/survival-predict"         element={<AISurvivalPredictPage />} />
            <Route path="/ai/restoration-prioritize"   element={<AIRestorationPrioritizePage />} />
            <Route path="/ai/executive-brief"          element={<AIExecutiveBriefPage />} />
            <Route path="/ai/water-quality-anomaly"    element={<AIWaterQualityAnomalyPage />} />
            <Route path="/ai/diver-safety-brief"       element={<AIDiverSafetyBriefPage />} />
            <Route path="/ai/partner-impact-report"    element={<AIPartnerImpactPage />} />
            <Route path="/ai/grant-application-draft"  element={<AIGrantDraftPage />} />
            <Route path="/ai/propagation-success-rate" element={<AIPropagationSuccessPage />} />
            <Route path="/ai/vessel-routing"           element={<AIVesselRoutingPage />} />
            <Route path="/ai/weather-dive-window"      element={<AIWeatherDiveWindowPage />} />
            <Route path="/ai/species-id-fish"          element={<AISpeciesIdFishPage />} />
            <Route path="/ai/publication-summary"      element={<AIPublicationSummaryPage />} />
            <Route path="/ai/training-gap-analysis"    element={<AITrainingGapPage />} />
            <Route path="/ai/donor-narrative"          element={<AIDonorNarrativePage />} />

            <Route path="/webhooks" element={<WebhooksPage />} />

            <Route path="/custom-views" element={<CustomViewsPage />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/*"
          element={
            <RequireAuth>
              <ShellRoutes />
            </RequireAuth>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;

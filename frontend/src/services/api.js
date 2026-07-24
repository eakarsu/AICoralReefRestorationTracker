const API_BASE =
  (typeof window !== 'undefined' && window.__API_BASE__) ||
  process.env.REACT_APP_API_BASE ||
  'http://localhost:3079/api';

export { API_BASE };

const TOKEN_KEY = 'crrt_token';
const USER_KEY  = 'crrt_user';

export function getToken() {
  try { return localStorage.getItem(TOKEN_KEY); } catch (_) { return null; }
}
export function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch (_) {}
}
export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (_) { return null; }
}
export function setStoredUser(user) {
  try {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);
  } catch (_) {}
}
export function logout() {
  setToken(null);
  setStoredUser(null);
  if (typeof window !== 'undefined') {
    window.location.assign('/login');
  }
}

// Role helpers
export function getRole() {
  return (getStoredUser()?.role || 'viewer').toLowerCase();
}
export function canWrite() {
  return ['admin', 'scientist'].includes(getRole());
}
export function isAdmin() {
  return getRole() === 'admin';
}

async function request(url, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  let res;
  try {
    res = await fetch(`${API_BASE}${url}`, { ...options, headers });
  } catch (e) {
    throw new Error(`Network error: ${e.message}`);
  }

  if (res.status === 401) {
    if (!url.startsWith('/auth/login')) {
      logout();
      throw new Error('Session expired');
    }
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

// Generic CRUD factory
function crud(base) {
  return {
    list:   ()       => request(`/${base}`),
    get:    (id)     => request(`/${base}/${id}`),
    create: (data)   => request(`/${base}`, { method: 'POST', body: JSON.stringify(data) }),
    update: (id, d)  => request(`/${base}/${id}`, { method: 'PUT',  body: JSON.stringify(d) }),
    remove: (id)     => request(`/${base}/${id}`, { method: 'DELETE' }),
    bulkImport: (csv) => request(`/${base}/bulk-import`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/csv' },
      body: csv,
    }),
    listAttachments: (id) => request(`/${base}/${id}/attachments`),
    uploadAttachment: async (id, file) => {
      const token = getToken();
      const form = new FormData();
      form.append('file', file);
      const res = await fetch(`${API_BASE}/${base}/${id}/attachments`, {
        method: 'POST',
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: form,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Upload failed (${res.status})`);
      return data;
    },
  };
}

// Apply pass 7 — additional CRUD entities
export const diveLogsApi             = crud('dive-logs');
export const citizenSubmissionsApi   = crud('citizen-submissions');

// Apply pass 7 — extra non-CRUD helpers
export const moderateCitizenSubmission = (id, body) =>
  request(`/citizen-submissions/${id}/moderate`, { method: 'POST', body: JSON.stringify(body || {}) });
export const getCitizenQueue       = () => request('/citizen-submissions/queue');
export const getCitizenLeaderboard = () => request('/citizen-submissions/leaderboard');

// Public (no auth) — citizen-science submission
export const submitCitizenPublic = async (body) => {
  const res = await fetch(`${API_BASE}/public/citizen-submissions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body || {}),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Submit failed (${res.status})`);
  return data;
};

// Fragment lineage
export const getFragmentLineage = (fragId) => request(`/fragment-lineage/${encodeURIComponent(fragId)}`);
export const getGenotypeCohort  = (genotypeId) => request(`/fragment-lineage/genotype/${encodeURIComponent(genotypeId)}`);

// NOAA Coral Reef Watch ingest (NEEDS-CREDS — 503 unless NOAA_CRW_ENABLED=true)
export const getNoaaCrwStatus  = () => request('/noaa-crw/status');
export const getNoaaCrwIngests = () => request('/noaa-crw/ingests');
export const triggerNoaaCrw    = (body) => request('/noaa-crw/trigger', { method: 'POST', body: JSON.stringify(body || {}) });
export const reefHeatStressPlan = (body) => request('/reef-heat-stress-plan/score', { method: 'POST', body: JSON.stringify(body || {}) });

// 18 CRUD entities
export const reefSitesApi         = crud('reef-sites');
export const nurseriesApi         = crud('nurseries');
export const fragmentsApi         = crud('fragments');
export const outplantsApi         = crud('outplants');
export const monitoringVisitsApi  = crud('monitoring-visits');
export const bleachingEventsApi   = crud('bleaching-events');
export const waterQualityApi      = crud('water-quality');
export const fishCountsApi        = crud('fish-counts');
export const diversApi            = crud('divers');
export const equipmentApi         = crud('equipment');
export const weatherLogsApi       = crud('weather-logs');
export const partnersApi          = crud('partners');
export const grantsApi            = crud('grants');
export const publicationsApi      = crud('publications');
export const trainingSessionsApi  = crud('training-sessions');
export const vesselsApi           = crud('vessels');
export const propagationRunsApi   = crud('propagation-runs');
export const auditLogApi          = crud('audit-log');

// Dashboard
export const getDashboardStats = () => request('/dashboard');

// Auth
export const login = (email, password) =>
  request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
export const getMe = () => request('/auth/me');

// AI verbs (16)
export const aiBleachingForecast    = (b) => request('/ai/bleaching-event-forecast',  { method: 'POST', body: JSON.stringify(b || {}) });
export const aiFragmentHealth       = (b) => request('/ai/fragment-health-vision',    { method: 'POST', body: JSON.stringify(b || {}) });
export const aiSurvivalPredict      = (b) => request('/ai/survival-predict',          { method: 'POST', body: JSON.stringify(b || {}) });
export const aiRestorationPrior     = (b) => request('/ai/restoration-prioritize',    { method: 'POST', body: JSON.stringify(b || {}) });
export const aiExecutiveBrief       = (b) => request('/ai/executive-brief',           { method: 'POST', body: JSON.stringify(b || {}) });
export const aiWaterQualityAnomaly  = (b) => request('/ai/water-quality-anomaly',     { method: 'POST', body: JSON.stringify(b || {}) });
export const aiDiverSafetyBrief     = (b) => request('/ai/diver-safety-brief',        { method: 'POST', body: JSON.stringify(b || {}) });
export const aiPartnerImpact        = (b) => request('/ai/partner-impact-report',     { method: 'POST', body: JSON.stringify(b || {}) });
export const aiGrantDraft           = (b) => request('/ai/grant-application-draft',   { method: 'POST', body: JSON.stringify(b || {}) });
export const aiPropagationSuccess   = (b) => request('/ai/propagation-success-rate',  { method: 'POST', body: JSON.stringify(b || {}) });
export const aiVesselRouting        = (b) => request('/ai/vessel-routing',            { method: 'POST', body: JSON.stringify(b || {}) });
export const aiWeatherDiveWindow    = (b) => request('/ai/weather-dive-window',       { method: 'POST', body: JSON.stringify(b || {}) });
export const aiSpeciesIdFish        = (b) => request('/ai/species-id-fish',           { method: 'POST', body: JSON.stringify(b || {}) });
export const aiPublicationSummary   = (b) => request('/ai/publication-summary',       { method: 'POST', body: JSON.stringify(b || {}) });
export const aiTrainingGap          = (b) => request('/ai/training-gap-analysis',     { method: 'POST', body: JSON.stringify(b || {}) });
export const aiDonorNarrative       = (b) => request('/ai/donor-narrative',           { method: 'POST', body: JSON.stringify(b || {}) });

// Apply pass 7 — additional AI verbs
export const aiSpeciesMixRecommend  = (b) => request('/ai/species-mix-recommend',     { method: 'POST', body: JSON.stringify(b || {}) });
export const aiGrowthRateModel      = (b) => request('/ai/growth-rate-model',         { method: 'POST', body: JSON.stringify(b || {}) });
export const aiGenotypeRescueMatch  = (b) => request('/ai/genotype-rescue-match',     { method: 'POST', body: JSON.stringify(b || {}) });

// AI history
export const getAIHistory = (feature, limit = 25) => {
  const qs = new URLSearchParams({
    ...(feature ? { feature } : {}),
    limit: String(limit),
  }).toString();
  return request(`/ai/history?${qs}`);
};

// AI sample fills
export const getAISamples = (feature) => {
  const qs = new URLSearchParams({ feature: feature || '' }).toString();
  return request(`/ai/samples?${qs}`);
};

// Notifications
export const getNotifications       = () => request('/notifications');
export const getUnreadNotifications = () => request('/notifications/unread');
export const markNotificationRead   = (id) => request(`/notifications/${id}/read`, { method: 'POST' });
export const markAllNotificationsRead = () => request('/notifications/mark-all-read', { method: 'POST' });

// Webhooks
export const webhooksApi = {
  list:    ()         => request('/webhooks'),
  create:  (d)        => request('/webhooks',          { method: 'POST', body: JSON.stringify(d) }),
  update:  (id, d)    => request(`/webhooks/${id}`,    { method: 'PUT',  body: JSON.stringify(d) }),
  remove:  (id)       => request(`/webhooks/${id}`,    { method: 'DELETE' }),
  test:    (event, payload) => request('/webhooks/test', {
    method: 'POST',
    body: JSON.stringify({ event, payload }),
  }),
  deliveries: (id)    => request(`/webhooks/${id}/deliveries`),
};

// AI helper service for AICoralReefRestorationTracker.
// Reads OPENROUTER_API_KEY and OPENROUTER_MODEL from:
//   1. this project's .env (already loaded by server.js)
//   2. fallback: /Users/erolakarsu/projects/beauty-wellness-ai/.env (canonical source)
// Never overwrites or wipes credentials.

const fs = require('fs');
const path = require('path');

const FALLBACK_ENV = '/Users/erolakarsu/projects/beauty-wellness-ai/.env';

function readFallbackEnv() {
  try {
    if (!fs.existsSync(FALLBACK_ENV)) return {};
    const raw = fs.readFileSync(FALLBACK_ENV, 'utf8');
    const out = {};
    for (const line of raw.split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (!m) continue;
      let val = m[2];
      if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
      if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
      out[m[1]] = val;
    }
    return out;
  } catch (e) {
    console.warn('[ai] fallback env read failed:', e.message);
    return {};
  }
}

function getOpenRouterCreds() {
  const fb = readFallbackEnv();
  const key = process.env.OPENROUTER_API_KEY || fb.OPENROUTER_API_KEY || '';
  const model = process.env.OPENROUTER_MODEL || fb.OPENROUTER_MODEL || 'anthropic/claude-haiku-4.5';
  return { key, model };
}

const SYSTEM_PROMPT =
  'You are a senior marine biologist and coral-reef restoration scientist supporting an operations console. ' +
  'You give rigorous, field-ready guidance for nurseries, outplants, bleaching response, water quality, dive safety, ' +
  'partner reporting and grant operations. Always return strict JSON in the exact schema requested.';

function callOpenRouter(systemPrompt, userPrompt) {
  return new Promise((resolve, reject) => {
    const { key, model } = getOpenRouterCreds();
    if (!key) {
      return resolve({ error: 'OPENROUTER_API_KEY not configured' });
    }
    const https = require('https');
    const payload = JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.6,
      max_tokens: 2000,
    });

    const options = {
      hostname: 'openrouter.ai',
      path: '/api/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        Authorization: `Bearer ${key}`,
        'HTTP-Referer': 'http://localhost:3078',
        'X-Title': 'AI Coral Reef Restoration Tracker',
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          if (parsed.error) {
            return resolve({ error: parsed.error.message || 'OpenRouter error', raw: body });
          }
          const content = parsed.choices?.[0]?.message?.content || '';
          resolve(content);
        } catch (e) {
          resolve({ error: 'AI response parse failed', raw: body });
        }
      });
    });
    req.on('error', (e) => resolve({ error: e.message }));
    req.write(payload);
    req.end();
  });
}

function safeJsonParse(response, fallback) {
  if (response && typeof response === 'object' && response.error) {
    return { ...fallback, error: response.error };
  }
  if (response == null) return { ...fallback, summary: '' };
  if (typeof response === 'object') return response;
  const text = String(response).trim();
  try { return JSON.parse(text); } catch (_) {}
  try {
    const start = text.indexOf('{');
    if (start !== -1) {
      let depth = 0, inStr = false, esc = false;
      for (let i = start; i < text.length; i++) {
        const ch = text[i];
        if (esc) { esc = false; continue; }
        if (ch === '\\') { esc = true; continue; }
        if (ch === '"') { inStr = !inStr; continue; }
        if (inStr) continue;
        if (ch === '{') depth++;
        else if (ch === '}') { depth--; if (depth === 0) return JSON.parse(text.slice(start, i + 1)); }
      }
    }
  } catch (_) {}
  try {
    const fenced = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (fenced && fenced[1]) return JSON.parse(fenced[1].trim());
  } catch (_) {}
  return { ...fallback, summary: text };
}

// ============================================================
// AI verbs (16)
// ============================================================

// 1. bleaching-event-forecast
async function bleachingEventForecast(siteContext = {}, sst = {}) {
  const sys = `${SYSTEM_PROMPT} Forecast bleaching risk for the next 60 days. Return strict JSON:
{
  "site_id": string,
  "risk_level": "low"|"medium"|"high"|"critical",
  "probability_pct": number,
  "expected_window": { "start": string, "peak": string, "end": string },
  "drivers": [{ "driver": string, "magnitude": "low"|"medium"|"high", "narrative": string }],
  "recommended_actions": [string],
  "summary": string
}`;
  const usr = `Site context:\n${JSON.stringify(siteContext, null, 2)}\n\nSST + thermal stress:\n${JSON.stringify(sst, null, 2)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response', drivers: [] });
}

// 2. fragment-health-vision
async function fragmentHealthVision(notes, fragmentRows = []) {
  const sys = `${SYSTEM_PROMPT} From the provided fragment observations and / or photo notes, classify health. Return strict JSON:
{
  "samples": [{
    "frag_id": string,
    "predicted_health_score": number,
    "tissue_color": "vibrant"|"normal"|"pale"|"bleached",
    "tissue_loss_pct": number,
    "predation_signs": "none"|"low"|"medium"|"high",
    "algae_overgrowth": "none"|"low"|"medium"|"high",
    "recommended_action": string
  }],
  "overall_average_score": number,
  "summary": string
}`;
  const usr = `Notes / observations:\n${notes || '(none)'}\n\nFragments:\n${JSON.stringify(fragmentRows, null, 2)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { samples: [], summary: typeof r === 'string' ? r : 'No response' });
}

// 3. survival-predict
async function survivalPredict(outplantRows = [], environment = {}) {
  const sys = `${SYSTEM_PROMPT} Predict 12-month survival for each outplant. Return strict JSON:
{
  "predictions": [{
    "outplant_id": string,
    "site_id": string,
    "predicted_survival_pct": number,
    "key_risk_factors": [string],
    "recommended_action": string
  }],
  "site_aggregates": [{ "site_id": string, "mean_predicted_survival_pct": number }],
  "summary": string
}`;
  const usr = `Outplants:\n${JSON.stringify(outplantRows, null, 2)}\n\nEnvironment:\n${JSON.stringify(environment, null, 2)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { predictions: [], summary: typeof r === 'string' ? r : 'No response' });
}

// 4. restoration-prioritize
async function restorationPrioritize(sites = [], constraints = {}) {
  const sys = `${SYSTEM_PROMPT} Prioritize sites for the next restoration cycle. Return strict JSON:
{
  "prioritized": [{
    "site_id": string,
    "rank": number,
    "score": number,
    "rationale": string,
    "recommended_action": "expand"|"hold"|"reduce"|"pause"
  }],
  "deferred": [{ "site_id": string, "reason": string }],
  "summary": string
}`;
  const usr = `Sites:\n${JSON.stringify(sites, null, 2)}\n\nConstraints:\n${JSON.stringify(constraints, null, 2)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { prioritized: [], deferred: [], summary: typeof r === 'string' ? r : 'No response' });
}

// 5. executive-brief
async function executiveBrief(snapshot = {}) {
  const sys = `${SYSTEM_PROMPT} Produce an executive program brief. Return strict JSON:
{
  "headline": string,
  "program_state": string,
  "site_health": { "active": number, "monitored": number, "restricted": number, "narrative": string },
  "outplant_summary": { "alive": number, "partial": number, "dead": number, "narrative": string },
  "top_risks": [{ "risk": string, "severity": "low"|"medium"|"high"|"critical", "owner": string }],
  "decisions_required": [{ "decision": string, "deadline": string, "options": [string], "recommendation": string }],
  "next_30d_outlook": string,
  "summary": string
}`;
  const usr = `Program snapshot:\n${JSON.stringify(snapshot, null, 2)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response' });
}

// 6. water-quality-anomaly
async function waterQualityAnomaly(readings = []) {
  const sys = `${SYSTEM_PROMPT} Detect anomalies in water-quality readings. Return strict JSON:
{
  "anomalies": [{
    "reading_id": string,
    "site_id": string,
    "parameter": string,
    "value": number,
    "expected_range": string,
    "severity": "low"|"medium"|"high"|"critical",
    "likely_cause": string
  }],
  "site_summary": [{ "site_id": string, "status": "ok"|"watch"|"alert"|"critical", "notes": string }],
  "summary": string
}`;
  const usr = `Readings:\n${JSON.stringify(readings, null, 2)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { anomalies: [], summary: typeof r === 'string' ? r : 'No response' });
}

// 7. diver-safety-brief
async function diverSafetyBrief(plannedDive = {}) {
  const sys = `${SYSTEM_PROMPT} Produce a pre-dive safety brief. Return strict JSON:
{
  "go_no_go": "go"|"caution"|"no_go",
  "hazards": [{ "hazard": string, "likelihood": "low"|"medium"|"high", "mitigation": string }],
  "max_depth_m": number,
  "max_bottom_time_min": number,
  "buddy_assignments": [{ "diver": string, "role": string }],
  "emergency_plan": string,
  "summary": string
}`;
  const usr = `Planned dive:\n${JSON.stringify(plannedDive, null, 2)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { hazards: [], summary: typeof r === 'string' ? r : 'No response' });
}

// 8. partner-impact-report
async function partnerImpactReport(partnerId, dataset = {}) {
  const sys = `${SYSTEM_PROMPT} Compose a partner-facing impact report. Return strict JSON:
{
  "partner_id": string,
  "headline_metric": string,
  "impact_paragraphs": [string],
  "metrics_table": [{ "metric": string, "value": string, "trend": "up"|"down"|"flat" }],
  "next_actions": [string],
  "summary": string
}`;
  const usr = `Partner: ${partnerId}\nDataset:\n${JSON.stringify(dataset, null, 2)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response' });
}

// 9. grant-application-draft
async function grantApplicationDraft(opportunity = {}, programContext = {}) {
  const sys = `${SYSTEM_PROMPT} Draft a grant application narrative. Return strict JSON:
{
  "title": string,
  "executive_summary": string,
  "specific_aims": [string],
  "approach": string,
  "deliverables": [{ "deliverable": string, "milestone_date": string }],
  "budget_breakdown": [{ "category": string, "amount_usd": number, "rationale": string }],
  "evaluation_plan": string,
  "summary": string
}`;
  const usr = `Opportunity:\n${JSON.stringify(opportunity, null, 2)}\n\nProgram context:\n${JSON.stringify(programContext, null, 2)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response' });
}

// 10. propagation-success-rate
async function propagationSuccessRate(runs = []) {
  const sys = `${SYSTEM_PROMPT} Analyze propagation run effectiveness. Return strict JSON:
{
  "overall_mean_pct": number,
  "per_nursery": [{ "nursery_id": string, "mean_pct": number, "runs": number, "trend": "up"|"down"|"flat" }],
  "outliers": [{ "run_id": string, "issue": string }],
  "recommendations": [string],
  "summary": string
}`;
  const usr = `Runs:\n${JSON.stringify(runs, null, 2)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { per_nursery: [], summary: typeof r === 'string' ? r : 'No response' });
}

// 11. vessel-routing
async function vesselRouting(legs = [], vessels = []) {
  const sys = `${SYSTEM_PROMPT} Plan optimal vessel routing for the day's dive operations. Return strict JSON:
{
  "assignments": [{
    "vessel_id": string,
    "vessel_name": string,
    "stops": [{ "site_id": string, "eta": string, "duration_min": number, "purpose": string }],
    "total_distance_nm": number,
    "fuel_required_l": number
  }],
  "warnings": [string],
  "summary": string
}`;
  const usr = `Legs requested:\n${JSON.stringify(legs, null, 2)}\n\nVessels:\n${JSON.stringify(vessels, null, 2)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { assignments: [], summary: typeof r === 'string' ? r : 'No response' });
}

// 12. weather-dive-window
async function weatherDiveWindow(siteId, forecast = {}) {
  const sys = `${SYSTEM_PROMPT} Compute next viable dive window for the site. Return strict JSON:
{
  "site_id": string,
  "next_window": { "open": string, "close": string, "viability": "ok"|"marginal"|"poor" },
  "blockers": [{ "factor": string, "severity": "low"|"medium"|"high" }],
  "alternates": [{ "open": string, "close": string, "viability": string }],
  "summary": string
}`;
  const usr = `Site: ${siteId}\nForecast:\n${JSON.stringify(forecast, null, 2)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response', blockers: [] });
}

// 13. species-id-fish
async function speciesIdFish(description, recentCounts = []) {
  const sys = `${SYSTEM_PROMPT} Identify probable fish species from an observation. Return strict JSON:
{
  "candidates": [{
    "scientific_name": string,
    "common_name": string,
    "confidence": number,
    "diagnostic_features": [string],
    "ecological_role": string
  }],
  "follow_up_questions": [string],
  "summary": string
}`;
  const usr = `Observation:\n${description || '(none)'}\n\nRecent counts at site:\n${JSON.stringify(recentCounts, null, 2)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { candidates: [], summary: typeof r === 'string' ? r : 'No response' });
}

// 14. publication-summary
async function publicationSummary(publication = {}, audience = 'donor') {
  const sys = `${SYSTEM_PROMPT} Summarize the publication for the requested audience. Return strict JSON:
{
  "pub_id": string,
  "audience": string,
  "headline": string,
  "lay_summary": string,
  "key_findings": [string],
  "implications_for_restoration": [string],
  "suggested_quote": string,
  "summary": string
}`;
  const usr = `Audience: ${audience}\nPublication:\n${JSON.stringify(publication, null, 2)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response' });
}

// 15. training-gap-analysis
async function trainingGapAnalysis(diverRoster = [], sessions = []) {
  const sys = `${SYSTEM_PROMPT} Identify gaps in diver training and certifications. Return strict JSON:
{
  "gaps": [{
    "diver_id": string,
    "name": string,
    "missing_certifications": [string],
    "recommended_courses": [string],
    "priority": "low"|"medium"|"high"
  }],
  "program_recommendations": [string],
  "summary": string
}`;
  const usr = `Diver roster:\n${JSON.stringify(diverRoster, null, 2)}\n\nRecent / planned sessions:\n${JSON.stringify(sessions, null, 2)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { gaps: [], summary: typeof r === 'string' ? r : 'No response' });
}

// 16. donor-narrative
async function donorNarrative(programMetrics = {}, tone = 'inspiring') {
  const sys = `${SYSTEM_PROMPT} Craft a donor-facing narrative. Return strict JSON:
{
  "tone": string,
  "headline": string,
  "story_arc": { "hook": string, "conflict": string, "transformation": string, "call_to_action": string },
  "key_stats": [{ "label": string, "value": string }],
  "quote_options": [string],
  "summary": string
}`;
  const usr = `Tone: ${tone}\nProgram metrics:\n${JSON.stringify(programMetrics, null, 2)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response' });
}

module.exports = {
  callOpenRouter,
  safeJsonParse,
  bleachingEventForecast,
  fragmentHealthVision,
  survivalPredict,
  restorationPrioritize,
  executiveBrief,
  waterQualityAnomaly,
  diverSafetyBrief,
  partnerImpactReport,
  grantApplicationDraft,
  propagationSuccessRate,
  vesselRouting,
  weatherDiveWindow,
  speciesIdFish,
  publicationSummary,
  trainingGapAnalysis,
  donorNarrative,
};

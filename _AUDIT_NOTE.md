# Audit Note — AICoralReefRestorationTracker

Domain: coral reef restoration — outplanting site selection, bleaching alerts, fragment tracking, growth modeling, species/genotype management.

Reference pattern: `/Users/erolakarsu/projects/AISpaceDebrisTracker/_AUDIT_NOTE.md`.

## Catalog (existing)

### AI endpoints (16) — `backend/routes/ai.js`
`bleaching-event-forecast`, `fragment-health-vision`, `survival-predict`, `restoration-prioritize`, `executive-brief`, `water-quality-anomaly`, `diver-safety-brief`, `partner-impact-report`, `grant-application-draft`, `propagation-success-rate`, `vessel-routing`, `weather-dive-window`, `species-id-fish`, `publication-summary`, `training-gap-analysis`, `donor-narrative` (+ `GET /samples`, `GET /history`).

### CRUD / non-AI routes (~22)
reefSites, fragments, outplants, nurseries, propagationRuns, bleachingEvents, monitoringVisits, waterQuality, weatherLogs, fishCounts, divers, vessels, equipment, trainingSessions, partners, grants, publications, attachments, auditLog, customViews, dashboard, notifications, webhooks (+ auth).

### Frontend pages (37)
16 AI pages aligned 1:1 with AI endpoints; CRUD pages for every backing route; plus `Dashboard`, `LoginPage`, `AuditLogPage`, `CustomViewsPage`, `WebhooksPage`, and two Codex feature pages.

## Gap Analysis

### Missing AI Counterparts
- **Bleaching-risk forecaster (SST + history)** — COVERED by `bleaching-event-forecast` (verify SST/DHW inputs).
- **Outplant survival predictor** — COVERED by `survival-predict`.
- **Species-mix recommender** — GAP (no endpoint pairs genotype/species diversity to site conditions).
- **Photo-based health assessor** — COVERED by `fragment-health-vision`.
- **Growth-rate modeler** — GAP (no time-series fragment growth projection endpoint).

### Missing Non-AI Features
- **Site CRUD** — COVERED (`reefSites`).
- **Fragment lineage tracking** — PARTIAL (`fragments` table exists; explicit parent/child lineage graph + genotype provenance fields unverified).
- **Dive log integration** — PARTIAL (`divers`, `monitoringVisits`, `weatherLogs` present; no unified dive-log model with depth/bottom-time/SAC).
- **Funder reporting** — COVERED (`grants`, `partners`, `partner-impact-report`, `donor-narrative`).

### Custom Suggestions
- **Citizen-science portal** — GAP (no public submission route, no moderation queue).
- **NOAA Coral Reef Watch ingest** — GAP (no scheduled fetcher for SST/DHW/bleaching-alert tiles).
- **Genotype-rescue matchmaking** — GAP (no endpoint matching donor genotypes to recipient sites by thermal tolerance).

## Implemented (this round)
None — audit-only.

## Backlog (prioritized)
1. **MECHANICAL** `POST /api/ai/species-mix-recommend` — site conditions + genotype pool to recommended outplant mix.
2. **MECHANICAL** `POST /api/ai/growth-rate-model` — fragment time-series to projected growth curve.
3. **MECHANICAL** `POST /api/ai/genotype-rescue-match` — donor-to-recipient matchmaking on thermal-tolerance traits.
4. **MECHANICAL** Fragment lineage graph endpoint + genotype provenance columns.
5. **MECHANICAL** Unified dive-log model (depth, bottom time, SAC, gas).
6. **NEEDS-PRODUCT-DECISION** Citizen-science portal (public submission, moderation, gamification).
7. **NEEDS-CREDS** NOAA Coral Reef Watch ingest (ERDDAP/THREDDS scheduled fetcher; no auth required but needs cron infra).

## Status
Audit-only. No files modified. 16 AI endpoints + ~22 CRUD routes + 37 frontend pages cataloged. 5 gaps identified (2 AI, 2 non-AI partial, 3 custom).

## Apply pass 7 (full backlog implementation)

Closed every backlog item. MECHANICAL + NEEDS-PRODUCT-DECISION fully implemented; NEEDS-CREDS (NOAA Coral Reef Watch ingest) shipped as a 503 stub plus an ingest-log table so operators can see exactly what's blocking it.

### New backend endpoints
AI (3):
- `POST /api/ai/species-mix-recommend`           — site conditions + genotype pool → outplant mix (species, share %, thermal tolerance, ecological role).
- `POST /api/ai/growth-rate-model`               — fragment time-series → monthly growth + 12/24-month projection.
- `POST /api/ai/genotype-rescue-match`           — donor pool × recipient sites → match score, trait alignment, recommended fragment counts.

CRUD + read endpoints:
- `GET/POST/PUT/DELETE /api/dive-logs`           — unified dive log (max/avg depth, bottom time, SAC, gas mix, pressures, viz, buddy).
- `GET    /api/fragment-lineage/:frag_id`         — fragment + ancestors + descendants + siblings + genotype cohort (recursive CTE, depth-limited 20).
- `GET    /api/fragment-lineage/genotype/:id`     — all fragments sharing a genotype_id.
- `GET    /api/citizen-submissions`               — list (optional `?status=pending|approved|...`).
- `GET    /api/citizen-submissions/queue`         — pending moderation queue, oldest first.
- `GET    /api/citizen-submissions/leaderboard`   — gamification leaderboard (submissions, approvals, points).
- `GET    /api/citizen-submissions/:id`           — single submission.
- `POST   /api/citizen-submissions`               — auth-gated create (e.g. partner ingest).
- `PUT    /api/citizen-submissions/:id`           — auth-gated update.
- `DELETE /api/citizen-submissions/:id`           — auth-gated delete.
- `POST   /api/citizen-submissions/:id/moderate`  — `{ decision, moderator_notes, reward_points }`; fires `citizen_submission.<decision>` webhook.
- `POST   /api/public/citizen-submissions`        — PUBLIC, no auth, mounted BEFORE `authenticateToken`; rate-limited 10/min/IP; fires `citizen_submission.received` webhook.
- `GET    /api/noaa-crw/status`                   — ingest configuration status.
- `GET    /api/noaa-crw/ingests`                  — ingest log.
- `POST   /api/noaa-crw/trigger`                  — 503 unless `NOAA_CRW_ENABLED=true` (logs a `skipped` row so operators see the gap).
- `POST   /api/noaa-crw/schedule`                 — 503 unless enabled; 501 even when enabled (external scheduler required).

### New frontend pages
- `AISpeciesMixRecommendPage.js`   → `/ai/species-mix-recommend`
- `AIGrowthRateModelPage.js`       → `/ai/growth-rate-model`
- `AIGenotypeRescueMatchPage.js`   → `/ai/genotype-rescue-match`
- `DiveLogsPage.js`                → `/dive-logs`
- `CitizenSubmissionsPage.js`      → `/citizen-submissions` (queue / all / leaderboard tabs; approve/reject/needs_info actions)
- `CitizenPortalPage.js`           → `/citizen-portal` (public submission form, talks to `/api/public/citizen-submissions`)
- `FragmentLineagePage.js`         → `/fragment-lineage` (ancestors / descendants / siblings / genotype cohort viewer)
- `NoaaCrwPage.js`                 → `/noaa-crw` (status + ingest log + manual trigger surface; clearly marked NEEDS-CREDS)

Sidebar updated with: Fragment Lineage (under Sites & Nurseries), Dive Logs (under Divers & Vessels), 3 new AI verbs (under AI Forecasting), a new "Citizen Science" group with Submit Observation + Moderation Queue, and "NOAA Coral Reef Watch" under Admin.

### Schema (migration `002_pass7_full_backlog.sql`, additive, IF NOT EXISTS, re-runnable)
- `ALTER TABLE fragments` — added `parent_frag_id`, `genotype_id`, `provenance_source`, `thermal_tolerance_c`, `disease_resistance` (+ indexes on parent & genotype). `routes/fragments.js` field list extended; CSV bulk-import and `_crudFactory` pick them up automatically.
- `dive_logs`             — `dive_log_id`, `diver_id`, `site_id`, `dive_at`, `max_depth_m`, `avg_depth_m`, `bottom_time_min`, `sac_l_per_min`, `gas_mix`, `start/end_pressure_bar`, `water_temp_c`, `visibility_m`, `buddy`, `notes` + indexes on (diver_id, dive_at) and (site_id, dive_at).
- `citizen_submissions`   — `submission_id`, `submitter_name/email`, `site_id`, `observed_at`, `observation_type`, `species`, `description`, `photo_url`, `latitude/longitude`, `moderation_status` (pending|approved|rejected|needs_info), `moderator_notes`, `reward_points` + index on (moderation_status, created_at).
- `noaa_crw_ingests`      — ingest run log (`dataset`, `region`, `status`, `started_at`, `finished_at`, `records`, `message`).

Migration is wired into `seed/seed.js` after `001_schema.sql` (wrapped in try/catch so re-seeds don't fail).

### Wiring
`backend/server.js`:
- Public mount BEFORE `authenticateToken`: `/api/public/citizen-submissions`.
- Auth-gated mounts BEFORE `app.listen` (no 404 handler exists; default Express 404 follows): `/api/dive-logs`, `/api/citizen-submissions`, `/api/fragment-lineage`, `/api/noaa-crw`.

`frontend/src/services/api.js`:
- 3 new `aiSpeciesMixRecommend`, `aiGrowthRateModel`, `aiGenotypeRescueMatch` helpers.
- `diveLogsApi`, `citizenSubmissionsApi` (via `crud()` factory).
- `submitCitizenPublic`, `moderateCitizenSubmission`, `getCitizenQueue`, `getCitizenLeaderboard`, `getFragmentLineage`, `getGenotypeCohort`, `getNoaaCrwStatus`, `getNoaaCrwIngests`, `triggerNoaaCrw`.

Sample fills added to `routes/ai.js` `SAMPLES` map for all 3 new verbs (5 samples each).

### Constraint compliance
- No new dependencies (everything uses existing express / pg / etc; in-memory rate limiter avoids `express-rate-limit`).
- No breaking changes: every change is additive (new files, new mounts, new columns via `ALTER TABLE … ADD COLUMN IF NOT EXISTS`, new fields appended to `fragments` route factory).
- `node --check` clean on every modified `.js` file:
  - `backend/server.js`, `backend/services/ai.js`, `backend/routes/ai.js`, `backend/routes/fragments.js`,
    `backend/routes/diveLogs.js`, `backend/routes/citizenSubmissions.js`, `backend/routes/citizenPublic.js`,
    `backend/routes/fragmentLineage.js`, `backend/routes/noaaIngest.js`, `backend/seed/seed.js` → all PASS.

### Skipped / deferred
- **NEEDS-CREDS NOAA CRW live fetcher**: stub returns 503; activation requires `NOAA_CRW_ENABLED=true` (and optional `NOAA_CRW_BASE_URL`, `NOAA_CRW_REGION`). No NOAA credentials are technically required, but a cron host with outbound HTTPS is; the service does not ship a cron daemon — `POST /api/noaa-crw/trigger` is the integration point for an external scheduler.
- **NEEDS-CREDS NOAA CRW in-process scheduler**: `POST /api/noaa-crw/schedule` returns 501 even when enabled — adding `node-cron` would violate the no-new-deps rule.

### Status
Full backlog cleared. 3 new AI endpoints + 4 new feature routes + 1 public endpoint + 8 new frontend pages + 1 migration (4 tables / 5 columns added). Skipped: live NOAA ingest (NEEDS-CREDS; surfaced as 503 with operator-visible reason).

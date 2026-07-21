# Completeness Review: AICoralReefRestorationTracker

- **Review date:** 2026-07-18
- **Assessment basis:** Static source and configuration inspection only. Dependencies were not installed, and no build, database migration, external integration, or runtime workflow was executed.

## Classification

**Functional but incomplete**

## Verdict

The repository contains a coherent coral-restoration monitoring implementation with 104 source files and 33 route modules, so it is more than a wireframe. It remains incomplete for real deployment because authoritative integrations, validated domain behavior, and operational hardening are not demonstrated by the inspected source.

## Why it is not complete

- 1 file is explicitly named as gap/gap-feature implementations; route/page count therefore overstates completed product capability.
- The route/page inventory includes `crud factory`, `extend crud`, `ai`, `attachments`; these surfaces show breadth but not durable execution against authoritative systems.
- 2 files reference model-provider or chat-completion behavior; generic LLM calls are not a substitute for deterministic domain execution, grounding, or evaluation.
- 24 files contain mock, sample, placeholder, or random-data signals, leaving important outcomes disconnected from authoritative systems.
- Only 2 recognizable test files were found, insufficient to prove the full workflow and failure modes.
- No CI workflow was found to continuously verify builds, tests, migrations, or security checks.
- No environment example/template was found, so required configuration and secret boundaries are undocumented.

## Needed features

- 1. Implement a workflow to link sites, colonies, interventions, surveys, imagery, environmental observations, and outcomes in a geospatial field workflow.
- 2. Connect GIS, underwater imagery, sensors, weather/ocean data, labs, and mobile/offline collection; replace seed/demo records with durable synchronized data and explicit failure handling.
- 3. Validate species/health classification, spatial accuracy, survival/growth metrics, missing data, and seasonal drift.
- 4. Preserve field provenance, dataset/model versions, offline integrity, and scientist review.
- 5. Add contract, integration, authorization, migration, and end-to-end tests in CI, plus a documented non-destructive deployment/run path.

## Risks or launch blockers

- The root launcher can terminate unrelated processes occupying configured ports.
- The root launcher seeds, creates, migrates, or otherwise mutates database state during startup.
- The root launcher installs dependencies at run time, reducing reproducibility and expanding supply-chain risk.
- Ungrounded or malformed model output can become a domain action unless schemas, evidence, evaluations, and approval gates are added.

## Evidence inspected

- `backend/package.json` — declared scripts, runtime dependencies, and application boundaries.
- `frontend/package.json` — declared scripts, runtime dependencies, and application boundaries.
- `package.json` — declared scripts, runtime dependencies, and application boundaries.
- `backend/server.js` — service composition, middleware, and registered routes.
- `frontend/src/index.js` — service composition, middleware, and registered routes.
- `backend/routes/_crudFactory.js` — implemented API surface and domain/AI request handling.

## Recommended next action

Use crud factory and extend crud as the boundary for one production coral-restoration monitoring workflow, connect its authoritative systems, and define measurable acceptance tests; defer additional screens until it passes end to end.

## Implementation progress (2026-07-18)

1. **Implemented locally:** governed fieldwork service/routes/migration link site, colony, intervention, survey, imagery, dataset/model versions, coordinates/accuracy, species/health, survival/growth, season, and independent scientist review under a tenant.
2. **Partially implemented; externally blocked:** device/source IDs, capture/receive times, evidence hashes, versions, and idempotent offline ingestion are durable. GIS, underwater imagery, sensors, weather/ocean, labs, device identity, and mobile sync need providers/hardware/infrastructure. Public citizen, NOAA, AI, and legacy routes default off.
3. **Implemented locally:** controlled health/survival values, coordinates/accuracy, future times, growth, missing-data reasons, seasonal labels, and labeled species/health/reviewer metrics are validated. Taxonomy authorities, seasonal baselines, models, and scientist thresholds remain external.
4. **Implemented locally:** tenant/RBAC filters, scrypt passwords, provenance hashes/versions, collector/reviewer separation, and append-only hash events are present. Device certificates, custody/retention, and offline conflict resolution remain external.
5. **Implemented locally:** four tests, CI, environment/operations docs, checksummed migrations, user provisioning, destructive seed guard, DB secret requirements, and a non-destructive launcher are present.

Static validation: 4/4 tests passed plus syntax/JSON/shell, unsafe-pattern, and diff checks. Dependencies were absent; no service/database/integration/build ran and no scientific/provider/regulatory validation is claimed.

## Runtime acceptance (2026-07-20)

- The first runtime attempt exposed macOS Bash incompatibility in `start.sh` (`wait -n`) and then a login failure because destructive demo seed data had no usable scrypt credential.
- `start.sh` now uses portable process waiting, and the explicit `create-admin` workflow provisions a tenant-scoped scrypt administrator without overwriting an existing identity.
- A fresh disposable PostgreSQL instance and both services passed `startup_login_session_api`: startup, credential login, authenticated `/api/auth/me`, and session-backed API access were verified on PostgreSQL `55549`, API `5918`, and UI `5919`.
- This is runtime acceptance of the local authentication path only; scientific/provider/regulatory validation remains outside this evidence.

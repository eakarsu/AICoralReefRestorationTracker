-- Apply pass 7 — full backlog (additive only; safe to re-run)
--
-- 1) Fragment lineage + genotype provenance columns
-- 2) Unified dive_logs table (depth, bottom time, SAC, gas)
-- 3) Citizen-science portal (submissions + moderation)
-- 4) NOAA Coral Reef Watch ingest log (stub table; populated only when creds present)

-- ----------------------------------------------------------------
-- 1) Fragment lineage + genotype provenance
-- ----------------------------------------------------------------
ALTER TABLE fragments ADD COLUMN IF NOT EXISTS parent_frag_id     VARCHAR(50);
ALTER TABLE fragments ADD COLUMN IF NOT EXISTS genotype_id        VARCHAR(80);
ALTER TABLE fragments ADD COLUMN IF NOT EXISTS provenance_source  VARCHAR(120);
ALTER TABLE fragments ADD COLUMN IF NOT EXISTS thermal_tolerance_c NUMERIC(5,2);
ALTER TABLE fragments ADD COLUMN IF NOT EXISTS disease_resistance VARCHAR(40);

CREATE INDEX IF NOT EXISTS idx_fragments_parent     ON fragments (parent_frag_id);
CREATE INDEX IF NOT EXISTS idx_fragments_genotype   ON fragments (genotype_id);

-- ----------------------------------------------------------------
-- 2) Unified dive log model
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS dive_logs (
  id                  SERIAL PRIMARY KEY,
  dive_log_id         VARCHAR(50) UNIQUE,
  diver_id            VARCHAR(50),
  site_id             VARCHAR(50),
  dive_at             TIMESTAMPTZ,
  max_depth_m         NUMERIC(6,2),
  avg_depth_m         NUMERIC(6,2),
  bottom_time_min     INTEGER,
  sac_l_per_min       NUMERIC(6,2),     -- Surface Air Consumption
  gas_mix             VARCHAR(40),       -- e.g. "Air", "EAN32", "Trimix 18/45"
  start_pressure_bar  INTEGER,
  end_pressure_bar    INTEGER,
  water_temp_c        NUMERIC(5,2),
  visibility_m        NUMERIC(5,2),
  buddy               VARCHAR(150),
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_dive_logs_diver_dive
  ON dive_logs (diver_id, dive_at DESC);
CREATE INDEX IF NOT EXISTS idx_dive_logs_site_dive
  ON dive_logs (site_id, dive_at DESC);

-- ----------------------------------------------------------------
-- 3) Citizen-science portal
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS citizen_submissions (
  id                  SERIAL PRIMARY KEY,
  submission_id       VARCHAR(50) UNIQUE,
  submitter_name      VARCHAR(150),
  submitter_email     VARCHAR(200),
  site_id             VARCHAR(50),
  observed_at         TIMESTAMPTZ,
  observation_type    VARCHAR(60),       -- bleaching | disease | predation | fish_sighting | water_event | other
  species             VARCHAR(120),
  description         TEXT,
  photo_url           VARCHAR(500),
  latitude            NUMERIC(9,6),
  longitude           NUMERIC(9,6),
  moderation_status   VARCHAR(30) DEFAULT 'pending', -- pending | approved | rejected | needs_info
  moderator_notes     TEXT,
  reward_points       INTEGER DEFAULT 0,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_citizen_status_created
  ON citizen_submissions (moderation_status, created_at DESC);

-- ----------------------------------------------------------------
-- 4) NOAA Coral Reef Watch ingest log (populated only when fetch creds present)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS noaa_crw_ingests (
  id              SERIAL PRIMARY KEY,
  ingest_id       VARCHAR(50) UNIQUE,
  source          VARCHAR(60) DEFAULT 'NOAA Coral Reef Watch',
  dataset         VARCHAR(80),           -- e.g. sst | dhw | bleaching_alert
  region          VARCHAR(100),
  started_at      TIMESTAMPTZ DEFAULT NOW(),
  finished_at     TIMESTAMPTZ,
  status          VARCHAR(30) DEFAULT 'pending',  -- pending | ok | failed | skipped
  records         INTEGER DEFAULT 0,
  message         TEXT
);
CREATE INDEX IF NOT EXISTS idx_noaa_crw_started
  ON noaa_crw_ingests (started_at DESC);

-- AICoralReefRestorationTracker schema (18 domain tables + RBAC + cross-cutting)

-- ------------------------------------------------
-- Domain: Sites, Nurseries, Fragments, Outplants
-- ------------------------------------------------
CREATE TABLE IF NOT EXISTS reef_sites (
  id              SERIAL PRIMARY KEY,
  site_id         VARCHAR(50) UNIQUE,
  name            VARCHAR(200) NOT NULL,
  location        VARCHAR(200),
  depth_m         NUMERIC(6,2) DEFAULT 0,
  area_m2         NUMERIC(10,2) DEFAULT 0,
  status          VARCHAR(30) DEFAULT 'active',
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS nurseries (
  id              SERIAL PRIMARY KEY,
  nursery_id      VARCHAR(50) UNIQUE,
  site_id         VARCHAR(50),
  type            VARCHAR(40),       -- tree | table | line | land_based
  frags_count     INTEGER DEFAULT 0,
  established_at  DATE,
  status          VARCHAR(30) DEFAULT 'active',
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fragments (
  id              SERIAL PRIMARY KEY,
  frag_id         VARCHAR(50) UNIQUE,
  nursery_id      VARCHAR(50),
  species         VARCHAR(120),
  source_colony   VARCHAR(120),
  age_months      INTEGER DEFAULT 0,
  health_score    NUMERIC(4,1) DEFAULT 0,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS outplants (
  id              SERIAL PRIMARY KEY,
  outplant_id     VARCHAR(50) UNIQUE,
  site_id         VARCHAR(50),
  frag_id         VARCHAR(50),
  planted_at      DATE,
  survivor_status VARCHAR(30) DEFAULT 'alive',
  last_check      DATE,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------
-- Domain: Monitoring, Events, Quality, Counts
-- ------------------------------------------------
CREATE TABLE IF NOT EXISTS monitoring_visits (
  id              SERIAL PRIMARY KEY,
  visit_id        VARCHAR(50) UNIQUE,
  site_id         VARCHAR(50),
  lead_diver      VARCHAR(150),
  visit_at        TIMESTAMPTZ,
  conditions      VARCHAR(200),
  findings        TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bleaching_events (
  id              SERIAL PRIMARY KEY,
  event_id        VARCHAR(50) UNIQUE,
  site_id         VARCHAR(50),
  severity        VARCHAR(20) DEFAULT 'low',   -- low | medium | high | critical
  started_at      DATE,
  ended_at        DATE,
  bleached_pct    NUMERIC(5,2) DEFAULT 0,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS water_quality (
  id              SERIAL PRIMARY KEY,
  reading_id      VARCHAR(50) UNIQUE,
  site_id         VARCHAR(50),
  parameter       VARCHAR(60),       -- temperature | salinity | pH | turbidity | DO | nitrate
  value           NUMERIC(10,3),
  units           VARCHAR(20),
  ts              TIMESTAMPTZ,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fish_counts (
  id              SERIAL PRIMARY KEY,
  count_id        VARCHAR(50) UNIQUE,
  site_id         VARCHAR(50),
  species         VARCHAR(120),
  count           INTEGER DEFAULT 0,
  observer        VARCHAR(150),
  ts              TIMESTAMPTZ,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------
-- Domain: Operations, Crew, Logistics
-- ------------------------------------------------
CREATE TABLE IF NOT EXISTS divers (
  id              SERIAL PRIMARY KEY,
  diver_id        VARCHAR(50) UNIQUE,
  name            VARCHAR(150),
  certifications  VARCHAR(200),
  hours_total     INTEGER DEFAULT 0,
  last_dive       DATE,
  status          VARCHAR(30) DEFAULT 'active',
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS equipment (
  id              SERIAL PRIMARY KEY,
  eq_id           VARCHAR(50) UNIQUE,
  type            VARCHAR(60),
  sn              VARCHAR(120),
  location        VARCHAR(150),
  last_service    DATE,
  status          VARCHAR(30) DEFAULT 'available',
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS weather_logs (
  id              SERIAL PRIMARY KEY,
  log_id          VARCHAR(50) UNIQUE,
  site_id         VARCHAR(50),
  ts              TIMESTAMPTZ,
  sea_state       VARCHAR(30),
  visibility_m    NUMERIC(5,2),
  swell_m         NUMERIC(5,2),
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vessels (
  id              SERIAL PRIMARY KEY,
  vessel_id       VARCHAR(50) UNIQUE,
  name            VARCHAR(150),
  capacity        INTEGER DEFAULT 0,
  fuel_status     VARCHAR(30),
  location        VARCHAR(150),
  status          VARCHAR(30) DEFAULT 'docked',
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS propagation_runs (
  id              SERIAL PRIMARY KEY,
  run_id          VARCHAR(50) UNIQUE,
  nursery_id      VARCHAR(50),
  fragments_added INTEGER DEFAULT 0,
  success_pct     NUMERIC(5,2) DEFAULT 0,
  started_at      DATE,
  ended_at        DATE,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------
-- Domain: Partners, Grants, Publications, Training
-- ------------------------------------------------
CREATE TABLE IF NOT EXISTS partners (
  id              SERIAL PRIMARY KEY,
  partner_id      VARCHAR(50) UNIQUE,
  name            VARCHAR(200),
  type            VARCHAR(60),
  country         VARCHAR(80),
  contribution_usd BIGINT DEFAULT 0,
  status          VARCHAR(30) DEFAULT 'active',
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS grants (
  id              SERIAL PRIMARY KEY,
  grant_id        VARCHAR(50) UNIQUE,
  funder          VARCHAR(200),
  amount_usd      BIGINT DEFAULT 0,
  period          VARCHAR(60),
  status          VARCHAR(30) DEFAULT 'active',
  owner           VARCHAR(150),
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS publications (
  id              SERIAL PRIMARY KEY,
  pub_id          VARCHAR(50) UNIQUE,
  title           VARCHAR(400),
  authors         TEXT,
  journal         VARCHAR(200),
  year            INTEGER,
  status          VARCHAR(30) DEFAULT 'published',
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS training_sessions (
  id              SERIAL PRIMARY KEY,
  session_id      VARCHAR(50) UNIQUE,
  topic           VARCHAR(200),
  instructor      VARCHAR(150),
  attendees_count INTEGER DEFAULT 0,
  date            DATE,
  status          VARCHAR(30) DEFAULT 'planned',
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------
-- Domain: Governance
-- ------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_log (
  id              SERIAL PRIMARY KEY,
  entry_id        VARCHAR(50) UNIQUE,
  actor           VARCHAR(150),
  target          VARCHAR(200),
  action          VARCHAR(60),
  result          VARCHAR(30),
  ts              TIMESTAMPTZ,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------
-- RBAC
-- ------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id              SERIAL PRIMARY KEY,
  email           VARCHAR(150) UNIQUE NOT NULL,
  password        VARCHAR(120) NOT NULL,
  name            VARCHAR(120),
  role            VARCHAR(20) DEFAULT 'viewer',  -- admin | scientist | viewer
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------
-- Notifications
-- ------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
  id              SERIAL PRIMARY KEY,
  user_id         INTEGER,
  title           VARCHAR(200),
  body            TEXT,
  severity        VARCHAR(20) DEFAULT 'info',
  source          VARCHAR(80),
  read_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
  ON notifications (user_id, read_at);

-- ------------------------------------------------
-- Attachments
-- ------------------------------------------------
CREATE TABLE IF NOT EXISTS attachments (
  id              SERIAL PRIMARY KEY,
  resource_type   VARCHAR(60),
  resource_id     INTEGER,
  filename        VARCHAR(255),
  original_name   VARCHAR(255),
  mimetype        VARCHAR(120),
  size_bytes      INTEGER,
  uploaded_by     VARCHAR(150),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_attachments_resource
  ON attachments (resource_type, resource_id);

-- ------------------------------------------------
-- Webhooks
-- ------------------------------------------------
CREATE TABLE IF NOT EXISTS webhooks (
  id              SERIAL PRIMARY KEY,
  name            VARCHAR(120),
  url             VARCHAR(500),
  secret          VARCHAR(120),
  events          TEXT,
  active          BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS webhook_deliveries (
  id              SERIAL PRIMARY KEY,
  webhook_id      INTEGER,
  event           VARCHAR(120),
  payload         JSONB,
  status_code     INTEGER,
  response_body   TEXT,
  attempted_at    TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_webhook
  ON webhook_deliveries (webhook_id, attempted_at DESC);

-- ------------------------------------------------
-- AI history
-- ------------------------------------------------
CREATE TABLE IF NOT EXISTS ai_results (
  id              SERIAL PRIMARY KEY,
  feature         VARCHAR(80) NOT NULL,
  input           JSONB,
  output          JSONB,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ai_results_feature_created
  ON ai_results (feature, created_at DESC);

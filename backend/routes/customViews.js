// Custom Views: 4 analytics endpoints for Reef Analytics page.
// All four return aggregated/enriched data already shaped for the
// respective frontend visualizations (map / area / multi-line / treemap).

const express = require('express');
const pool = require('../config/database');

const router = express.Router();

// Tropical-reef coordinates seeded for each well-known site_id from seed.js.
// Used as fallback when reef_sites.lat/lng have not been backfilled.
const SITE_COORDS = {
  'SITE-001': { lat: 24.5471, lng: -81.4045 }, // Looe Key, Florida Keys
  'SITE-002': { lat: 25.2206, lng: -80.2127 }, // Carysfort Reef
  'SITE-003': { lat: 17.7900, lng: -64.6200 }, // Buck Island, USVI
  'SITE-004': { lat: 16.7370, lng: -87.8090 }, // Glover's Atoll, Belize
  'SITE-005': { lat: 17.7800, lng: -64.8980 }, // Cane Bay, St. Croix
  'SITE-006': { lat: 16.2960, lng: -86.5760 }, // Roatan West Bay
  'SITE-007': { lat: 12.1500, lng: -68.2700 }, // Bonaire Salt Pier
  'SITE-008': {  lat: -8.5400, lng: 119.4830 }, // Komodo Pink Beach
  'SITE-009': { lat: -23.4423, lng: 151.9148 }, // Heron Island, GBR
  'SITE-010': { lat: -14.6680, lng: 145.4500 }, // Lizard Island, GBR
  'SITE-011': { lat:  -9.4170, lng:  46.4000 }, // Aldabra Atoll
  'SITE-012': { lat:   5.2200, lng:  73.0700 }, // Maldives Baa Atoll
  'SITE-013': { lat:  -7.9000, lng:  39.7000 }, // Mafia Island, Tanzania
  'SITE-014': { lat:  12.6700, lng: 120.4500 }, // Apo Reef, Philippines
  'SITE-015': { lat:  -0.2350, lng: 130.0240 }, // Raja Ampat Wayag
};

// Ensure reef_sites has lat/lng columns and seed them where empty.
async function ensureSiteCoords() {
  try {
    await pool.query(
      `ALTER TABLE reef_sites
         ADD COLUMN IF NOT EXISTS lat NUMERIC(9,5),
         ADD COLUMN IF NOT EXISTS lng NUMERIC(9,5)`
    );
    for (const [siteId, c] of Object.entries(SITE_COORDS)) {
      await pool.query(
        `UPDATE reef_sites
            SET lat = COALESCE(lat, $2), lng = COALESCE(lng, $3)
          WHERE site_id = $1`,
        [siteId, c.lat, c.lng]
      );
    }
  } catch (e) {
    console.warn('[customViews] ensureSiteCoords:', e.message);
  }
}
// Fire once at load.
ensureSiteCoords();

// --------------------------------------------------------------
// 1) Reef Sites Map — sites + most-recent bleaching severity
// --------------------------------------------------------------
router.get('/reef-map', async (req, res) => {
  try {
    await ensureSiteCoords();
    const r = await pool.query(`
      SELECT
        s.site_id,
        s.name,
        s.location,
        s.depth_m,
        s.area_m2,
        s.status,
        s.lat,
        s.lng,
        be.severity     AS bleaching_severity,
        be.bleached_pct AS bleached_pct,
        be.started_at   AS bleaching_started_at
      FROM reef_sites s
      LEFT JOIN LATERAL (
        SELECT severity, bleached_pct, started_at
          FROM bleaching_events b
         WHERE b.site_id = s.site_id
         ORDER BY started_at DESC NULLS LAST
         LIMIT 1
      ) be ON TRUE
      ORDER BY s.id ASC
    `);
    const rows = r.rows.map((row) => {
      const fallback = SITE_COORDS[row.site_id];
      return {
        ...row,
        lat: row.lat != null ? Number(row.lat) : (fallback ? fallback.lat : null),
        lng: row.lng != null ? Number(row.lng) : (fallback ? fallback.lng : null),
        bleached_pct: row.bleached_pct != null ? Number(row.bleached_pct) : 0,
        bleaching_severity: row.bleaching_severity || 'none',
      };
    }).filter((row) => row.lat != null && row.lng != null);
    res.json({ count: rows.length, sites: rows });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --------------------------------------------------------------
// 2) Fragment Survival Timeline — outplants survival% by month
// --------------------------------------------------------------
router.get('/survival-timeline', async (req, res) => {
  try {
    const r = await pool.query(`
      SELECT
        to_char(date_trunc('month', planted_at), 'YYYY-MM')               AS month,
        COUNT(*)                                                          AS total,
        SUM(CASE WHEN LOWER(survivor_status) = 'alive'   THEN 1 ELSE 0 END) AS alive,
        SUM(CASE WHEN LOWER(survivor_status) = 'partial' THEN 1 ELSE 0 END) AS partial,
        SUM(CASE WHEN LOWER(survivor_status) = 'dead'    THEN 1 ELSE 0 END) AS dead
      FROM outplants
      WHERE planted_at IS NOT NULL
      GROUP BY 1
      ORDER BY 1 ASC
    `);
    const series = r.rows.map((row) => {
      const total = Number(row.total) || 0;
      const alive = Number(row.alive) || 0;
      const partial = Number(row.partial) || 0;
      const dead = Number(row.dead) || 0;
      const survivalPct = total > 0 ? Math.round(((alive + partial * 0.5) / total) * 1000) / 10 : 0;
      return {
        month: row.month,
        total,
        alive,
        partial,
        dead,
        survival_pct: survivalPct,
      };
    });
    res.json({ count: series.length, series });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --------------------------------------------------------------
// 3) Water Quality Multi-line — temperature / pH / turbidity
// --------------------------------------------------------------
router.get('/water-quality-series', async (req, res) => {
  try {
    const params = ['temperature', 'pH', 'turbidity'];
    const r = await pool.query(`
      SELECT
        to_char(ts, 'YYYY-MM-DD HH24:MI') AS ts,
        parameter,
        AVG(value)::float                  AS value
      FROM water_quality
      WHERE LOWER(parameter) = ANY($1::text[])
        AND ts IS NOT NULL
      GROUP BY ts, parameter
      ORDER BY ts ASC
    `, [params.map((p) => p.toLowerCase())]);

    // Pivot into rows: { ts, temperature, pH, turbidity }
    const map = new Map();
    for (const row of r.rows) {
      const key = row.ts;
      if (!map.has(key)) map.set(key, { ts: key });
      const bucket = map.get(key);
      const paramKey = String(row.parameter).toLowerCase() === 'ph'
        ? 'pH'
        : String(row.parameter).toLowerCase();
      bucket[paramKey] = Number(row.value);
    }
    const series = Array.from(map.values()).sort((a, b) => a.ts.localeCompare(b.ts));
    res.json({ count: series.length, params, series });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --------------------------------------------------------------
// 4) Bleaching Severity Treemap — by site, area=bleached_pct
// --------------------------------------------------------------
router.get('/bleaching-treemap', async (req, res) => {
  try {
    const r = await pool.query(`
      SELECT
        b.site_id,
        s.name                            AS site_name,
        s.location                        AS site_location,
        COUNT(*)                          AS events,
        COALESCE(SUM(b.bleached_pct), 0)::float AS total_bleached_pct,
        COALESCE(AVG(b.bleached_pct), 0)::float AS avg_bleached_pct,
        MAX(b.severity)                   AS worst_severity
      FROM bleaching_events b
      LEFT JOIN reef_sites s ON s.site_id = b.site_id
      GROUP BY b.site_id, s.name, s.location
      ORDER BY total_bleached_pct DESC
    `);
    const items = r.rows.map((row) => ({
      site_id: row.site_id,
      name: `${row.site_id} - ${row.site_name || 'Unknown'}`,
      location: row.site_location || '',
      events: Number(row.events),
      size: Math.max(1, Math.round(Number(row.total_bleached_pct) * 10) / 10),
      avg_bleached_pct: Math.round(Number(row.avg_bleached_pct) * 10) / 10,
      severity: row.worst_severity || 'low',
    }));
    res.json({ count: items.length, items });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --------------------------------------------------------------
// 5) Dive Log Timeline — 20 most recent monitoring_visits + site
// --------------------------------------------------------------
router.get('/dive-log', async (req, res) => {
  try {
    const r = await pool.query(`
      SELECT
        mv.visit_id,
        mv.site_id,
        COALESCE(s.name, mv.site_id) AS site_name,
        mv.lead_diver,
        mv.visit_at,
        mv.conditions,
        mv.findings
      FROM monitoring_visits mv
      LEFT JOIN reef_sites s ON s.site_id = mv.site_id
      WHERE mv.visit_at IS NOT NULL
      ORDER BY mv.visit_at DESC NULLS LAST
      LIMIT 20
    `);
    res.json(r.rows.map((row) => ({
      visit_id: row.visit_id,
      site_id: row.site_id,
      site_name: row.site_name,
      lead_diver: row.lead_diver,
      visit_at: row.visit_at,
      conditions: row.conditions,
      findings: row.findings,
    })));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --------------------------------------------------------------
// 6) Fragment Survival Heatmap — sites x last-12-months survival%
// --------------------------------------------------------------
router.get('/fragment-survival-heatmap', async (req, res) => {
  try {
    // Build month buckets: last 12 months ending at current month.
    const now = new Date();
    const months = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
      const ym = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
      months.push(ym);
    }
    const earliest = months[0] + '-01';

    // Top 15 reef sites by id order (stable, matches seed of 15 known sites).
    const sitesRes = await pool.query(`
      SELECT site_id, name
        FROM reef_sites
       ORDER BY id ASC
       LIMIT 15
    `);
    const sites = sitesRes.rows.map((r) => ({ site_id: r.site_id, name: r.name }));

    // Outplants grouped by site + planted month, with survival pct
    // (alive + 0.5 partial) / total * 100. Only consider planted_at in window.
    const aggRes = await pool.query(`
      SELECT
        site_id,
        to_char(date_trunc('month', planted_at), 'YYYY-MM')                   AS month,
        COUNT(*)                                                              AS total,
        SUM(CASE WHEN LOWER(survivor_status) = 'alive'   THEN 1 ELSE 0 END)   AS alive,
        SUM(CASE WHEN LOWER(survivor_status) = 'partial' THEN 1 ELSE 0 END)   AS partial
      FROM outplants
      WHERE planted_at IS NOT NULL
        AND planted_at >= $1::date
      GROUP BY site_id, 2
    `, [earliest]);

    // Index by "site|month" -> pct
    const idx = new Map();
    for (const row of aggRes.rows) {
      const total   = Number(row.total)   || 0;
      const alive   = Number(row.alive)   || 0;
      const partial = Number(row.partial) || 0;
      const pct = total > 0
        ? Math.round(((alive + partial * 0.5) / total) * 1000) / 10
        : null;
      idx.set(`${row.site_id}|${row.month}`, pct);
    }

    const data = sites.map((s) => months.map((m) => {
      const v = idx.get(`${s.site_id}|${m}`);
      return (v == null) ? null : v;
    }));

    res.json({
      sites: sites.map((s) => ({ site_id: s.site_id, name: s.name })),
      months,
      data,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;

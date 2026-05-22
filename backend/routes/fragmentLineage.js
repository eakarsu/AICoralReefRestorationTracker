// Apply pass 7 — Fragment lineage graph + genotype provenance read endpoints.
//
// Lineage uses recursive CTEs on fragments.parent_frag_id. Genotype provenance
// columns (genotype_id, provenance_source, thermal_tolerance_c, disease_resistance)
// were added by migration 002.

const express = require('express');
const pool = require('../config/database');

const router = express.Router();

// GET /api/fragment-lineage/:frag_id
// Returns: { fragment, ancestors[], descendants[], siblings[], genotype_cohort[] }
router.get('/:frag_id', async (req, res) => {
  try {
    const { frag_id } = req.params;
    const f = await pool.query('SELECT * FROM fragments WHERE frag_id = $1 LIMIT 1', [frag_id]);
    if (!f.rows.length) return res.status(404).json({ error: `fragment not found: ${frag_id}` });
    const fragment = f.rows[0];

    // Ancestors — walk up parent_frag_id chain
    const ancestors = await pool.query(
      `WITH RECURSIVE up(frag_id, parent_frag_id, species, genotype_id, depth) AS (
         SELECT frag_id, parent_frag_id, species, genotype_id, 0
         FROM fragments WHERE frag_id = $1
         UNION ALL
         SELECT f.frag_id, f.parent_frag_id, f.species, f.genotype_id, up.depth + 1
         FROM fragments f
         JOIN up ON f.frag_id = up.parent_frag_id
         WHERE up.depth < 20
       )
       SELECT * FROM up WHERE depth > 0 ORDER BY depth ASC`,
      [frag_id]
    );

    // Descendants — walk down parent_frag_id chain
    const descendants = await pool.query(
      `WITH RECURSIVE down(frag_id, parent_frag_id, species, genotype_id, depth) AS (
         SELECT frag_id, parent_frag_id, species, genotype_id, 0
         FROM fragments WHERE frag_id = $1
         UNION ALL
         SELECT f.frag_id, f.parent_frag_id, f.species, f.genotype_id, down.depth + 1
         FROM fragments f
         JOIN down ON f.parent_frag_id = down.frag_id
         WHERE down.depth < 20
       )
       SELECT * FROM down WHERE depth > 0 ORDER BY depth ASC, frag_id ASC`,
      [frag_id]
    );

    // Siblings — same parent_frag_id (excluding self), only when fragment has a parent
    let siblings = [];
    if (fragment.parent_frag_id) {
      const s = await pool.query(
        'SELECT * FROM fragments WHERE parent_frag_id = $1 AND frag_id <> $2 ORDER BY id ASC',
        [fragment.parent_frag_id, frag_id]
      );
      siblings = s.rows;
    }

    // Genotype cohort — fragments sharing same genotype_id
    let cohort = [];
    if (fragment.genotype_id) {
      const c = await pool.query(
        'SELECT * FROM fragments WHERE genotype_id = $1 AND frag_id <> $2 ORDER BY id ASC',
        [fragment.genotype_id, frag_id]
      );
      cohort = c.rows;
    }

    res.json({
      fragment,
      ancestors: ancestors.rows,
      descendants: descendants.rows,
      siblings,
      genotype_cohort: cohort,
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/fragment-lineage/genotype/:genotype_id
// List every fragment + provenance for a given genotype.
router.get('/genotype/:genotype_id', async (req, res) => {
  try {
    const r = await pool.query(
      'SELECT * FROM fragments WHERE genotype_id = $1 ORDER BY id ASC',
      [req.params.genotype_id]
    );
    res.json({
      genotype_id: req.params.genotype_id,
      count: r.rows.length,
      fragments: r.rows,
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;

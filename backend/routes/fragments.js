const buildCrud = require('./_crudFactory');

// Apply pass 7 — provenance columns: parent_frag_id, genotype_id,
// provenance_source, thermal_tolerance_c, disease_resistance.
module.exports = buildCrud({
  table: 'fragments',
  fields: [
    'frag_id',
    'nursery_id',
    'species',
    'source_colony',
    'age_months',
    'health_score',
    'notes',
    'parent_frag_id',
    'genotype_id',
    'provenance_source',
    'thermal_tolerance_c',
    'disease_resistance',
  ],
});

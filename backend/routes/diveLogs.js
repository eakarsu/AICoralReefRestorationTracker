// Apply pass 7 — Unified dive-log model (depth, bottom time, SAC, gas).
const buildCrud = require('./_crudFactory');

module.exports = buildCrud({
  table: 'dive_logs',
  fields: [
    'dive_log_id',
    'diver_id',
    'site_id',
    'dive_at',
    'max_depth_m',
    'avg_depth_m',
    'bottom_time_min',
    'sac_l_per_min',
    'gas_mix',
    'start_pressure_bar',
    'end_pressure_bar',
    'water_temp_c',
    'visibility_m',
    'buddy',
    'notes',
  ],
});

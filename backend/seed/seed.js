const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'coral_restoration',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

async function run() {
  const client = await pool.connect();
  try {
    console.log('[seed] resetting tables...');
    await client.query(`
      DROP TABLE IF EXISTS reef_sites         CASCADE;
      DROP TABLE IF EXISTS nurseries          CASCADE;
      DROP TABLE IF EXISTS fragments          CASCADE;
      DROP TABLE IF EXISTS outplants          CASCADE;
      DROP TABLE IF EXISTS monitoring_visits  CASCADE;
      DROP TABLE IF EXISTS bleaching_events   CASCADE;
      DROP TABLE IF EXISTS water_quality      CASCADE;
      DROP TABLE IF EXISTS fish_counts        CASCADE;
      DROP TABLE IF EXISTS divers             CASCADE;
      DROP TABLE IF EXISTS equipment          CASCADE;
      DROP TABLE IF EXISTS weather_logs       CASCADE;
      DROP TABLE IF EXISTS partners           CASCADE;
      DROP TABLE IF EXISTS grants             CASCADE;
      DROP TABLE IF EXISTS publications       CASCADE;
      DROP TABLE IF EXISTS training_sessions  CASCADE;
      DROP TABLE IF EXISTS vessels            CASCADE;
      DROP TABLE IF EXISTS propagation_runs   CASCADE;
      DROP TABLE IF EXISTS audit_log          CASCADE;

      DROP TABLE IF EXISTS users              CASCADE;
      DROP TABLE IF EXISTS notifications      CASCADE;
      DROP TABLE IF EXISTS attachments        CASCADE;
      DROP TABLE IF EXISTS webhooks           CASCADE;
      DROP TABLE IF EXISTS webhook_deliveries CASCADE;
      DROP TABLE IF EXISTS ai_results         CASCADE;
    `);

    console.log('[seed] applying migrations...');
    const schema = fs.readFileSync(path.join(__dirname, '..', 'migrations', '001_schema.sql'), 'utf8');
    await client.query(schema);

    console.log('[seed] inserting reef_sites...');
    const sites = [
      ['SITE-001', 'Looe Key Sanctuary',           'Florida Keys, USA',         8.5,  4200, 'active'],
      ['SITE-002', 'Carysfort Reef',               'Florida Keys, USA',         7.2,  3800, 'active'],
      ['SITE-003', 'Buck Island Patch',            'USVI',                      9.0,  2100, 'monitored'],
      ['SITE-004', "Glover's Atoll East",          'Belize',                   12.4,  5300, 'active'],
      ['SITE-005', 'Cane Bay Wall',                'St. Croix, USVI',          14.0,  1750, 'restricted'],
      ['SITE-006', 'Roatan West Bay',              'Honduras',                  6.8,  3400, 'active'],
      ['SITE-007', 'Bonaire Salt Pier',            'Bonaire',                  11.5,  1200, 'active'],
      ['SITE-008', 'Komodo Pink Beach',            'Indonesia',                10.2,  4900, 'active'],
      ['SITE-009', 'Heron Island Bommies',         'GBR, Australia',            8.0,  6800, 'monitored'],
      ['SITE-010', 'Lizard Island Lagoon',         'GBR, Australia',            5.4,  3300, 'active'],
      ['SITE-011', 'Aldabra Lagoon',               'Seychelles',                7.8,  5600, 'active'],
      ['SITE-012', 'Maldives Baa Atoll',           'Maldives',                 13.2,  4100, 'active'],
      ['SITE-013', 'Mafia Island Channel',         'Tanzania',                  9.5,  2700, 'monitored'],
      ['SITE-014', 'Apo Reef Marine Park',         'Philippines',              11.0,  6200, 'active'],
      ['SITE-015', 'Raja Ampat Wayag',             'Indonesia',                 8.7,  5800, 'active'],
    ];
    for (const r of sites) {
      await client.query(
        'INSERT INTO reef_sites (site_id,name,location,depth_m,area_m2,status) VALUES ($1,$2,$3,$4,$5,$6)', r);
    }

    console.log('[seed] inserting nurseries...');
    const nurseries = [
      ['NUR-001', 'SITE-001', 'tree',        420, '2024-04-12', 'active'],
      ['NUR-002', 'SITE-001', 'table',       180, '2024-06-20', 'active'],
      ['NUR-003', 'SITE-002', 'tree',        350, '2024-03-08', 'active'],
      ['NUR-004', 'SITE-003', 'line',        260, '2025-01-15', 'monitored'],
      ['NUR-005', 'SITE-004', 'tree',        510, '2024-09-09', 'active'],
      ['NUR-006', 'SITE-006', 'land_based',  220, '2024-11-30', 'active'],
      ['NUR-007', 'SITE-007', 'table',       310, '2024-10-12', 'active'],
      ['NUR-008', 'SITE-008', 'tree',        480, '2024-05-22', 'active'],
      ['NUR-009', 'SITE-009', 'table',       400, '2025-02-04', 'active'],
      ['NUR-010', 'SITE-010', 'line',        290, '2024-12-18', 'active'],
      ['NUR-011', 'SITE-011', 'tree',        360, '2024-08-25', 'monitored'],
      ['NUR-012', 'SITE-012', 'land_based',  240, '2025-03-11', 'active'],
      ['NUR-013', 'SITE-013', 'tree',        310, '2024-07-30', 'inactive'],
      ['NUR-014', 'SITE-014', 'table',       450, '2024-09-29', 'active'],
      ['NUR-015', 'SITE-015', 'tree',        520, '2025-04-02', 'active'],
    ];
    for (const r of nurseries) {
      await client.query(
        'INSERT INTO nurseries (nursery_id,site_id,type,frags_count,established_at,status) VALUES ($1,$2,$3,$4,$5,$6)', r);
    }

    console.log('[seed] inserting fragments...');
    const fragments = [
      ['FRG-0001', 'NUR-001', 'Acropora cervicornis',  'COL-A12',  14, 8.4],
      ['FRG-0002', 'NUR-001', 'Acropora palmata',      'COL-A15',   9, 7.9],
      ['FRG-0003', 'NUR-002', 'Orbicella faveolata',   'COL-O02',  12, 8.7],
      ['FRG-0004', 'NUR-003', 'Acropora cervicornis',  'COL-A18',   8, 7.5],
      ['FRG-0005', 'NUR-005', 'Acropora muricata',     'COL-A30',  18, 9.1],
      ['FRG-0006', 'NUR-005', 'Pocillopora damicornis','COL-P09',  10, 8.2],
      ['FRG-0007', 'NUR-006', 'Acropora palmata',      'COL-A20',   6, 6.8],
      ['FRG-0008', 'NUR-007', 'Diploria labyrinthiformis','COL-D03',13, 8.5],
      ['FRG-0009', 'NUR-008', 'Acropora florida',      'COL-A45',  15, 8.9],
      ['FRG-0010', 'NUR-009', 'Acropora tenuis',       'COL-A50',  11, 8.0],
      ['FRG-0011', 'NUR-010', 'Pocillopora verrucosa', 'COL-P22',   7, 7.4],
      ['FRG-0012', 'NUR-011', 'Acropora hyacinthus',   'COL-A60',  16, 9.2],
      ['FRG-0013', 'NUR-012', 'Pavona cactus',         'COL-PV1',   4, 6.5],
      ['FRG-0014', 'NUR-014', 'Acropora digitifera',   'COL-A70',  12, 8.3],
      ['FRG-0015', 'NUR-015', 'Acropora millepora',    'COL-A80',  17, 9.0],
    ];
    for (const r of fragments) {
      await client.query(
        'INSERT INTO fragments (frag_id,nursery_id,species,source_colony,age_months,health_score) VALUES ($1,$2,$3,$4,$5,$6)', r);
    }

    console.log('[seed] inserting outplants...');
    const outplants = [
      ['OUT-0001', 'SITE-001', 'FRG-0001', '2025-08-12', 'alive',  '2026-04-15'],
      ['OUT-0002', 'SITE-001', 'FRG-0002', '2025-09-05', 'alive',  '2026-04-15'],
      ['OUT-0003', 'SITE-002', 'FRG-0004', '2025-10-22', 'partial','2026-03-20'],
      ['OUT-0004', 'SITE-003', 'FRG-0003', '2025-07-18', 'alive',  '2026-04-02'],
      ['OUT-0005', 'SITE-004', 'FRG-0005', '2025-06-30', 'alive',  '2026-05-08'],
      ['OUT-0006', 'SITE-004', 'FRG-0006', '2025-11-11', 'dead',   '2026-04-22'],
      ['OUT-0007', 'SITE-006', 'FRG-0007', '2025-12-01', 'alive',  '2026-05-01'],
      ['OUT-0008', 'SITE-007', 'FRG-0008', '2026-01-09', 'alive',  '2026-05-05'],
      ['OUT-0009', 'SITE-008', 'FRG-0009', '2025-09-29', 'alive',  '2026-05-09'],
      ['OUT-0010', 'SITE-009', 'FRG-0010', '2025-12-19', 'alive',  '2026-04-30'],
      ['OUT-0011', 'SITE-010', 'FRG-0011', '2025-10-08', 'partial','2026-05-02'],
      ['OUT-0012', 'SITE-011', 'FRG-0012', '2025-07-22', 'alive',  '2026-04-12'],
      ['OUT-0013', 'SITE-012', 'FRG-0013', '2025-08-16', 'dead',   '2026-04-19'],
      ['OUT-0014', 'SITE-014', 'FRG-0014', '2026-02-04', 'alive',  '2026-05-10'],
      ['OUT-0015', 'SITE-015', 'FRG-0015', '2026-03-01', 'alive',  '2026-05-12'],
    ];
    for (const r of outplants) {
      await client.query(
        'INSERT INTO outplants (outplant_id,site_id,frag_id,planted_at,survivor_status,last_check) VALUES ($1,$2,$3,$4,$5,$6)', r);
    }

    console.log('[seed] inserting monitoring_visits...');
    const visits = [
      ['MON-0001', 'SITE-001', 'Dr. Maya Hernandez',  '2026-05-12 09:00+00', 'clear, 28C',         'Acropora outplants 95% alive; minor algae overgrowth at Frame 4.'],
      ['MON-0002', 'SITE-002', 'Tomas Reyes',         '2026-05-13 10:30+00', 'cloudy, 27C',        'Partial bleaching observed on three colonies.'],
      ['MON-0003', 'SITE-003', 'Dr. Aiko Tanaka',     '2026-05-14 08:15+00', 'choppy, 26C',        'Predation by Coralliophila snails; collected 42 individuals.'],
      ['MON-0004', 'SITE-004', 'Carlos Mendez',       '2026-05-08 09:45+00', 'clear, 29C',         'New growth at NUR-005; outplants thriving.'],
      ['MON-0005', 'SITE-005', 'Dr. Imani Okafor',    '2026-05-15 11:00+00', 'rough, 27C',         'Site access limited by swell; no in-water survey.'],
      ['MON-0006', 'SITE-006', 'Lia Hernandez',       '2026-05-11 10:00+00', 'clear, 28C',         'Land-based nursery production at 92% target.'],
      ['MON-0007', 'SITE-007', 'Jeroen Smit',         '2026-05-09 09:30+00', 'clear, 28C',         'Healthy fish counts; outplant survival 90%.'],
      ['MON-0008', 'SITE-008', 'Putu Wirawan',        '2026-05-07 08:00+00', 'clear, 30C',         'Thermal stress likely; recommend deploying shading.'],
      ['MON-0009', 'SITE-009', 'Dr. Sarah Bennet',    '2026-05-06 09:15+00', 'clear, 28C',         'Reef monitoring stations re-baselined.'],
      ['MON-0010', 'SITE-010', 'Owen Brooks',         '2026-05-10 10:00+00', 'overcast, 27C',      'Crown-of-thorns starfish observed (4 individuals).'],
      ['MON-0011', 'SITE-011', 'Sasha Ramos',         '2026-05-12 09:30+00', 'clear, 27C',         'Bleaching score 1.4 / 5.0.'],
      ['MON-0012', 'SITE-012', 'Dr. Hassan Faraj',    '2026-05-13 10:00+00', 'clear, 29C',         'Outplant survivorship strong; deploy more next quarter.'],
      ['MON-0013', 'SITE-013', 'Amani Mwakio',        '2026-05-14 09:00+00', 'silty, 27C',         'High turbidity from monsoon runoff.'],
      ['MON-0014', 'SITE-014', 'Dr. Mei Lin',         '2026-05-15 08:30+00', 'clear, 28C',         'Recruitment plots show new spat at 3.2/m2.'],
      ['MON-0015', 'SITE-015', 'Ravi Patel',          '2026-05-16 09:00+00', 'clear, 28C',         'Outplants healthy; coral predator survey clean.'],
    ];
    for (const r of visits) {
      await client.query(
        'INSERT INTO monitoring_visits (visit_id,site_id,lead_diver,visit_at,conditions,findings) VALUES ($1,$2,$3,$4,$5,$6)', r);
    }

    console.log('[seed] inserting bleaching_events...');
    const bleach = [
      ['BLE-0001', 'SITE-001', 'medium',   '2025-08-12', '2025-09-08', 22.5],
      ['BLE-0002', 'SITE-002', 'high',     '2025-09-01', '2025-10-20', 41.0],
      ['BLE-0003', 'SITE-004', 'low',      '2025-09-10', '2025-09-28',  9.0],
      ['BLE-0004', 'SITE-005', 'critical', '2025-10-04', '2025-12-02', 68.5],
      ['BLE-0005', 'SITE-008', 'high',     '2025-11-15', '2026-01-10', 51.2],
      ['BLE-0006', 'SITE-009', 'low',      '2026-01-09', '2026-01-30', 11.8],
      ['BLE-0007', 'SITE-010', 'medium',   '2026-02-04', '2026-03-01', 26.4],
      ['BLE-0008', 'SITE-011', 'low',      '2026-02-22', '2026-03-12',  7.5],
      ['BLE-0009', 'SITE-012', 'high',     '2026-03-08', '2026-04-15', 47.0],
      ['BLE-0010', 'SITE-013', 'medium',   '2026-01-19', '2026-02-25', 21.0],
      ['BLE-0011', 'SITE-014', 'low',      '2026-03-30', '2026-04-18',  8.2],
      ['BLE-0012', 'SITE-015', 'critical', '2026-04-10', null,         59.0],
      ['BLE-0013', 'SITE-006', 'medium',   '2026-02-12', '2026-03-08', 19.6],
      ['BLE-0014', 'SITE-007', 'low',      '2026-03-22', '2026-04-09',  6.4],
      ['BLE-0015', 'SITE-003', 'high',     '2025-12-04', '2026-01-22', 38.7],
    ];
    for (const r of bleach) {
      await client.query(
        'INSERT INTO bleaching_events (event_id,site_id,severity,started_at,ended_at,bleached_pct) VALUES ($1,$2,$3,$4,$5,$6)', r);
    }

    console.log('[seed] inserting water_quality...');
    const wq = [
      ['WQ-0001', 'SITE-001', 'temperature', 29.4, 'C',     '2026-05-12 09:00+00'],
      ['WQ-0002', 'SITE-001', 'salinity',    35.2, 'PSU',   '2026-05-12 09:05+00'],
      ['WQ-0003', 'SITE-002', 'temperature', 30.1, 'C',     '2026-05-13 10:30+00'],
      ['WQ-0004', 'SITE-002', 'pH',           8.06,'',      '2026-05-13 10:32+00'],
      ['WQ-0005', 'SITE-004', 'turbidity',    1.2, 'NTU',   '2026-05-08 09:50+00'],
      ['WQ-0006', 'SITE-005', 'DO',           5.8, 'mg/L',  '2026-05-15 11:10+00'],
      ['WQ-0007', 'SITE-008', 'temperature', 30.8, 'C',     '2026-05-07 08:00+00'],
      ['WQ-0008', 'SITE-008', 'pH',           7.98,'',      '2026-05-07 08:03+00'],
      ['WQ-0009', 'SITE-009', 'nitrate',      0.4, 'mg/L',  '2026-05-06 09:20+00'],
      ['WQ-0010', 'SITE-010', 'temperature', 29.6, 'C',     '2026-05-10 10:05+00'],
      ['WQ-0011', 'SITE-011', 'salinity',    35.1, 'PSU',   '2026-05-12 09:35+00'],
      ['WQ-0012', 'SITE-012', 'turbidity',    1.6, 'NTU',   '2026-05-13 10:05+00'],
      ['WQ-0013', 'SITE-013', 'turbidity',    6.4, 'NTU',   '2026-05-14 09:10+00'],
      ['WQ-0014', 'SITE-014', 'temperature', 29.1, 'C',     '2026-05-15 08:35+00'],
      ['WQ-0015', 'SITE-015', 'pH',           8.10,'',      '2026-05-16 09:05+00'],
    ];
    for (const r of wq) {
      await client.query(
        'INSERT INTO water_quality (reading_id,site_id,parameter,value,units,ts) VALUES ($1,$2,$3,$4,$5,$6)', r);
    }

    console.log('[seed] inserting fish_counts...');
    const fish = [
      ['FSH-0001', 'SITE-001', 'Scarus iseri',           88, 'Maya Hernandez',  '2026-05-12 09:30+00'],
      ['FSH-0002', 'SITE-001', 'Acanthurus coeruleus',   62, 'Maya Hernandez',  '2026-05-12 09:35+00'],
      ['FSH-0003', 'SITE-002', 'Lutjanus apodus',        24, 'Tomas Reyes',     '2026-05-13 10:50+00'],
      ['FSH-0004', 'SITE-003', 'Chaetodon capistratus',  31, 'Aiko Tanaka',     '2026-05-14 08:40+00'],
      ['FSH-0005', 'SITE-004', 'Stegastes diencaeus',    76, 'Carlos Mendez',   '2026-05-08 10:00+00'],
      ['FSH-0006', 'SITE-006', 'Sparisoma viride',       45, 'Lia Hernandez',   '2026-05-11 10:20+00'],
      ['FSH-0007', 'SITE-007', 'Acanthurus chirurgus',   28, 'Jeroen Smit',     '2026-05-09 10:00+00'],
      ['FSH-0008', 'SITE-008', 'Chaetodon kleinii',      55, 'Putu Wirawan',    '2026-05-07 08:30+00'],
      ['FSH-0009', 'SITE-009', 'Plectropomus leopardus', 12, 'Sarah Bennet',    '2026-05-06 09:40+00'],
      ['FSH-0010', 'SITE-010', 'Naso unicornis',         18, 'Owen Brooks',     '2026-05-10 10:30+00'],
      ['FSH-0011', 'SITE-011', 'Cephalopholis argus',    22, 'Sasha Ramos',     '2026-05-12 09:55+00'],
      ['FSH-0012', 'SITE-012', 'Chromis viridis',       180, 'Hassan Faraj',    '2026-05-13 10:30+00'],
      ['FSH-0013', 'SITE-013', 'Lethrinus harak',        14, 'Amani Mwakio',    '2026-05-14 09:30+00'],
      ['FSH-0014', 'SITE-014', 'Caesio cuning',         210, 'Mei Lin',         '2026-05-15 09:00+00'],
      ['FSH-0015', 'SITE-015', 'Pterocaesio tile',      164, 'Ravi Patel',      '2026-05-16 09:30+00'],
    ];
    for (const r of fish) {
      await client.query(
        'INSERT INTO fish_counts (count_id,site_id,species,count,observer,ts) VALUES ($1,$2,$3,$4,$5,$6)', r);
    }

    console.log('[seed] inserting divers...');
    const divers = [
      ['DV-0001', 'Dr. Maya Hernandez', 'PADI Dive Master, Coral Restoration L2',    1840, '2026-05-12', 'active'],
      ['DV-0002', 'Tomas Reyes',        'AAUS Scientific Diver',                      980, '2026-05-13', 'active'],
      ['DV-0003', 'Dr. Aiko Tanaka',    'JCS Open Water Instructor, NAUI Tech',      2210, '2026-05-14', 'active'],
      ['DV-0004', 'Carlos Mendez',      'SSI Reef Restoration Specialty',             720, '2026-05-08', 'active'],
      ['DV-0005', 'Dr. Imani Okafor',   'BSAC Dive Leader, Marine Survey Specialty', 1650, '2026-05-15', 'medical_hold'],
      ['DV-0006', 'Lia Hernandez',      'PADI Rescue Diver',                          420, '2026-05-11', 'active'],
      ['DV-0007', 'Jeroen Smit',        'CMAS 3-star, Photogrammetry Specialty',     1140, '2026-05-09', 'active'],
      ['DV-0008', 'Putu Wirawan',       'PADI Dive Master',                           860, '2026-05-07', 'active'],
      ['DV-0009', 'Dr. Sarah Bennet',   'AAUS Scientific Diver, ROV Pilot',          2050, '2026-05-06', 'active'],
      ['DV-0010', 'Owen Brooks',        'AIDE Reef Survey',                           680, '2026-05-10', 'training'],
      ['DV-0011', 'Sasha Ramos',        'PADI MSDT, Coral Reef Restoration L3',      1320, '2026-05-12', 'active'],
      ['DV-0012', 'Dr. Hassan Faraj',   'NDC Reef Manager, Surveyor',                1480, '2026-05-13', 'active'],
      ['DV-0013', 'Amani Mwakio',       'CMAS 2-star',                                490, '2026-05-14', 'active'],
      ['DV-0014', 'Dr. Mei Lin',        'PADI Instructor, Drift Diver',              1900, '2026-05-15', 'active'],
      ['DV-0015', 'Ravi Patel',         'SSI Reef Restoration L1',                    260, '2026-05-16', 'training'],
    ];
    for (const r of divers) {
      await client.query(
        'INSERT INTO divers (diver_id,name,certifications,hours_total,last_dive,status) VALUES ($1,$2,$3,$4,$5,$6)', r);
    }

    console.log('[seed] inserting equipment...');
    const equipment = [
      ['EQ-0001', 'BCD',           'BCD-2021-AQ-09',  'Looe Key Station',   '2026-04-02', 'available'],
      ['EQ-0002', 'Regulator',     'REG-2020-SC-22',  'Looe Key Station',   '2026-04-02', 'available'],
      ['EQ-0003', 'Dry Suit',      'DS-2019-WL-08',   'Cane Bay Field Hut', '2026-03-10', 'maintenance'],
      ['EQ-0004', 'Computer',      'DC-2022-SH-30',   "Glover's Atoll",     '2026-04-15', 'available'],
      ['EQ-0005', 'Tank 80cf',     'TK-2018-AL-101',  'Carysfort Depot',    '2026-02-22', 'in_service'],
      ['EQ-0006', 'Camera Housing','CH-2020-NK-12',   'Lab',                '2025-12-05', 'available'],
      ['EQ-0007', 'Surface Marker','SMB-2021-XL-04',  'Vessel Reef Hopper', '2026-04-22', 'available'],
      ['EQ-0008', 'Underwater PAR sensor','PAR-2022-LI-07','Lab',           '2026-01-30', 'available'],
      ['EQ-0009', 'Outplant Drill','OPD-2023-MK-02',  'Lab',                '2026-05-01', 'available'],
      ['EQ-0010', 'Epoxy Kit',     'EPX-2024-Z2',     'Carysfort Depot',    '2026-05-08', 'in_service'],
      ['EQ-0011', 'CTD Probe',     'CTD-2019-SBE-44', 'Lab',                '2026-02-14', 'calibration'],
      ['EQ-0012', 'ROV',           'ROV-2022-BR-13',  'Vessel Reef Hopper', '2026-03-20', 'available'],
      ['EQ-0013', 'Towboard',      'TB-2024-CR-01',   'Komodo Field Camp',  '2026-04-30', 'available'],
      ['EQ-0014', 'Hammer + Float','HMR-2024-CR-09',  'Apo Reef Camp',      '2026-05-04', 'available'],
      ['EQ-0015', 'Bleach kit',    'BK-2024-SR-21',   'Lab',                '2026-04-12', 'available'],
    ];
    for (const r of equipment) {
      await client.query(
        'INSERT INTO equipment (eq_id,type,sn,location,last_service,status) VALUES ($1,$2,$3,$4,$5,$6)', r);
    }

    console.log('[seed] inserting weather_logs...');
    const wlogs = [
      ['WLOG-0001', 'SITE-001', '2026-05-12 08:00+00', 'calm',     12.0, 0.4],
      ['WLOG-0002', 'SITE-002', '2026-05-13 09:00+00', 'slight',    9.0, 0.8],
      ['WLOG-0003', 'SITE-003', '2026-05-14 08:00+00', 'moderate',  7.5, 1.2],
      ['WLOG-0004', 'SITE-004', '2026-05-08 08:30+00', 'calm',     14.0, 0.3],
      ['WLOG-0005', 'SITE-005', '2026-05-15 09:30+00', 'rough',     6.0, 2.4],
      ['WLOG-0006', 'SITE-006', '2026-05-11 09:00+00', 'calm',     15.5, 0.2],
      ['WLOG-0007', 'SITE-007', '2026-05-09 09:00+00', 'calm',     13.0, 0.3],
      ['WLOG-0008', 'SITE-008', '2026-05-07 07:30+00', 'slight',   10.0, 0.7],
      ['WLOG-0009', 'SITE-009', '2026-05-06 08:30+00', 'calm',     16.0, 0.4],
      ['WLOG-0010', 'SITE-010', '2026-05-10 09:00+00', 'moderate',  8.0, 1.4],
      ['WLOG-0011', 'SITE-011', '2026-05-12 09:00+00', 'slight',   11.5, 0.9],
      ['WLOG-0012', 'SITE-012', '2026-05-13 09:30+00', 'calm',     14.2, 0.5],
      ['WLOG-0013', 'SITE-013', '2026-05-14 08:30+00', 'slight',    7.0, 1.0],
      ['WLOG-0014', 'SITE-014', '2026-05-15 08:00+00', 'calm',     12.5, 0.6],
      ['WLOG-0015', 'SITE-015', '2026-05-16 08:30+00', 'calm',     17.0, 0.3],
    ];
    for (const r of wlogs) {
      await client.query(
        'INSERT INTO weather_logs (log_id,site_id,ts,sea_state,visibility_m,swell_m) VALUES ($1,$2,$3,$4,$5,$6)', r);
    }

    console.log('[seed] inserting partners...');
    const partners = [
      ['PRT-001', 'NOAA Coral Reef Conservation Program', 'government', 'USA',     1200000, 'active'],
      ['PRT-002', 'The Nature Conservancy',               'ngo',        'USA',      980000, 'active'],
      ['PRT-003', 'Coral Restoration Foundation',         'ngo',        'USA',      750000, 'active'],
      ['PRT-004', 'Reef Renewal Bonaire',                 'ngo',        'Bonaire',  220000, 'active'],
      ['PRT-005', 'Indonesian Biodiversity Foundation',   'ngo',        'IDN',      310000, 'active'],
      ['PRT-006', 'Australian Institute of Marine Sci.',  'research',   'AUS',      640000, 'active'],
      ['PRT-007', 'Seychelles Islands Foundation',        'ngo',        'SYC',      180000, 'monitored'],
      ['PRT-008', 'Maldives Marine Research Institute',   'research',   'MDV',      295000, 'active'],
      ['PRT-009', 'WCS Tanzania',                         'ngo',        'TZA',      125000, 'active'],
      ['PRT-010', 'PhilReefs Network',                    'consortium', 'PHL',      210000, 'active'],
      ['PRT-011', 'World Bank PROBLUE Trust Fund',        'funder',     'INT',      900000, 'active'],
      ['PRT-012', 'University of Miami RSMAS',            'university', 'USA',      460000, 'active'],
      ['PRT-013', 'IUCN Coral Specialist Group',          'consortium', 'INT',       90000, 'active'],
      ['PRT-014', 'Tiffany & Co. Foundation',             'corporate',  'USA',      380000, 'active'],
      ['PRT-015', 'Bezos Earth Fund Reefs Cohort',        'funder',     'USA',     1500000, 'active'],
    ];
    for (const r of partners) {
      await client.query(
        'INSERT INTO partners (partner_id,name,type,country,contribution_usd,status) VALUES ($1,$2,$3,$4,$5,$6)', r);
    }

    console.log('[seed] inserting grants...');
    const grants = [
      ['GR-2026-001', 'NOAA NA26ABCD-1234',     650000, '2026-2028', 'active',  'Dr. Maya Hernandez'],
      ['GR-2026-002', 'NSF OCE-2426001',         420000, '2026-2027', 'active',  'Dr. Sarah Bennet'],
      ['GR-2026-003', 'Bezos Earth Fund',       1500000, '2026-2029', 'active',  'Dr. Hassan Faraj'],
      ['GR-2026-004', 'PROBLUE Trust Fund',      900000, '2026-2028', 'active',  'Dr. Mei Lin'],
      ['GR-2025-005', 'PEW Marine Fellowship',   180000, '2025-2026', 'closing', 'Dr. Aiko Tanaka'],
      ['GR-2026-006', 'Walton Family Foundation',340000, '2026-2027', 'active',  'Carlos Mendez'],
      ['GR-2026-007', 'Tiffany & Co. Foundation',280000, '2026-2027', 'active',  'Jeroen Smit'],
      ['GR-2026-008', 'EU Horizon Europe',       720000, '2026-2029', 'pending', 'Dr. Imani Okafor'],
      ['GR-2025-009', 'NFWF Coral Reef',         210000, '2025-2026', 'closed',  'Lia Hernandez'],
      ['GR-2026-010', 'GEF Coral Reefs',         560000, '2026-2028', 'active',  'Ravi Patel'],
      ['GR-2026-011', 'David and Lucile Packard',420000, '2026-2027', 'active',  'Putu Wirawan'],
      ['GR-2026-012', 'IUCN Save Our Species',    95000, '2026-2026', 'active',  'Sasha Ramos'],
      ['GR-2026-013', 'Oceankind',               260000, '2026-2027', 'active',  'Owen Brooks'],
      ['GR-2026-014', 'Wildlife Conservation Network',150000,'2026-2027','active','Amani Mwakio'],
      ['GR-2026-015', 'Bloomberg Philanthropies', 380000, '2026-2028', 'active',  'Dr. Hassan Faraj'],
    ];
    for (const r of grants) {
      await client.query(
        'INSERT INTO grants (grant_id,funder,amount_usd,period,status,owner) VALUES ($1,$2,$3,$4,$5,$6)', r);
    }

    console.log('[seed] inserting publications...');
    const pubs = [
      ['PUB-2026-001', 'Outplant survivorship of Acropora cervicornis across Florida Keys nurseries', 'Hernandez M., Reyes T., Mendez C.', 'Coral Reefs',                2026, 'published'],
      ['PUB-2026-002', 'Heat-stress tolerance trends in restored Caribbean colonies',                  'Bennet S., Faraj H.',               'Marine Ecology',             2026, 'in_review'],
      ['PUB-2026-003', 'Coralliophila predation impact on outplanted Acropora',                        'Tanaka A.',                          'Coral Reefs',                2026, 'in_press'],
      ['PUB-2026-004', 'Sediment-driven bleaching at Indo-Pacific lagoonal sites',                     'Wirawan P., Lin M.',                'Marine Pollution Bulletin',  2026, 'published'],
      ['PUB-2026-005', 'Reproduction success of Acropora muricata in line nurseries (Belize)',         'Mendez C., Hernandez L.',           'PeerJ',                      2025, 'published'],
      ['PUB-2025-006', 'Crown-of-thorns outbreak response, Lizard Island lagoon',                      'Brooks O., Bennet S.',              'Coral Reefs',                2025, 'published'],
      ['PUB-2026-007', 'Land-based propagation efficacy in Roatan',                                    'Hernandez L., Mendez C.',           'Restoration Ecology',        2026, 'in_review'],
      ['PUB-2025-008', 'pH variability and outplant resilience, Bonaire',                              'Smit J.',                            'Coral Reefs',                2025, 'published'],
      ['PUB-2026-009', 'Recruitment dynamics at Apo Reef under cyclone disturbance',                   'Lin M., Patel R.',                  'Marine Ecology Progress',    2026, 'published'],
      ['PUB-2026-010', 'Cost-effective reef monitoring with low-cost photogrammetry',                  'Reyes T., Hernandez M.',            'Methods in Ecology',         2026, 'in_review'],
      ['PUB-2026-011', 'Local stakeholder engagement in Maldives restoration',                         'Faraj H.',                           'Marine Policy',              2026, 'published'],
      ['PUB-2026-012', 'Thermal refugia mapping for assisted evolution',                               'Bennet S., Wirawan P.',             'Global Change Biology',      2026, 'in_press'],
      ['PUB-2026-013', 'Diver safety in extreme reef-restoration operations',                          'Ramos S.',                           'Diving and Hyperbaric Medicine',2026,'published'],
      ['PUB-2025-014', 'Aldabra lagoon bleaching baseline study',                                       'Ramos S., Patel R.',                'Marine Biology',             2025, 'published'],
      ['PUB-2026-015', 'Outplant tracking with QR-tagged frags',                                        'Mwakio A., Mendez C.',              'Restoration Ecology',        2026, 'in_review'],
    ];
    for (const r of pubs) {
      await client.query(
        'INSERT INTO publications (pub_id,title,authors,journal,year,status) VALUES ($1,$2,$3,$4,$5,$6)', r);
    }

    console.log('[seed] inserting training_sessions...');
    const trainings = [
      ['TR-2026-001', 'Coral fragmentation basics',           'Dr. Maya Hernandez', 14, '2026-03-08', 'completed'],
      ['TR-2026-002', 'Underwater epoxy outplant technique',  'Carlos Mendez',      10, '2026-03-22', 'completed'],
      ['TR-2026-003', 'Photogrammetry for reef monitoring',   'Tomas Reyes',         8, '2026-04-05', 'completed'],
      ['TR-2026-004', 'Coral bleaching field response',       'Dr. Sarah Bennet',   12, '2026-04-19', 'completed'],
      ['TR-2026-005', 'Predator removal protocols',           'Owen Brooks',         9, '2026-05-03', 'completed'],
      ['TR-2026-006', 'Volunteer dive safety',                'Sasha Ramos',        22, '2026-05-17', 'planned'],
      ['TR-2026-007', 'Boat handling for reef ops',           'Jeroen Smit',         7, '2026-05-24', 'planned'],
      ['TR-2026-008', 'CTD probe deployment & QA',            'Dr. Hassan Faraj',    6, '2026-06-07', 'planned'],
      ['TR-2026-009', 'Larval rearing techniques',            'Dr. Mei Lin',        11, '2026-06-14', 'planned'],
      ['TR-2026-010', 'Stakeholder engagement workshop',      'Dr. Imani Okafor',   18, '2026-06-21', 'planned'],
      ['TR-2026-011', 'GIS for reef site selection',          'Ravi Patel',          9, '2026-07-05', 'planned'],
      ['TR-2026-012', 'Press & media training',               'Dr. Aiko Tanaka',     5, '2026-07-12', 'planned'],
      ['TR-2026-013', 'Grant writing for marine science',     'Lia Hernandez',      14, '2026-07-19', 'planned'],
      ['TR-2026-014', 'Tropicalization assessment',           'Putu Wirawan',        8, '2026-07-26', 'planned'],
      ['TR-2026-015', 'AAUS scientific diver refresher',      'Dr. Sarah Bennet',   16, '2026-08-02', 'planned'],
    ];
    for (const r of trainings) {
      await client.query(
        'INSERT INTO training_sessions (session_id,topic,instructor,attendees_count,date,status) VALUES ($1,$2,$3,$4,$5,$6)', r);
    }

    console.log('[seed] inserting vessels...');
    const vessels = [
      ['VES-001', 'RV Reef Hopper',         12,  'full',     'Looe Key Marina',         'available'],
      ['VES-002', 'RV Bluebird',             8,  '75%',      'Carysfort Pier',          'in_use'],
      ['VES-003', 'RV Atoll Explorer',      16,  'half',     "Glover's Caye",           'available'],
      ['VES-004', 'RV Coral Trekker',       10,  '90%',      'Roatan West Bay',         'available'],
      ['VES-005', 'RV Reef Watch',           8,  '60%',      'Bonaire HQ',              'available'],
      ['VES-006', 'RV Komodo Star',         14,  '40%',      'Labuan Bajo',             'maintenance'],
      ['VES-007', 'RV Heron',               12,  'full',     'Heron Island Jetty',      'available'],
      ['VES-008', 'RV Lizard',              10,  '85%',      'Lizard Island',           'in_use'],
      ['VES-009', 'RV Aldabra Pioneer',     14,  '70%',      'Aldabra Atoll',           'available'],
      ['VES-010', 'RV Baa Explorer',        12,  '95%',      'Baa Atoll',               'available'],
      ['VES-011', 'RV Mafia Ray',            8,  'full',     'Mafia Island Port',       'available'],
      ['VES-012', 'RV Apo Spirit',          16,  '50%',      'Sablayan Pier',           'available'],
      ['VES-013', 'RV Wayag',               10,  '80%',      'Waisai Harbor',           'in_use'],
      ['VES-014', 'Skiff Tender 1',          4,  '25%',      'Looe Key Marina',         'available'],
      ['VES-015', 'Skiff Tender 2',          4,  '20%',      'Carysfort Pier',          'maintenance'],
    ];
    for (const r of vessels) {
      await client.query(
        'INSERT INTO vessels (vessel_id,name,capacity,fuel_status,location,status) VALUES ($1,$2,$3,$4,$5,$6)', r);
    }

    console.log('[seed] inserting propagation_runs...');
    const props = [
      ['PRR-2026-001', 'NUR-001', 120, 92.5, '2026-01-10', '2026-04-10'],
      ['PRR-2026-002', 'NUR-002',  80, 88.0, '2026-02-04', '2026-05-04'],
      ['PRR-2026-003', 'NUR-003', 150, 90.0, '2026-01-22', '2026-04-22'],
      ['PRR-2026-004', 'NUR-005', 200, 87.4, '2026-02-15', '2026-05-15'],
      ['PRR-2026-005', 'NUR-006',  60, 78.0, '2026-03-08', null],
      ['PRR-2026-006', 'NUR-007', 110, 91.6, '2026-02-01', '2026-05-01'],
      ['PRR-2026-007', 'NUR-008', 180, 89.2, '2026-01-05', '2026-04-05'],
      ['PRR-2026-008', 'NUR-009', 140, 93.0, '2026-02-20', '2026-05-20'],
      ['PRR-2026-009', 'NUR-010', 100, 76.5, '2026-03-12', null],
      ['PRR-2026-010', 'NUR-011', 130, 82.2, '2026-02-25', '2026-05-25'],
      ['PRR-2026-011', 'NUR-012',  90, 70.4, '2026-03-22', null],
      ['PRR-2026-012', 'NUR-013', 110, 65.0, '2025-11-18', '2026-02-18'],
      ['PRR-2026-013', 'NUR-014', 160, 91.0, '2026-01-30', '2026-04-30'],
      ['PRR-2026-014', 'NUR-015', 220, 95.5, '2026-02-12', '2026-05-12'],
      ['PRR-2026-015', 'NUR-004',  70, 80.4, '2026-03-04', null],
    ];
    for (const r of props) {
      await client.query(
        'INSERT INTO propagation_runs (run_id,nursery_id,fragments_added,success_pct,started_at,ended_at) VALUES ($1,$2,$3,$4,$5,$6)', r);
    }

    console.log('[seed] inserting audit_log...');
    const audit = [
      ['AUD-2026-0001', 'admin@coralreef.io',     'reef_sites/SITE-005',          'restrict',        'success', '2026-05-01 09:00+00'],
      ['AUD-2026-0002', 'scientist@coralreef.io', 'outplants/OUT-0006',           'mark_dead',       'success', '2026-05-02 10:00+00'],
      ['AUD-2026-0003', 'scientist@coralreef.io', 'fragments/FRG-0013',           'update',          'success', '2026-05-03 11:00+00'],
      ['AUD-2026-0004', 'admin@coralreef.io',     'partners/PRT-007',             'flag_review',     'success', '2026-05-04 12:00+00'],
      ['AUD-2026-0005', 'scientist@coralreef.io', 'water_quality/WQ-0013',        'create',          'success', '2026-05-05 13:00+00'],
      ['AUD-2026-0006', 'admin@coralreef.io',     'users/3',                      'role_change',     'success', '2026-05-06 14:00+00'],
      ['AUD-2026-0007', 'scientist@coralreef.io', 'bleaching_events/BLE-0012',    'create',          'success', '2026-05-07 15:00+00'],
      ['AUD-2026-0008', 'viewer@coralreef.io',    'reef_sites',                   'export_csv',      'success', '2026-05-08 16:00+00'],
      ['AUD-2026-0009', 'scientist@coralreef.io', 'propagation_runs/PRR-2026-011','update',          'success', '2026-05-09 17:00+00'],
      ['AUD-2026-0010', 'admin@coralreef.io',     'grants/GR-2026-008',           'approve',         'success', '2026-05-10 09:00+00'],
      ['AUD-2026-0011', 'scientist@coralreef.io', 'publications/PUB-2026-012',    'submit',          'success', '2026-05-11 10:00+00'],
      ['AUD-2026-0012', 'admin@coralreef.io',     'webhooks/1',                   'create',          'success', '2026-05-12 11:00+00'],
      ['AUD-2026-0013', 'scientist@coralreef.io', 'monitoring_visits/MON-0014',   'create',          'success', '2026-05-13 12:00+00'],
      ['AUD-2026-0014', 'admin@coralreef.io',     'partners/PRT-015',             'increase_grant',  'success', '2026-05-14 13:00+00'],
      ['AUD-2026-0015', 'viewer@coralreef.io',    'fish_counts',                  'export_csv',      'success', '2026-05-15 14:00+00'],
    ];
    for (const r of audit) {
      await client.query(
        'INSERT INTO audit_log (entry_id,actor,target,action,result,ts) VALUES ($1,$2,$3,$4,$5,$6)', r);
    }

    console.log('[seed] inserting users...');
    const users = [
      ['admin@coralreef.io',     'admin123',     'Admin',     'admin'],
      ['scientist@coralreef.io', 'scientist123', 'Scientist', 'scientist'],
      ['viewer@coralreef.io',    'viewer123',    'Viewer',    'viewer'],
    ];
    for (const u of users) {
      await client.query('INSERT INTO users (email,password,name,role) VALUES ($1,$2,$3,$4)', u);
    }

    console.log('[seed] inserting notifications...');
    const notifications = [
      [1, 'Critical bleaching at SITE-015', 'BLE-0012 ongoing - Raja Ampat Wayag, 59% bleached.', 'critical', 'bleaching_events'],
      [1, 'New grant pending',              'GR-2026-008 EU Horizon Europe pending review.',      'info',     'grants'],
      [1, 'Partner flagged for review',     'Seychelles Islands Foundation status: monitored.',   'medium',   'partners'],
      [2, 'Outplant survivorship alert',    'OUT-0013 dead at SITE-012 (last check 2026-04-19).', 'high',     'outplants'],
      [2, 'New publication in press',       'PUB-2026-003 Coralliophila predation (Tanaka).',     'info',     'publications'],
    ];
    for (const n of notifications) {
      await client.query('INSERT INTO notifications (user_id,title,body,severity,source) VALUES ($1,$2,$3,$4,$5)', n);
    }

    console.log('[seed] inserting webhooks...');
    const webhooks = [
      ['NOAA Bleaching Alerts', 'https://httpbin.org/post', 'sec_noaa_2026',  'bleaching.created,bleaching.critical', true],
      ['Partner Slack Bridge',  'https://httpbin.org/post', 'sec_slack_2026', 'outplant.dead',                        true],
    ];
    for (const w of webhooks) {
      await client.query('INSERT INTO webhooks (name,url,secret,events,active) VALUES ($1,$2,$3,$4,$5)', w);
    }

    console.log('[seed] complete.');
  } catch (e) {
    console.error('[seed] error:', e);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

run();

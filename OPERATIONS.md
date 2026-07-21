# Operations

`/api/governed-fieldwork` is the supported reference path. It links site, colony, intervention, survey, imagery, environment/model versions, geospatial accuracy, survival/growth, missing-data reasons, offline source IDs, and independent scientist review in a tenant-scoped append-only history. Legacy CRUD/AI, public citizen intake, and NOAA-provider routes are disabled by default.

Install locked dependencies separately with `npm ci`, copy `.env.example`, configure least-privilege PostgreSQL and a strong JWT secret, run `npm run migrate`, then provision users with `npm run create-user`. Startup never installs, migrates, seeds, or kills unrelated processes. The destructive demo seed requires `ALLOW_DEMO_SEED=true` and the explicit `seed:demo` command.

Real GIS, underwater imagery, sensor, weather/ocean, lab, identity, device-authentication, and offline-sync adapters remain blocked on providers/hardware. Seasonal-drift thresholds, species labels, health models, survey protocols, and outcome acceptance require versioned field datasets and qualified scientific review. No conservation, scientific, provider, or regulatory validation is claimed.

'use strict';

const pool = require('../config/database');
const { hashPassword } = require('../services/passwords');

async function main() {
  if (process.env.BOOTSTRAP_ACKNOWLEDGEMENT !== 'create-initial-admin') {
    throw new Error('BOOTSTRAP_ACKNOWLEDGEMENT=create-initial-admin is required');
  }
  const email = String(process.env.PROVISION_ADMIN_EMAIL || '').trim().toLowerCase();
  const password = String(process.env.PROVISION_ADMIN_PASSWORD || '');
  const name = String(process.env.PROVISION_ADMIN_NAME || 'Provisioned Administrator').trim();
  const tenantId = String(process.env.TENANT_ID || process.env.GOVERNANCE_TENANT_ID || '').trim();
  if (!email || !tenantId || !name) {
    throw new Error('PROVISION_ADMIN_EMAIL, PROVISION_ADMIN_PASSWORD, PROVISION_ADMIN_NAME and TENANT_ID are required');
  }
  const existing = await pool.query('SELECT id FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1', [email]);
  if (existing.rows[0]) {
    console.log('Administrator already exists; credentials and role were not changed');
    return;
  }
  await pool.query(
    `INSERT INTO users(email, name, password_hash, role, tenant_id, password)
     VALUES($1, $2, $3, 'admin', $4, NULL)`,
    [email, name, hashPassword(password), tenantId]
  );
  console.log('Administrator provisioned');
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
}).finally(() => pool.end());

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
  await pool.query(
    `INSERT INTO users(email, name, password_hash, role, tenant_id, password)
     VALUES($1, $2, $3, 'admin', $4, NULL)
     ON CONFLICT(email) DO UPDATE SET name=EXCLUDED.name,password_hash=EXCLUDED.password_hash,
       role=EXCLUDED.role,tenant_id=EXCLUDED.tenant_id,password=NULL`,
    [email, name, hashPassword(password), tenantId]
  );
  console.log('Administrator provisioned or refreshed');
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
}).finally(() => pool.end());

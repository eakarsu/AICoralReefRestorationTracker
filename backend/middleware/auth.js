const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET.length < 32) throw new Error('JWT_SECRET must be configured with at least 32 characters');

const authenticateToken = (req, res, next) => {
  const match = String(req.headers.authorization || '').match(/^Bearer ([^\s]+)$/);
  const token = match && match[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
    if (!decoded.id || !decoded.tenant_id || !decoded.role) return res.status(403).json({ error: 'Token is missing required identity claims' });
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// Role hierarchy: admin > scientist > viewer
// admin:     full write access + user/governance
// scientist: write access (no governance)
// viewer:    read-only
const ROLES = ['viewer', 'scientist', 'admin'];

function requireRole(...allowed) {
  return (req, res, next) => {
    const role = req.user?.role || 'viewer';
    if (!allowed.includes(role)) {
      return res.status(403).json({
        error: `Forbidden: requires one of [${allowed.join(', ')}], got '${role}'`,
      });
    }
    next();
  };
}

const requireWriter = requireRole('admin', 'scientist');
const requireAdmin = requireRole('admin');
// Backward compatibility for any legacy reference
const requireCommander = requireAdmin;

function withCrudRbac(router) {
  router.use((req, res, next) => {
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
      return requireWriter(req, res, next);
    }
    return next();
  });
  return router;
}

module.exports = {
  authenticateToken,
  JWT_SECRET,
  ROLES,
  requireRole,
  requireWriter,
  requireAdmin,
  requireCommander,
  withCrudRbac,
};

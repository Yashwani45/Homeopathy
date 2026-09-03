const jwt = require("jsonwebtoken");
const db = require("../database/dbConnectionManager");
const SECRET = process.env.JWT_SECRET || "hospital_secret";

// In-memory cache for admin database names
const adminDbCache = {};

/**
 * Resolves the database name for a given admin/clinic ID
 * @param {number} adminId 
 * @returns {Promise<string|null>}
 */
const resolveAdminDbName = (adminId, allowInactive = false) => {
  if (!allowInactive && adminDbCache[adminId]) {
    return Promise.resolve(adminDbCache[adminId]);
  }

  return new Promise((resolve) => {
    db.superAdminDb.query(
      "SELECT database_name, status FROM admins WHERE id = ? AND deleted_at IS NULL",
      [adminId],
      (err, results) => {
        if (err || results.length === 0) {
          console.warn(`[Tenant Middleware] Could not resolve DB for Admin ID: ${adminId}`);
          resolve(null);
        } else if (results[0].status === "Inactive" && !allowInactive) {
          console.warn(`[Tenant Middleware] Blocked inactive Admin ID: ${adminId}`);
          resolve(null);
        } else {
          const dbName = results[0].database_name;
          if (dbName && results[0].status === "Active") {
            adminDbCache[adminId] = dbName;
          }
          resolve(dbName);
        }
      }
    );
  });
};

const tenantMiddleware = async (req, res, next) => {
  let databaseName = null;
  let adminId = null;
  let decoded = null;

  console.log(`\n--- [Tenant Middleware] Request: ${req.method} ${req.originalUrl} ---`);

  // 1. Check JWT token in headers first
  const authHeader = req.headers["authorization"];
  console.log(`[Tenant Middleware] Auth Header: ${authHeader || "None"}`);

  if (authHeader) {
    const token = authHeader.split(" ")[1];
    if (token) {
      try {
        decoded = jwt.verify(token, SECRET);
        console.log("[Tenant Middleware] Decoded JWT:", decoded);

        if (decoded.role === "super_admin") {
          // Super Admins can override context via headers/query/body to manage a specific clinic
          const targetId = req.query?.adminId || req.body?.adminId || req.body?.admin_id || req.headers["x-tenant-id"];
          console.log(`[Tenant Middleware] Super Admin override targetId: ${targetId || "None"}`);
          if (targetId) {
            adminId = parseInt(targetId);
          } else {
            databaseName = "super_admin_db";
          }
        } else {
          // Standard admin, doctor, patient, staff are pinned to their JWT's databaseName
          databaseName = decoded.databaseName;
          adminId = decoded.adminId;
        }
      } catch (err) {
        console.error("[Tenant Middleware] Token verification failed:", err.message);
      }
    }
  }

  // 2. Fallback to parameters (for login requests or unauthenticated guest appointment requests)
  if (!databaseName && !adminId) {
    const targetId = req.query?.adminId || req.body?.adminId || req.body?.admin_id || req.headers["x-tenant-id"];
    if (targetId) {
      adminId = parseInt(targetId);
      console.log(`[Tenant Middleware] Fallback resolved adminId from params: ${adminId}`);
    }
  }

  // 3. Resolve Database context and bind pool
  if (adminId) {
    const isSuperAdmin = decoded && decoded.role === "super_admin";
    const resolvedDbName = await resolveAdminDbName(adminId, isSuperAdmin);
    if (!resolvedDbName) {
      console.warn(`[Tenant Middleware] Request blocked: Clinic not found or deactivated (Admin ID: ${adminId})`);
      return res.status(403).json({ error: "Clinic is deactivated or not found." });
    }
    databaseName = resolvedDbName;
    console.log(`[Tenant Middleware] Resolved databaseName for adminId ${adminId}: ${databaseName}`);
  }

  console.log(`[Tenant Middleware] Selected Context: ${databaseName || "super_admin_db (fallback)"}`);

  if (databaseName) {
    const pool = (databaseName === "super_admin_db") ? db.superAdminDb : db.getTenantConnection(databaseName);

    return db.asyncLocalStorage.run({ connection: pool, dbName: databaseName, adminId }, () => {
      next();
    });
  }

  // Fallback to super_admin_db context
  db.asyncLocalStorage.run({ connection: db.superAdminDb, dbName: "super_admin_db", adminId: null }, () => {
    next();
  });
};

tenantMiddleware.clearDbCache = (adminId) => {
  if (adminDbCache[adminId]) {
    console.log(`[Tenant Middleware] Cleared DB cache for Admin ID: ${adminId}`);
    delete adminDbCache[adminId];
  }
};

module.exports = tenantMiddleware;

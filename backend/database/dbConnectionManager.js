const mysql = require("mysql2");
const { AsyncLocalStorage } = require("async_hooks");

const asyncLocalStorage = new AsyncLocalStorage();
const tenantPools = {};

// ======================================================
// ONLINE DB CONNECTION DETAILS
// ======================================================

const dbHost = process.env.DB_HOST;
const dbPort = Number(process.env.DB_PORT);
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const dbName = process.env.DB_NAME || "defaultdb";

if (!dbHost || !dbPort || !dbUser || !dbPassword) {
  throw new Error(
    "Missing DB environment variables. Check DB_HOST, DB_PORT, DB_USER and DB_PASSWORD in Render."
  );
}

// ======================================================
// DATABASE SSL CONFIGURATION
// Aiven MySQL requires SSL
// ======================================================

const dbSSL =
  process.env.DB_SSL === "true"
    ? {
        rejectUnauthorized: false,
      }
    : undefined;

// ======================================================
// DATABASE NAME NORMALIZATION
// ======================================================

const getRealDbName = (name) => {
  if (process.env.FORCE_SINGLE_DB === "true") {
    return dbName;
  }

  if (!name) return name;

  if (dbName === "super_admin_db" || dbName === "homeopathy db") {
    return name;
  }

  if (name.startsWith(dbName + "_")) {
    return name;
  }

  return `${dbName}_${name}`;
};

// ======================================================
// LOCAL DATABASE CONNECTION DETAILS
// Used only for tenant/local development fallback
// ======================================================

const dbLocalHost = process.env.DB_LOCAL_HOST || "localhost";
const dbLocalUser = process.env.DB_LOCAL_USER || "root";
const dbLocalPassword = process.env.DB_LOCAL_PASSWORD || "";
const dbLocalName = process.env.DB_LOCAL_NAME || dbName;

const localTenantPools = {};

// ======================================================
// FALLBACK QUERY WRAPPER
// Used for TENANT connections only
// ======================================================

const makeFallbackQueryable = (
  onlinePool,
  localPool,
  priority = "online"
) => {
  const originalOnlineQuery = onlinePool.query.bind(onlinePool);

  onlinePool.query = function (sql, params, callback) {
    let actualParams = params;
    let actualCallback = callback;

    if (typeof params === "function") {
      actualCallback = params;
      actualParams = [];
    }

    let boundCallback = actualCallback;

    const store = asyncLocalStorage.getStore();

    if (store && typeof actualCallback === "function") {
      boundCallback = (...args) => {
        return asyncLocalStorage.run(store, () =>
          actualCallback(...args)
        );
      };
    }

    let formattedSql = sql;

    if (
      dbName !== "super_admin_db" &&
      typeof sql === "string"
    ) {
      formattedSql = sql
        .replace(
          /`super_admin_db`/gi,
          `\`${dbName}\``
        )
        .replace(
          /\bsuper_admin_db\./gi,
          `${dbName}.`
        );
    }

    const isReadOnly =
      typeof formattedSql === "string" &&
      /^(SELECT|SHOW|DESCRIBE|EXPLAIN)/i.test(
        formattedSql.trim()
      );

    // ==================================================
    // LOCAL PRIORITY
    // ==================================================

    if (priority === "local") {
      if (isReadOnly) {
        localPool.query(
          formattedSql,
          actualParams,
          (localErr, localResults, localFields) => {
            const hasNoData =
              !localErr &&
              Array.isArray(localResults) &&
              localResults.length === 0;

            if (localErr || hasNoData) {
              originalOnlineQuery(
                formattedSql,
                actualParams,
                (err, results, fields) => {
                  if (err) {
                    return boundCallback(
                      localErr || err,
                      results,
                      fields
                    );
                  }

                  return boundCallback(
                    null,
                    results,
                    fields
                  );
                }
              );
            } else {
              return boundCallback(
                null,
                localResults,
                localFields
              );
            }
          }
        );
      } else {
        localPool.query(
          formattedSql,
          actualParams,
          (localErr, localResults, localFields) => {
            if (localErr) {
              originalOnlineQuery(
                formattedSql,
                actualParams,
                (err, results, fields) => {
                  if (err) {
                    return boundCallback(
                      localErr,
                      localResults,
                      localFields
                    );
                  }

                  return boundCallback(
                    null,
                    results,
                    fields
                  );
                }
              );
            } else {
              return boundCallback(
                null,
                localResults,
                localFields
              );
            }
          }
        );
      }
    }

    // ==================================================
    // ONLINE PRIORITY
    // ==================================================

    else {
      if (isReadOnly) {
        originalOnlineQuery(
          formattedSql,
          actualParams,
          (err, results, fields) => {
            const hasNoData =
              !err &&
              Array.isArray(results) &&
              results.length === 0;

            if (err || hasNoData) {
              localPool.query(
                formattedSql,
                actualParams,
                (
                  localErr,
                  localResults,
                  localFields
                ) => {
                  if (localErr) {
                    return boundCallback(
                      err || localErr,
                      localResults,
                      localFields
                    );
                  }

                  return boundCallback(
                    null,
                    localResults,
                    localFields
                  );
                }
              );
            } else {
              return boundCallback(
                null,
                results,
                fields
              );
            }
          }
        );
      } else {
        originalOnlineQuery(
          formattedSql,
          actualParams,
          (err, results, fields) => {
            if (err) {
              localPool.query(
                formattedSql,
                actualParams,
                (
                  localErr,
                  localResults,
                  localFields
                ) => {
                  if (localErr) {
                    return boundCallback(
                      err,
                      results,
                      fields
                    );
                  }

                  return boundCallback(
                    null,
                    localResults,
                    localFields
                  );
                }
              );
            } else {
              return boundCallback(
                null,
                results,
                fields
              );
            }
          }
        );
      }
    }
  };
};

// ======================================================
// 1. CENTRAL SUPER ADMIN ONLINE POOL
// AIVEN MYSQL
// ======================================================

const superAdminDb = mysql.createPool({
  host: dbHost,
  port: dbPort,
  user: dbUser,
  password: dbPassword,
  database: dbName,
  ssl: dbSSL,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000,
});

// ======================================================
// SUPER ADMIN DB CONNECTION TEST
// ======================================================

superAdminDb.getConnection((err, connection) => {
  if (err) {
    console.error(
      "[SUPER ADMIN DB TEST] FAILED:",
      err.message
    );
  } else {
    console.log(
      "[SUPER ADMIN DB TEST] CONNECTED SUCCESSFULLY"
    );
    connection.release();
  }
});

// ======================================================
// 2. CENTRAL LOCAL MYSQL POOL
// ======================================================

const superAdminDbLocal = mysql.createPool({
  host: dbLocalHost,
  user: dbLocalUser,
  password: dbLocalPassword,
  database: dbLocalName,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 2000,
});

// ======================================================
// IMPORTANT:
// CENTRAL/SUPER ADMIN DB USES ONLINE AIVEN DB ONLY
// NO LOCALHOST FALLBACK
// ======================================================

console.log(
  `[DB Manager] central ${dbName} ONLINE at ${dbHost}:${dbPort}`
);

// ======================================================
// GET / CREATE TENANT CONNECTION
// ======================================================

const getTenantConnection = (dbNameParam) => {
  if (process.env.FORCE_SINGLE_DB === "true") {
    return superAdminDb;
  }

  const realDbName = getRealDbName(dbNameParam);

  if (!tenantPools[realDbName]) {
    // ==================================================
    // ONLINE TENANT POOL - AIVEN
    // ==================================================

    tenantPools[realDbName] = mysql.createPool({
      host: dbHost,
      port: dbPort,
      user: dbUser,
      password: dbPassword,
      database: realDbName,
      ssl: dbSSL,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: 10000,
    });

    // ==================================================
    // LOCAL TENANT POOL
    // ==================================================

    localTenantPools[realDbName] = mysql.createPool({
      host: dbLocalHost,
      user: dbLocalUser,
      password: dbLocalPassword,
      database: dbNameParam,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: 2000,
    });

    // Tenant connections retain fallback behavior
    makeFallbackQueryable(
      tenantPools[realDbName],
      localTenantPools[realDbName],
      "local"
    );

    console.log(
      `[DB Manager] Created dynamic connection pool for tenant database: ${realDbName} (with local fallback)`
    );
  }

  return tenantPools[realDbName];
};

// ======================================================
// CLOSE ALL POOLS
// ======================================================

const closeAllPools = (cb) => {
  superAdminDb.end((err) => {
    if (err) {
      console.warn(
        `Error closing online ${dbName} pool:`,
        err.message
      );
    }
  });

  superAdminDbLocal.end((err) => {
    if (err) {
      console.warn(
        `Error closing local ${dbLocalName} pool:`,
        err.message
      );
    }
  });

  const closePromises = Object.keys(
    tenantPools
  ).map((tDbName) => {
    return new Promise((resolve) => {
      tenantPools[tDbName].end((err) => {
        if (err) {
          console.warn(
            `Error closing online pool for ${tDbName}:`,
            err.message
          );
        }

        delete tenantPools[tDbName];

        if (localTenantPools[tDbName]) {
          localTenantPools[tDbName].end(
            (localErr) => {
              if (localErr) {
                console.warn(
                  `Error closing local pool for ${tDbName}:`,
                  localErr.message
                );
              }

              delete localTenantPools[tDbName];
              resolve();
            }
          );
        } else {
          resolve();
        }
      });
    });
  });

  Promise.all(closePromises).then(() => {
    if (typeof cb === "function") {
      cb(null);
    }
  });
};

// ======================================================
// DB PROXY
// ======================================================

const dbProxy = {
  query: function (sql, params, callback) {
    let actualParams = params;
    let actualCallback = callback;

    if (typeof params === "function") {
      actualCallback = params;
      actualParams = [];
    }

    const store = asyncLocalStorage.getStore();

    const activeDbName = store
      ? store.dbName
      : dbName;

    const activeConn =
      store && store.connection
        ? store.connection
        : superAdminDb;

    // ==================================================
    // REPLACE HARDCODED SUPER ADMIN DATABASE REFERENCES
    // ==================================================

    let formattedSql = sql;

    if (dbName !== "super_admin_db") {
      formattedSql = sql
        .replace(
          /`super_admin_db`/gi,
          `\`${dbName}\``
        )
        .replace(
          /\bsuper_admin_db\./gi,
          `${dbName}.`
        );
    }

    console.log(
      `[DB Query Proxy] Context: ${activeDbName} | SQL: ${formattedSql
        .trim()
        .replace(/\s+/g, " ")
        .slice(0, 80)}...`
    );

    let boundCallback = actualCallback;

    if (
      store &&
      typeof actualCallback === "function"
    ) {
      boundCallback = (...args) => {
        return asyncLocalStorage.run(
          store,
          () => actualCallback(...args)
        );
      };
    }

    return activeConn.query(
      formattedSql,
      actualParams,
      boundCallback
    );
  },

  // ==================================================
  // COMPATIBILITY ALIASES
  // ==================================================

  systemDb: superAdminDb,
  masterDb: superAdminDb,
  superAdminDb,

  // ==================================================
  // TENANT HELPERS
  // ==================================================

  getTenantConnection,
  asyncLocalStorage,
  getRealDbName,

  // ==================================================
  // CLEAN SHUTDOWN
  // ==================================================

  end: closeAllPools,
};

module.exports = dbProxy;
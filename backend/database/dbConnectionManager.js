// const mysql = require("mysql2");
// const { AsyncLocalStorage } = require("async_hooks");

// const asyncLocalStorage = new AsyncLocalStorage();
// const tenantPools = {};

// // DB connection details from environment
// const dbHost = process.env.DB_HOST || "localhost";
// const dbUser = process.env.DB_USER || "root";
// const dbPassword = process.env.DB_PASSWORD || "";
// const dbName = process.env.DB_NAME || "super_admin_db";

// /**
//  * Normalizes database names to fit database prefix requirements on shared hosting
//  */
// const getRealDbName = (name) => {
//   if (process.env.FORCE_SINGLE_DB === "true") {
//     return dbName;
//   }
//   if (!name) return name;
//   if (dbName === "super_admin_db" || dbName === "homeopathy db") {
//     return name;
//   }
//   if (name.startsWith(dbName + "_")) {
//     return name;
//   }
//   return `${dbName}_${name}`;
// };

// // Local DB connection details from environment (with fallback)
// const dbLocalHost = process.env.DB_LOCAL_HOST || "localhost";
// const dbLocalUser = process.env.DB_LOCAL_USER || "root";
// const dbLocalPassword = process.env.DB_LOCAL_PASSWORD || "";
// const dbLocalName = process.env.DB_LOCAL_NAME || dbName;

// const localTenantPools = {};

// /**
//  * Wraps a mysql2 pool's query function to implement fallback read and sync/fallback write.
//  * @param {object} onlinePool 
//  * @param {object} localPool 
//  */
// const makeFallbackQueryable = (onlinePool, localPool, priority = "online") => {
//   const originalOnlineQuery = onlinePool.query.bind(onlinePool);

//   onlinePool.query = function(sql, params, callback) {
//     let actualParams = params;
//     let actualCallback = callback;
//     if (typeof params === "function") {
//       actualCallback = params;
//       actualParams = [];
//     }

//     let boundCallback = actualCallback;
//     const store = asyncLocalStorage.getStore();
//     if (store && typeof actualCallback === "function") {
//       boundCallback = (...args) => {
//         return asyncLocalStorage.run(store, () => actualCallback(...args));
//       };
//     }

//     let formattedSql = sql;
//     if (dbName !== "super_admin_db" && typeof sql === "string") {
//       formattedSql = sql
//         .replace(/`super_admin_db`/g, `\`${dbName}\``)
//         .replace(/\bsuper_admin_db\./gi, `${dbName}.`);
//     }

//     const isReadOnly = typeof formattedSql === "string" && /^(SELECT|SHOW|DESCRIBE|EXPLAIN)/i.test(formattedSql.trim());

//     if (priority === "local") {
//       if (isReadOnly) {
//         localPool.query(formattedSql, actualParams, (localErr, localResults, localFields) => {
//           const hasNoData = !localErr && Array.isArray(localResults) && localResults.length === 0;

//           if (localErr || hasNoData) {
//             originalOnlineQuery(formattedSql, actualParams, (err, results, fields) => {
//               if (err) {
//                 return boundCallback(localErr || err, results, fields);
//               }
//               return boundCallback(null, results, fields);
//             });
//           } else {
//             return boundCallback(null, localResults, localFields);
//           }
//         });
//       } else {
//         localPool.query(formattedSql, actualParams, (localErr, localResults, localFields) => {
//           originalOnlineQuery(formattedSql, actualParams, (err) => {});
//           if (localErr) {
//             originalOnlineQuery(formattedSql, actualParams, (err, results, fields) => {
//               if (err) return boundCallback(localErr, localResults, localFields);
//               return boundCallback(null, results, fields);
//             });
//           } else {
//             return boundCallback(null, localResults, localFields);
//           }
//         });
//       }
//     } else {
//       if (isReadOnly) {
//         originalOnlineQuery(formattedSql, actualParams, (err, results, fields) => {
//           const hasNoData = !err && Array.isArray(results) && results.length === 0;

//           if (err || hasNoData) {
//             localPool.query(formattedSql, actualParams, (localErr, localResults, localFields) => {
//               if (localErr) {
//                 return boundCallback(err || localErr, localResults, localFields);
//               }
//               return boundCallback(null, localResults, localFields);
//             });
//           } else {
//             return boundCallback(null, results, fields);
//           }
//         });
//       } else {
//         originalOnlineQuery(formattedSql, actualParams, (err, results, fields) => {
//           localPool.query(formattedSql, actualParams, (localErr) => {});
//           if (err) {
//             localPool.query(formattedSql, actualParams, (localErr, localResults, localFields) => {
//               if (localErr) return boundCallback(err, results, fields);
//               return boundCallback(null, localResults, localFields);
//             });
//           } else {
//             return boundCallback(null, results, fields);
//           }
//         });
//       }
//     }
//   };
// };

// // 1. Central Super Admin Pools (Online & Local)
// const superAdminDb = mysql.createPool({
//   host: dbHost,
//   user: dbUser,
//   password: dbPassword,
//   database: dbName,
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0,
//   connectTimeout: 3000
// });

// const superAdminDbLocal = mysql.createPool({
//   host: dbLocalHost,
//   user: dbLocalUser,
//   password: dbLocalPassword,
//   database: dbLocalName,
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0,
//   connectTimeout: 2000
// });

// makeFallbackQueryable(superAdminDb, superAdminDbLocal, "online");

// console.log(`[DB Manager] central ${dbName} (online) and ${dbLocalName} (local) pools initialized with fallback.`);

// /**
//  * Gets or creates connection pool for an isolated tenant database
//  * @param {string} dbNameParam - Tenant database name (e.g. admin_0001)
//  */
// const getTenantConnection = (dbNameParam) => {
//   if (process.env.FORCE_SINGLE_DB === "true") {
//     return superAdminDb;
//   }
//   const realDbName = getRealDbName(dbNameParam);
//   if (!tenantPools[realDbName]) {
//     tenantPools[realDbName] = mysql.createPool({
//       host: dbHost,
//       user: dbUser,
//       password: dbPassword,
//       database: realDbName,
//       waitForConnections: true,
//       connectionLimit: 10,
//       queueLimit: 0,
//       connectTimeout: 3000
//     });

//     localTenantPools[realDbName] = mysql.createPool({
//       host: dbLocalHost,
//       user: dbLocalUser,
//       password: dbLocalPassword,
//       database: dbNameParam,
//       waitForConnections: true,
//       connectionLimit: 10,
//       queueLimit: 0,
//       connectTimeout: 2000
//     });

//     makeFallbackQueryable(tenantPools[realDbName], localTenantPools[realDbName], "local");
//     console.log(`[DB Manager] Created dynamic connection pool for tenant database: ${realDbName} (with local fallback)`);
//   }
//   return tenantPools[realDbName];
// };

// /**
//  * Closes all active pools (clean shutdowns)
//  */
// const closeAllPools = (cb) => {
//   superAdminDb.end((err) => {
//     if (err) console.warn(`Error closing online ${dbName} pool:`, err.message);
//   });
  
//   superAdminDbLocal.end((err) => {
//     if (err) console.warn(`Error closing local ${dbLocalName} pool:`, err.message);
//   });

//   const closePromises = Object.keys(tenantPools).map((tDbName) => {
//     return new Promise((resolve) => {
//       tenantPools[tDbName].end((err) => {
//         if (err) console.warn(`Error closing online pool for ${tDbName}:`, err.message);
//         delete tenantPools[tDbName];
        
//         if (localTenantPools[tDbName]) {
//           localTenantPools[tDbName].end((localErr) => {
//             if (localErr) console.warn(`Error closing local pool for ${tDbName}:`, localErr.message);
//             delete localTenantPools[tDbName];
//             resolve();
//           });
//         } else {
//           resolve();
//         }
//       });
//     });
//   });

//   Promise.all(closePromises).then(() => {
//     if (typeof cb === "function") cb(null);
//   });
// };

// /**
//  * dbProxy maps calls automatically based on AsyncLocalStorage execution thread context.
//  */
// const dbProxy = {
//   query: function(sql, params, callback) {
//     let actualParams = params;
//     let actualCallback = callback;
//     if (typeof params === "function") {
//       actualCallback = params;
//       actualParams = [];
//     }

//     const store = asyncLocalStorage.getStore();
//     const activeDbName = store ? store.dbName : dbName;
//     const activeConn = store && store.connection ? store.connection : superAdminDb;
    
//     // Intercept and replace any hardcoded references to super_admin_db
//     let formattedSql = sql;
//     if (dbName !== "super_admin_db") {
//       formattedSql = sql
//         .replace(/`super_admin_db`/g, `\`${dbName}\``)
//         .replace(/\bsuper_admin_db\./gi, `${dbName}.`);
//     }

//     console.log(`[DB Query Proxy] Context: ${activeDbName} | SQL: ${formattedSql.trim().replace(/\s+/g, " ").slice(0, 80)}...`);

//     let boundCallback = actualCallback;
//     if (store && typeof actualCallback === "function") {
//       boundCallback = (...args) => {
//         return asyncLocalStorage.run(store, () => actualCallback(...args));
//       };
//     }

//     return activeConn.query(formattedSql, actualParams, boundCallback);
//   },

//   // Aliases for compatibility
//   systemDb: superAdminDb,
//   masterDb: superAdminDb,
//   superAdminDb,

//   // Tenant helpers
//   getTenantConnection,
//   asyncLocalStorage,
//   getRealDbName,
//   end: closeAllPools
// };

// module.exports = dbProxy;
const mysql = require("mysql2");

const { AsyncLocalStorage } = require("async_hooks");

const asyncLocalStorage = new AsyncLocalStorage();

const tenantPools = {};

// ======================================================
// ONLINE DB CONNECTION DETAILS
// ======================================================

const dbHost = process.env.DB_HOST || "localhost";
const dbPort = Number(process.env.DB_PORT || 3306);
const dbUser = process.env.DB_USER || "root";
const dbPassword = process.env.DB_PASSWORD || "";
const dbName = process.env.DB_NAME || "super_admin_db";

// ======================================================
// DATABASE SSL CONFIGURATION
// Aiven MySQL requires SSL
// ======================================================
console.log("[DB CONFIG]", {
  host: dbHost,
  port: dbPort,
  user: dbUser,
  database: dbName,
  ssl: !!dbSSL
});
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
// Used as fallback
// ======================================================

const dbLocalHost = process.env.DB_LOCAL_HOST || "localhost";
const dbLocalUser = process.env.DB_LOCAL_USER || "root";
const dbLocalPassword = process.env.DB_LOCAL_PASSWORD || "";
const dbLocalName = process.env.DB_LOCAL_NAME || dbName;

const localTenantPools = {};

// ======================================================
// FALLBACK QUERY WRAPPER
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
          /\`super_admin_db\`/g,
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
            originalOnlineQuery(
              formattedSql,
              actualParams,
              () => {}
            );

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
            localPool.query(
              formattedSql,
              actualParams,
              () => {}
            );

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

  // Aiven requires SSL
  ssl: dbSSL,

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,

  // Aiven/cloud connections may need more time
  connectTimeout: 10000,
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
// FALLBACK CONNECTION
// ======================================================

makeFallbackQueryable(
  superAdminDb,
  superAdminDbLocal,
  "online"
);

console.log(
  `[DB Manager] central ${dbName} (online) and ${dbLocalName} (local) pools initialized with fallback.`
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

      // Aiven SSL
      ssl: dbSSL,

      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,

      connectTimeout: 10000,
    });

    // ==================================================
    // LOCAL TENANT POOL
    // ==================================================

    localTenantPools[realDbName] =
      mysql.createPool({
        host: dbLocalHost,
        user: dbLocalUser,
        password: dbLocalPassword,
        database: dbNameParam,

        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,

        connectTimeout: 2000,
      });

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
          /\`super_admin_db\`/g,
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
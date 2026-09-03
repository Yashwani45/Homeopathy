const fs = require("fs");
const path = require("path");
const mysql = require("mysql2");
const db = require("./dbConnectionManager");

/**
 * Splits a SQL script into individual queries, handling comments, quotes, and escapes.
 * @param {string} sqlText - Raw content of the SQL script
 */
const parseQueries = (sqlText) => {
  // Remove block comments
  let cleaned = sqlText.replace(/\/\*[\s\S]*?\*\//g, "");
  
  // Remove single line comments
  cleaned = cleaned.split("\n").map(line => {
    const trimmed = line.trim();
    if (trimmed.startsWith("--") || trimmed.startsWith("#")) {
      return "";
    }
    return line;
  }).join("\n");

  const queries = [];
  let currentQuery = "";
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let escapeNext = false;

  for (let i = 0; i < cleaned.length; i++) {
    const char = cleaned[i];
    
    if (escapeNext) {
      currentQuery += char;
      escapeNext = false;
      continue;
    }
    
    if (char === "\\") {
      currentQuery += char;
      escapeNext = true;
      continue;
    }
    
    if (char === "'" && !inDoubleQuote) {
      inSingleQuote = !inSingleQuote;
    }
    
    if (char === '"' && !inSingleQuote) {
      inDoubleQuote = !inDoubleQuote;
    }
    
    if (char === ";" && !inSingleQuote && !inDoubleQuote) {
      const trimmed = currentQuery.trim();
      if (trimmed) queries.push(trimmed);
      currentQuery = "";
    } else {
      currentQuery += char;
    }
  }
  
  const trimmed = currentQuery.trim();
  if (trimmed) queries.push(trimmed);

  return queries;
};

/**
 * Executes a list of SQL queries sequentially on a direct connection
 * @param {object} conn - mysql2 connection instance
 * @param {array} queries - Array of query strings
 */
const executeSequential = async (conn, queries) => {
  for (const query of queries) {
    if (!query) continue;
    await new Promise((resolve, reject) => {
      conn.query(query, (err, results) => {
        if (err) {
          console.error(`[Migration Error] Failed executing statement: \n${query}\nError: ${err.message}`);
          return reject(err);
        }
        resolve(results);
      });
    });
  }
};

/**
 * Runs system migrations on a specific host configuration
 * @param {object} config - Connection config for host
 */
const runSystemMigrationsForHost = async (config) => {
  const dbName = process.env.DB_NAME || "super_admin_db";
  const sqlPath = path.join(__dirname, "..", "migrations", "init_super_admin.sql");
  let sqlText = fs.readFileSync(sqlPath, "utf8");
  
  if (dbName !== "super_admin_db") {
    sqlText = sqlText
      .replace(/`super_admin_db`/g, `\`${dbName}\``)
      .replace(/super_admin_db\./g, `${dbName}.`);
  }

  const queries = parseQueries(sqlText);

  const conn = mysql.createConnection({
    host: config.host,
    user: config.user,
    password: config.password,
    connectTimeout: 3000
  });

  try {
    await new Promise((resolve) => {
      conn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`, (err) => {
        if (err) {
          console.warn(`[Migration Runner] Warning: Could not run CREATE DATABASE for ${dbName} (${err.message}) on host ${config.host}. Assuming pre-created.`);
        }
        resolve();
      });
    });

    await new Promise((resolve, reject) => {
      conn.query(`USE \`${dbName}\``, (err) => {
        if (err) {
          return reject(new Error(`Failed to select database ${dbName}: ${err.message}`));
        }
        resolve();
      });
    });

    await executeSequential(conn, queries);
    console.log(`[Migration Runner] ${dbName} migrations completed successfully on host ${config.host}.`);
  } finally {
    conn.end();
  }
};

/**
 * Runs the super_admin_db platform migrations on online and local hosts
 */
const runSystemMigrations = async () => {
  const dbName = process.env.DB_NAME || "super_admin_db";
  
  // 1. Run on online host
  console.log(`[Migration Runner] Running system migrations for online database: ${dbName}...`);
  try {
    await runSystemMigrationsForHost({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || ""
    });
  } catch (err) {
    console.error(`[Migration Runner] Online system migration failed:`, err.message);
  }

  // 2. Run on local host
  const localHost = process.env.DB_LOCAL_HOST || "localhost";
  const localUser = process.env.DB_LOCAL_USER || "root";
  const localPassword = process.env.DB_LOCAL_PASSWORD || "";
  
  if (localHost !== (process.env.DB_HOST || "localhost") || !process.env.DB_HOST) {
    console.log(`[Migration Runner] Running system migrations for local database: ${dbName}...`);
    try {
      await runSystemMigrationsForHost({
        host: localHost,
        user: localUser,
        password: localPassword
      });
    } catch (err) {
      console.error(`[Migration Runner] Local system migration failed:`, err.message);
    }
  }
};

/**
 * Runs the master migrations (No-Op now since master lookup is merged inside super_admin_db)
 */
const runMasterMigrations = async () => {
  const dbName = process.env.DB_NAME || "super_admin_db";
  console.log(`[Migration Runner] master_db migrations merged in ${dbName}. Skipping...`);
  return Promise.resolve();
};

/**
 * Runs tenant migrations on a specific host configuration
 * @param {string} tenantDbName 
 * @param {object} config 
 */
const runTenantMigrationsForHost = async (tenantDbName, config, isLocal = false) => {
  const realDbName = isLocal ? tenantDbName : db.getRealDbName(tenantDbName);
  const dbName = process.env.DB_NAME || "super_admin_db";
  const sqlPath = path.join(__dirname, "..", "migrations", "init_tenant.sql");
  let sqlText = fs.readFileSync(sqlPath, "utf8");

  if (dbName !== "super_admin_db") {
    sqlText = sqlText
      .replace(/`super_admin_db`/g, `\`${dbName}\``)
      .replace(/super_admin_db\./g, `${dbName}.`);
  }

  const queries = parseQueries(sqlText);

  const conn = mysql.createConnection({
    host: config.host,
    user: config.user,
    password: config.password,
    connectTimeout: 3000
  });

  try {
    await new Promise((resolve) => {
      conn.query(`CREATE DATABASE IF NOT EXISTS \`${realDbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`, (err) => {
        if (err) {
          console.warn(`[Migration Runner] Warning: Could not run CREATE DATABASE for ${realDbName} (${err.message}) on host ${config.host}. Assuming database is pre-created.`);
        }
        resolve();
      });
    });

    await new Promise((resolve, reject) => {
      conn.query(`USE \`${realDbName}\``, (err) => {
        if (err) {
          return reject(new Error(`Failed to select database ${realDbName}: ${err.message}`));
        }
        resolve();
      });
    });

    await executeSequential(conn, queries);
    console.log(`[Migration Runner] Tenant ${realDbName} migrations completed successfully on host ${config.host}.`);
  } finally {
    conn.end();
  }
};

/**
 * Runs migrations for a specific Admin/Clinic database on online and local hosts
 * @param {string} tenantDbName - E.g. admin_0001
 */
const runTenantMigrations = async (tenantDbName) => {
  const realDbName = db.getRealDbName(tenantDbName);

  // 1. Run on online host
  try {
    await runTenantMigrationsForHost(tenantDbName, {
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || ""
    }, false);
  } catch (err) {
    console.error(`[Migration Runner] Online tenant migration for ${realDbName} failed:`, err.message);
  }

  // 2. Run on local host
  const localHost = process.env.DB_LOCAL_HOST || "localhost";
  const localUser = process.env.DB_LOCAL_USER || "root";
  const localPassword = process.env.DB_LOCAL_PASSWORD || "";
  
  if (localHost !== (process.env.DB_HOST || "localhost") || !process.env.DB_HOST) {
    try {
      await runTenantMigrationsForHost(tenantDbName, {
        host: localHost,
        user: localUser,
        password: localPassword
      }, true);
    } catch (err) {
      console.error(`[Migration Runner] Local tenant migration for ${tenantDbName} failed:`, err.message);
    }
  }
};

module.exports = {
  runSystemMigrations,
  runMasterMigrations,
  runTenantMigrations
};

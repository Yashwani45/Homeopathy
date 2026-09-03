/**
 * Migration: Add branding columns to admin table
 * Run once: node config/add_branding_columns.js
 */

const mysql = require("mysql2");
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });

const connection = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "homeopathy_db"
});

connection.connect((err) => {
  if (err) {
    console.error("Connection failed:", err.message);
    process.exit(1);
  }
  console.log("Connected to MySQL.");

  const alterQueries = [
    "ALTER TABLE admin ADD COLUMN IF NOT EXISTS clinic_name VARCHAR(255) DEFAULT NULL",
    "ALTER TABLE admin ADD COLUMN IF NOT EXISTS logo_url TEXT DEFAULT NULL",
    "ALTER TABLE admin ADD COLUMN IF NOT EXISTS theme_color VARCHAR(20) DEFAULT NULL"
  ];

  let completed = 0;
  alterQueries.forEach((query, i) => {
    connection.query(query, (err) => {
      if (err) {
        // Column might already exist in older MySQL — try with SHOW COLUMNS fallback
        if (err.code === "ER_PARSE_ERROR") {
          // MySQL < 8.0 doesn't support ADD COLUMN IF NOT EXISTS
          const colNames = ["clinic_name", "logo_url", "theme_color"];
          const colDefs = [
            "ALTER TABLE admin ADD COLUMN clinic_name VARCHAR(255) DEFAULT NULL",
            "ALTER TABLE admin ADD COLUMN logo_url TEXT DEFAULT NULL",
            "ALTER TABLE admin ADD COLUMN theme_color VARCHAR(20) DEFAULT NULL"
          ];
          connection.query(colDefs[i], (err2) => {
            if (err2 && err2.code !== "ER_DUP_FIELDNAME") {
              console.error(`Failed to add column (${colNames[i]}):`, err2.message);
            } else {
              console.log(`✅ Column '${colNames[i]}' ready.`);
            }
            completed++;
            if (completed === alterQueries.length) {
              console.log("\n✅ Branding columns migration complete!");
              connection.end();
            }
          });
        } else if (err.code !== "ER_DUP_FIELDNAME") {
          console.error(`Error on query ${i + 1}:`, err.message);
          completed++;
          if (completed === alterQueries.length) {
            connection.end();
          }
        } else {
          console.log(`Column ${i + 1} already exists, skipping.`);
          completed++;
          if (completed === alterQueries.length) {
            console.log("\n✅ Migration complete!");
            connection.end();
          }
        }
      } else {
        console.log(`✅ Query ${i + 1} executed successfully.`);
        completed++;
        if (completed === alterQueries.length) {
          console.log("\n✅ Branding columns migration complete!");
          connection.end();
        }
      }
    });
  });
});

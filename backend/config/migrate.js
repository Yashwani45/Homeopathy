require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mysql = require("mysql2");

const connection = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || ""
});

const dbName = process.env.DB_NAME || "homeopathy db";

connection.connect((err) => {
  if (err) {
    console.error("MySQL connection failed: ", err.message);
    process.exit(1);
  }
  console.log("Connected to MySQL server.");

  // Create database if not exists
  connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``, (dbErr) => {
    if (dbErr) {
      console.error("Failed to create database: ", dbErr.message);
      connection.end();
      process.exit(1);
    }
    console.log(`Database '${dbName}' verified/created.`);

    // Now connect to the specific database
    connection.query(`USE \`${dbName}\``, (useErr) => {
      if (useErr) {
        console.error("Failed to select database: ", useErr.message);
        connection.end();
        process.exit(1);
      }

      // Check if table exists
      connection.query("DESCRIBE doctors", (descErr, columns) => {
        if (descErr) {
          console.log("Table 'doctors' does not exist or description failed. Creating table...");
          connection.query(`CREATE TABLE IF NOT EXISTS doctors (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            specialization VARCHAR(255),
            mobile VARCHAR(20),
            disease VARCHAR(255),
            shift VARCHAR(50),
            fees INT
          )`, (createErr) => {
            if (createErr) {
              console.error("Failed to create doctors table: ", createErr.message);
            } else {
              console.log("Created 'doctors' table successfully with all columns.");
            }
            connection.end();
          });
          return;
        }

        // Table exists, check columns
        const columnNames = columns.map(col => col.Field.toLowerCase());
        console.log("Current columns in doctors table: ", columnNames);

        const queries = [];
        if (!columnNames.includes("specialization")) {
          queries.push("ALTER TABLE doctors ADD COLUMN specialization VARCHAR(255)");
        }
        if (!columnNames.includes("mobile")) {
          queries.push("ALTER TABLE doctors ADD COLUMN mobile VARCHAR(20)");
        }
        if (!columnNames.includes("disease")) {
          queries.push("ALTER TABLE doctors ADD COLUMN disease VARCHAR(255)");
        }
        if (!columnNames.includes("shift")) {
          queries.push("ALTER TABLE doctors ADD COLUMN shift VARCHAR(50)");
        }
        if (!columnNames.includes("fees")) {
          queries.push("ALTER TABLE doctors ADD COLUMN fees INT");
        }

        if (queries.length === 0) {
          console.log("All columns already exist.");
          connection.end();
          return;
        }

        console.log(`Running ${queries.length} migration queries...`);
        let completed = 0;
        queries.forEach(query => {
          connection.query(query, (queryErr) => {
            if (queryErr) {
              console.error(`Failed to run query: "${query}". Error: `, queryErr.message);
            } else {
              console.log(`Query succeeded: "${query}"`);
            }
            completed++;
            if (completed === queries.length) {
              console.log("Migration completed successfully.");
              connection.end();
            }
          });
        });
      });
    });
  });
});

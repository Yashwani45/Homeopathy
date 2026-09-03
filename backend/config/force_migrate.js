require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mysql = require("mysql2");

const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "homeopathy db"
});

db.connect((err) => {
  if (err) {
    console.error("Connection failed: ", err.message);
    process.exit(1);
  }
  console.log("Connected to database for force migration.");

  const queries = [
    "ALTER TABLE doctors ADD COLUMN IF NOT EXISTS specialization VARCHAR(255)",
    "ALTER TABLE doctors ADD COLUMN IF NOT EXISTS mobile VARCHAR(20)",
    "ALTER TABLE doctors ADD COLUMN IF NOT EXISTS disease VARCHAR(255)",
    "ALTER TABLE doctors ADD COLUMN IF NOT EXISTS shift VARCHAR(50)",
    "ALTER TABLE doctors ADD COLUMN IF NOT EXISTS fees INT"
  ];

  let completed = 0;
  queries.forEach((query) => {
    // MySQL ALTER TABLE doesn't natively support "ADD COLUMN IF NOT EXISTS" in older versions, 
    // so we handle errors gracefully if the column already exists.
    db.query(query.replace(" IF NOT EXISTS", ""), (queryErr) => {
      if (queryErr) {
        if (queryErr.message.includes("Duplicate column name")) {
          console.log(`Column already exists: ${query.split(" ").pop()}`);
        } else {
          console.error(`Error running query "${query}": `, queryErr.message);
        }
      } else {
        console.log(`Successfully executed: ${query}`);
      }
      completed++;
      if (completed === queries.length) {
        console.log("Force migration completed successfully.");
        db.end();
      }
    });
  });
});

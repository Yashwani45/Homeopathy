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
    console.error("Connection error: ", err.message);
    process.exit(1);
  }
  console.log("Connected to MySQL for logo_url column alteration.");

  db.query("ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS logo_url VARCHAR(255)", (err) => {
    if (err) {
      if (err.code === "ER_DUP_FIELDNAME") {
        console.log("logo_url column already exists.");
      } else {
        console.error("Error adding logo_url column: ", err.message);
        db.end();
        process.exit(1);
      }
    } else {
      console.log("logo_url column added successfully.");
    }
    db.end();
    process.exit(0);
  });
});

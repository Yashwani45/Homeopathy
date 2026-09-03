require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mysql = require("mysql2");
const bcrypt = require("bcryptjs");

const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "homeopathy db"
});

db.connect((err) => {
  if (err) { console.error("Connection error:", err.message); process.exit(1); }

  db.query("SELECT * FROM super_admin", (err, rows) => {
    if (err) { console.error(err.message); db.end(); process.exit(1); }
    
    console.log("All super_admin rows:", JSON.stringify(rows, null, 2));
    
    // Test if 'superadmin123' matches the stored hash
    if (rows.length > 0) {
      const match = bcrypt.compareSync("superadmin123", rows[0].password);
      console.log("\nDoes 'superadmin123' match stored hash?", match);
      console.log("Stored hash:", rows[0].password);
    }
    
    db.end();
    process.exit(0);
  });
});

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
  console.log("Connected.");

  // 1. Pehle dekho kya hai table mein
  db.query("SELECT id, username, role FROM super_admin", (err, rows) => {
    if (err) {
      console.error("super_admin table error:", err.message);
      // Table nahi hai to banao
      db.query(`CREATE TABLE IF NOT EXISTS super_admin (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'super_admin'
      )`, () => {
        insertDefault();
      });
      return;
    }

    console.log("Current super_admin users:", JSON.stringify(rows));

    if (rows.length === 0) {
      insertDefault();
    } else {
      // Reset first user ka password to 'superadmin123'
      const newHash = bcrypt.hashSync("superadmin123", 10);
      db.query("UPDATE super_admin SET password = ? WHERE id = ?", [newHash, rows[0].id], (uErr) => {
        if (uErr) console.error("Update failed:", uErr.message);
        else console.log(`\n✅ Password reset successfully!\nUsername: ${rows[0].username}\nPassword: superadmin123\n`);
        db.end();
        process.exit(0);
      });
    }
  });

  function insertDefault() {
    const hash = bcrypt.hashSync("superadmin123", 10);
    db.query("INSERT INTO super_admin (username, password) VALUES ('superadmin', ?)", [hash], (iErr) => {
      if (iErr) console.error("Insert failed:", iErr.message);
      else console.log("\n✅ Super admin created!\nUsername: superadmin\nPassword: superadmin123\n");
      db.end();
      process.exit(0);
    });
  }
});

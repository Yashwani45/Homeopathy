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
  console.log("Connected to database for updates migration.");

  const queries = [
    {
      sql: "ALTER TABLE doctors ADD COLUMN image VARCHAR(255)",
      successMsg: "Added 'image' column to doctors table."
    },
    {
      sql: "ALTER TABLE bookings ADD COLUMN patient_diseases VARCHAR(255)",
      successMsg: "Added 'patient_diseases' column to bookings table."
    }
  ];

  let completed = 0;
  queries.forEach((q) => {
    db.query(q.sql, (queryErr) => {
      if (queryErr) {
        if (queryErr.message.includes("Duplicate column name")) {
          console.log(`Column already exists in table.`);
        } else {
          console.error(`Error running query "${q.sql}": `, queryErr.message);
        }
      } else {
        console.log(q.successMsg);
      }
      completed++;
      if (completed === queries.length) {
        console.log("Updates migration completed successfully.");
        db.end();
      }
    });
  });
});

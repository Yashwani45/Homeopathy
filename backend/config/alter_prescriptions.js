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
  console.log("Connected to MySQL for prescriptions table alteration.");

  const queries = [
    `ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS chief_complaints TEXT`,
    `ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS diagnosis TEXT`,
    `ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS examination_notes TEXT`,
    `ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS observations TEXT`,
    `ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS advice TEXT`,
    `ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS follow_up_date VARCHAR(100)`,
    `ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS follow_up_notes TEXT`
  ];

  let completed = 0;

  const runQuery = (index) => {
    if (index >= queries.length) {
      console.log("Prescriptions table altered successfully.");
      db.end();
      process.exit(0);
    }

    db.query(queries[index], (err) => {
      if (err) {
        if (err.code === "ER_DUP_FIELDNAME") {
          console.log(`Column already exists, skipping query ${index + 1}`);
        } else {
          console.error(`Error in query ${index + 1}: `, err.message);
        }
      } else {
        console.log(`Query ${index + 1} completed successfully.`);
      }
      runQuery(index + 1);
    });
  };

  runQuery(0);
});

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
    console.error("Migration failed: Connection error: ", err.message);
    process.exit(1);
  }
  console.log("Connected to MySQL database for migration v2.");

  const queries = [
    // 1. Create patients table
    `CREATE TABLE IF NOT EXISTS patients (
      id INT AUTO_INCREMENT PRIMARY KEY,
      patient_id VARCHAR(50) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      mobile VARCHAR(20) NOT NULL,
      age INT,
      gender VARCHAR(20),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // 2. Add columns and modify bookings
    `ALTER TABLE bookings MODIFY COLUMN id INT AUTO_INCREMENT`,
    `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS patient_id VARCHAR(50)`,
    `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS appointment_time VARCHAR(50)`,

    // 3. Add columns to doctors
    `ALTER TABLE doctors ADD COLUMN IF NOT EXISTS username VARCHAR(255) UNIQUE`,
    `ALTER TABLE doctors ADD COLUMN IF NOT EXISTS password VARCHAR(255)`,

    // 4. Create prescriptions table
    `CREATE TABLE IF NOT EXISTS prescriptions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      patient_id VARCHAR(50) NOT NULL,
      doctor_id INT NOT NULL,
      medicines TEXT NOT NULL,
      dosage VARCHAR(255),
      instructions TEXT,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // 5. Create health_records table
    `CREATE TABLE IF NOT EXISTS health_records (
      id INT AUTO_INCREMENT PRIMARY KEY,
      patient_id VARCHAR(50) NOT NULL,
      blood_pressure VARCHAR(50),
      weight VARCHAR(20),
      current_condition VARCHAR(255),
      follow_up_date DATE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`
  ];

  let completed = 0;

  const runQuery = (index) => {
    if (index >= queries.length) {
      console.log("All migrations executed successfully.");
      db.end();
      process.exit(0);
    }

    db.query(queries[index], (err) => {
      if (err) {
        // Ignore duplicate column errors if ALTER fails because column already exists in some MySQL versions
        if (err.code === "ER_DUP_FIELDNAME") {
          console.log(`Query ${index + 1} skipped: Column already exists.`);
        } else {
          console.error(`Error running migration query ${index + 1}: `, err.message);
        }
      } else {
        console.log(`Query ${index + 1} executed successfully.`);
      }
      runQuery(index + 1);
    });
  };

  runQuery(0);
});

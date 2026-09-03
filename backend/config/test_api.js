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
  
  db.query(
    `SELECT b.*, d.name as doctor_name, d.shift as doctor_shift, d.disease as doctor_disease, d.fees as doctor_fees 
     FROM bookings b 
     LEFT JOIN doctors d ON b.doctor_id = d.id`,
    (err, data) => {
      if (err) {
        console.error("SQL Error: ", err.message);
      } else {
        console.log("SQL Success. Rows returned: ", data.length);
        console.log("Sample Data: ", data.slice(0, 2));
      }
      db.end();
    }
  );
});

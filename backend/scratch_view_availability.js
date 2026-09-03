require("dotenv").config({ path: require("path").join(__dirname, "./.env") });
const mysql = require("mysql2");
const conn = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || ""
});

conn.connect((err) => {
  if (err) {
    console.error("Connection failed:", err.message);
    process.exit(1);
  }
  
  const mainDbName = process.env.DB_NAME || "super_admin_db";
  const targetDb = mainDbName === "super_admin_db" || mainDbName === "homeopathy db" ? "admin_0001" : `${mainDbName}_admin_0001`;

  conn.query(`SELECT id, name, availability FROM \`${targetDb}\`.doctors`, (err, doctors) => {
    if (err) throw err;
    console.log(`${targetDb} doctors:`);
    doctors.forEach(doc => {
      console.log(`Doctor ID: ${doc.id}, Name: ${doc.name}`);
      console.log("Availability:", doc.availability);
      console.log("-------------------");
    });
    
    conn.end();
  });
});

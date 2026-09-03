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
  console.log("Connected to MySQL server for Bookings schema check.");

  connection.query(`USE \`${dbName}\``, (useErr) => {
    if (useErr) {
      console.error("Failed to select database: ", useErr.message);
      connection.end();
      process.exit(1);
    }

    connection.query("DESCRIBE bookings", (descErr, columns) => {
      if (descErr) {
        console.error("Error describing bookings table: ", descErr.message);
        connection.end();
        process.exit(1);
      }

      const columnNames = columns.map(col => col.Field.toLowerCase());
      console.log("Current columns in bookings table: ", columnNames);

      const queries = [];
      if (!columnNames.includes("doctor_id")) {
        queries.push("ALTER TABLE bookings ADD COLUMN doctor_id INT");
      }
      if (!columnNames.includes("shift_id")) {
        queries.push("ALTER TABLE bookings ADD COLUMN shift_id INT");
      }
      if (!columnNames.includes("disease_id")) {
        queries.push("ALTER TABLE bookings ADD COLUMN disease_id INT");
      }
      if (!columnNames.includes("status")) {
        queries.push("ALTER TABLE bookings ADD COLUMN status VARCHAR(50) DEFAULT 'Pending'");
      }

      if (queries.length === 0) {
        console.log("All bookings columns already exist.");
        connection.end();
        return;
      }

      console.log(`Running ${queries.length} bookings migration queries...`);
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
            console.log("Bookings migration completed successfully.");
            connection.end();
          }
        });
      });
    });
  });
});

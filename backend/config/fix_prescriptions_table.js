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
    console.error("Connection error:", err.message);
    process.exit(1);
  }
  console.log("Connected to MySQL.");

  db.query("DESCRIBE prescriptions", (descErr, columns) => {
    if (descErr) {
      console.error("DESCRIBE prescriptions failed:", descErr.message);
      db.end();
      process.exit(1);
    }

    const existing = columns.map((c) => c.Field.toLowerCase());
    console.log("Existing columns:", existing.join(", "));

    const needed = [
      { col: "chief_complaints",  def: "TEXT" },
      { col: "diagnosis",         def: "TEXT" },
      { col: "examination_notes", def: "TEXT" },
      { col: "observations",      def: "TEXT" },
      { col: "advice",            def: "TEXT" },
      { col: "follow_up_date",    def: "VARCHAR(100)" },
      { col: "follow_up_notes",   def: "TEXT" },
      { col: "logo_url",          def: "VARCHAR(255)" },
    ];

    const toAdd = needed.filter((n) => !existing.includes(n.col));

    if (toAdd.length === 0) {
      console.log("All columns already present. Nothing to do.");
      db.end();
      process.exit(0);
    }

    console.log(`Adding ${toAdd.length} missing column(s):`, toAdd.map((c) => c.col).join(", "));

    let i = 0;
    const runNext = () => {
      if (i === toAdd.length) {
        console.log("Done! All missing columns added successfully.");
        db.end();
        process.exit(0);
      }
      const { col, def } = toAdd[i];
      db.query(`ALTER TABLE prescriptions ADD COLUMN ${col} ${def}`, (qErr) => {
        if (qErr && qErr.code !== "ER_DUP_FIELDNAME") {
          console.error(`Failed to add '${col}':`, qErr.message);
        } else {
          console.log(`Added column: ${col}`);
        }
        i++;
        runNext();
      });
    };

    runNext();
  });
});

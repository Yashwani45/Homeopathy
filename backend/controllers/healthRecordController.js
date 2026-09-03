const db = require("../database/dbConnectionManager");

/**
 * Retrieves health vitals logs for a specific patient
 */
const getHealthRecords = (req, res) => {
  const patientId = req.params.patientId;

  db.query(
    "SELECT * FROM health_records WHERE patient_id = ? AND deleted_at IS NULL ORDER BY created_at DESC",
    [patientId],
    (err, data) => {
      if (err) {
        console.error("Database query error in GET /api/health-records:", err);
        return res.status(500).json({ error: err.message });
      }
      res.json(data);
    }
  );
};

/**
 * Retrieves the single most recent vital parameters log for a patient
 */
const getLatestHealthRecord = (req, res) => {
  const patientId = req.params.patientId;

  db.query(
    "SELECT * FROM health_records WHERE patient_id = ? AND deleted_at IS NULL ORDER BY created_at DESC LIMIT 1",
    [patientId],
    (err, data) => {
      if (err) {
        console.error("Database query error in GET /api/health-records/latest:", err);
        return res.status(500).json({ error: err.message });
      }
      res.json(data[0] || null);
    }
  );
};

/**
 * Creates a new health vital record (blood pressure, weight, etc.)
 */
const addHealthRecord = (req, res) => {
  const { patient_id, blood_pressure, weight, current_condition, follow_up_date } = req.body;

  if (!patient_id) {
    return res.status(400).json({ error: "Patient ID is required." });
  }

  db.query(
    `INSERT INTO health_records 
     (patient_id, blood_pressure, weight, current_condition, follow_up_date, status)
     VALUES (?, ?, ?, ?, ?, 'Active')`,
    [
      patient_id,
      blood_pressure || null,
      weight || null,
      current_condition || null,
      follow_up_date || null
    ],
    (err, result) => {
      if (err) {
        console.error("Error adding patient health record:", err);
        return res.status(500).json({ error: err.message });
      }
      res.json({
        success: true,
        message: "Health record logged successfully",
        id: result.insertId
      });
    }
  );
};

module.exports = {
  getHealthRecords,
  getHealthHistory: getHealthRecords, // alias for route compatibility
  getLatestHealthRecord,
  addHealthRecord
};

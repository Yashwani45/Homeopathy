const db = require("../database/dbConnectionManager");

/**
 * Retrieves all doctor shifts configured inside the active tenant clinic
 */
const getShifts = (req, res) => {
  const store = db.asyncLocalStorage?.getStore();
  if (!store || store.dbName === "super_admin_db") {
    return res.json([]);
  }

  const { doctorId } = req.query;

  let query = "SELECT * FROM doctor_shifts WHERE deleted_at IS NULL";
  const params = [];

  if (doctorId) {
    query += " AND doctor_id = ?";
    params.push(parseInt(doctorId));
  }

  db.query(query, params, (err, data) => {
    if (err) {
      console.error("Database query error in GET /api/shifts:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json(data);
  });
};

/**
 * Adds a new shift for a doctor
 */
const addShift = (req, res) => {
  const { doctor_id, shift_name, start_time, end_time } = req.body;

  if (!doctor_id || !shift_name || !start_time || !end_time) {
    return res.status(400).json({ error: "Missing required shift fields: doctor_id, shift_name, start_time, end_time" });
  }

  db.query(
    `INSERT INTO doctor_shifts (doctor_id, shift_name, start_time, end_time, status)
     VALUES (?, ?, ?, ?, 'Active')`,
    [parseInt(doctor_id), shift_name.trim(), start_time, end_time],
    (err, result) => {
      if (err) {
        console.error("Error adding doctor shift:", err);
        return res.status(500).json({ error: err.message });
      }
      res.json({
        success: true,
        message: "Doctor shift recorded successfully",
        id: result.insertId
      });
    }
  );
};

module.exports = {
  getShifts,
  addShift
};

const db = require("../database/dbConnectionManager");

/**
 * Creates a new leave entry for a doctor
 */
const addLeave = (req, res) => {
  const { doctorId, startDate, endDate, reason } = req.body;
  const user = req.user;

  let finalDoctorId = doctorId;

  // Enforce doctor role to only add leaves for themselves
  if (user.role === "doctor") {
    finalDoctorId = user.id;
  }

  if (!finalDoctorId) {
    return res.status(400).json({ error: "Doctor ID is required." });
  }
  if (!startDate || !endDate) {
    return res.status(400).json({ error: "Start date and End date are required." });
  }

  db.query(
    "INSERT INTO doctor_leaves (doctor_id, start_date, end_date, reason, status) VALUES (?, ?, ?, ?, 'Approved')",
    [finalDoctorId, startDate, endDate, reason || null],
    (err, result) => {
      if (err) {
        console.error("Error adding doctor leave:", err);
        return res.status(500).json({ error: err.message });
      }
      res.json({
        success: true,
        message: "Leave applied successfully.",
        id: result.insertId
      });
    }
  );
};

/**
 * Retrieves the leaves list.
 * - Doctors get only their own leaves.
 * - Admins/Staff get leaves for all doctors.
 */
const getLeaves = (req, res) => {
  const user = req.user;

  let sql = `
    SELECT 
      l.id, 
      l.doctor_id, 
      DATE_FORMAT(l.start_date, '%Y-%m-%d') AS start_date, 
      DATE_FORMAT(l.end_date, '%Y-%m-%d') AS end_date, 
      l.reason, 
      l.status, 
      l.created_at, 
      l.updated_at, 
      l.deleted_at, 
      d.name AS doctor_name 
    FROM doctor_leaves l 
    JOIN doctors d ON l.doctor_id = d.id 
    WHERE l.deleted_at IS NULL
  `;
  const params = [];

  if (user.role === "doctor") {
    sql += " AND l.doctor_id = ?";
    params.push(user.id);
  }

  sql += " ORDER BY l.start_date DESC";

  db.query(sql, params, (err, data) => {
    if (err) {
      console.error("Error fetching doctor leaves:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json(data);
  });
};

/**
 * Updates a leave date range or reason
 */
const updateLeave = (req, res) => {
  const { id } = req.params;
  const { startDate, endDate, reason } = req.body;
  const user = req.user;

  if (!startDate || !endDate) {
    return res.status(400).json({ error: "Start date and End date are required." });
  }

  // Double check permissions (doctor can only update their own leaves)
  let sql = "UPDATE doctor_leaves SET start_date = ?, end_date = ?, reason = ? WHERE id = ?";
  const params = [startDate, endDate, reason || null, id];

  if (user.role === "doctor") {
    sql = "UPDATE doctor_leaves SET start_date = ?, end_date = ?, reason = ? WHERE id = ? AND doctor_id = ?";
    params.push(user.id);
  }

  db.query(sql, params, (err, result) => {
    if (err) {
      console.error("Error updating doctor leave:", err);
      return res.status(500).json({ error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(403).json({ error: "Access denied or leave record not found." });
    }
    res.json({
      success: true,
      message: "Leave record updated successfully."
    });
  });
};

/**
 * Soft deletes a leave entry
 */
const deleteLeave = (req, res) => {
  const { id } = req.params;
  const user = req.user;

  let sql = "UPDATE doctor_leaves SET deleted_at = NOW(), status = 'Cancelled' WHERE id = ?";
  const params = [id];

  if (user.role === "doctor") {
    sql = "UPDATE doctor_leaves SET deleted_at = NOW(), status = 'Cancelled' WHERE id = ? AND doctor_id = ?";
    params.push(user.id);
  }

  db.query(sql, params, (err, result) => {
    if (err) {
      console.error("Error deleting doctor leave:", err);
      return res.status(500).json({ error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(403).json({ error: "Access denied or leave record not found." });
    }
    res.json({
      success: true,
      message: "Leave cancelled successfully."
    });
  });
};

module.exports = {
  addLeave,
  getLeaves,
  updateLeave,
  deleteLeave
};

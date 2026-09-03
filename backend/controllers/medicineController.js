const db = require("../database/dbConnectionManager");

/**
 * Retrieves the list of medicines scoped by current tenant clinic ID
 */
const getMedicines = (req, res) => {
  const store = db.asyncLocalStorage.getStore();
  const activeAdminId = store ? store.adminId : null;

  let sql = "SELECT id, medicine_name, generic_name, description, status FROM super_admin_db.medicine_master WHERE deleted_at IS NULL";
  const params = [];

  if (activeAdminId) {
    sql += " AND (created_by IS NULL OR created_by = ?)";
    params.push(activeAdminId);
  }

  sql += " ORDER BY medicine_name ASC";

  db.query(sql, params, (err, data) => {
    if (err) {
      console.error("Database query error in GET /api/medicines:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json(data);
  });
};

/**
 * Inserts a new medicine into the central database tagged with current tenant clinic ID
 */
const addMedicine = (req, res) => {
  const { medicine_name, generic_name, description } = req.body;

  if (!medicine_name) {
    return res.status(400).json({ error: "Medicine name is required." });
  }

  const store = db.asyncLocalStorage.getStore();
  const activeAdminId = store ? store.adminId : null;

  db.query(
    "INSERT INTO super_admin_db.medicine_master (medicine_name, generic_name, description, status, created_by) VALUES (?, ?, ?, 'Active', ?)",
    [
      medicine_name.trim(),
      generic_name ? generic_name.trim() : null,
      description || null,
      activeAdminId
    ],
    (err, result) => {
      if (err) {
        console.error("Error inserting medicine:", err);
        return res.status(500).json({ error: err.message });
      }
      res.json({
        success: true,
        message: "Medicine added successfully",
        id: result.insertId
      });
    }
  );
};

/**
 * Soft deletes a medicine if it belongs to the current tenant clinic
 */
const deleteMedicine = (req, res) => {
  const { id } = req.params;
  const store = db.asyncLocalStorage.getStore();
  const activeAdminId = store ? store.adminId : null;

  let sql = "UPDATE super_admin_db.medicine_master SET deleted_at = NOW(), status = 'Inactive' WHERE id = ?";
  const params = [id];

  if (activeAdminId) {
    sql += " AND created_by = ?";
    params.push(activeAdminId);
  }

  db.query(sql, params, (err, result) => {
    if (err) {
      console.error("Error deleting medicine:", err);
      return res.status(500).json({ error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(403).json({ error: "Access denied. You can only delete medicines you created." });
    }
    res.json({
      success: true,
      message: "Medicine deactivated successfully"
    });
  });
};

module.exports = {
  getMedicines,
  addMedicine,
  deleteMedicine
};

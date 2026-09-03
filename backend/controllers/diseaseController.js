const db = require("../database/dbConnectionManager");

/**
 * Retrieves the global list of symptoms/diseases from super_admin_db.disease_types
 */
const getDiseases = (req, res) => {
  db.superAdminDb.query(
    "SELECT id, name, description, status FROM disease_types WHERE deleted_at IS NULL ORDER BY name ASC",
    (err, data) => {
      if (err) {
        console.error("Database query error in GET /api/diseases:", err);
        return res.status(500).json({ error: err.message });
      }
      res.json(data);
    }
  );
};

/**
 * Inserts a new disease classification into super_admin_db (Super Admin only)
 */
const addDisease = (req, res) => {
  const { name, description } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Disease name is required." });
  }

  db.superAdminDb.query(
    "INSERT INTO disease_types (name, description, status) VALUES (?, ?, 'Active')",
    [name.trim(), description || null],
    (err, result) => {
      if (err) {
        console.error("Error inserting global disease category:", err);
        return res.status(500).json({ error: err.message });
      }
      res.json({
        success: true,
        message: "Disease category added successfully",
        id: result.insertId
      });
    }
  );
};

/**
 * Updates a disease category inside super_admin_db
 */
const updateDisease = (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Disease name is required." });
  }

  db.superAdminDb.query(
    "UPDATE disease_types SET name = ? WHERE id = ? AND deleted_at IS NULL",
    [name.trim(), id],
    (err) => {
      if (err) {
        console.error("Error updating disease type:", err);
        return res.status(500).json({ error: err.message });
      }
      res.json({
        success: true,
        message: "Disease category updated successfully"
      });
    }
  );
};

module.exports = {
  getDiseases,
  addDisease,
  updateDisease
};

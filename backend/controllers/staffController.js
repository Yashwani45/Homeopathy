const db = require("../database/dbConnectionManager");
const bcrypt = require("bcryptjs");

/**
 * Retrieves all staff members in the current tenant clinic
 */
const getStaff = (req, res) => {
  const store = db.asyncLocalStorage?.getStore();
  if (!store || store.dbName === "super_admin_db") {
    return res.json([]);
  }

  db.query(
    "SELECT id, name, role, mobile, username, status, created_at FROM staff_members WHERE deleted_at IS NULL ORDER BY id DESC",
    (err, data) => {
      if (err) {
        console.error("Database query error in GET /api/staff:", err);
        return res.status(500).json({ error: err.message });
      }
      res.json(data);
    }
  );
};

/**
 * Registers a new staff member profile locally inside the tenant database
 */
const addStaff = (req, res) => {
  const { name, role, mobile, username, password } = req.body;

  if (!name || !role || !username || !password) {
    return res.status(400).json({ error: "Missing required fields: name, role, username, password" });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  db.query(
    `INSERT INTO staff_members (name, role, mobile, username, password, status)
     VALUES (?, ?, ?, ?, ?, 'Active')`,
    [name.trim(), role.trim(), mobile || null, username.trim(), hashedPassword],
    (err, result) => {
      if (err) {
        console.error("Error registering staff member:", err);
        return res.status(500).json({ error: err.message });
      }
      res.json({
        success: true,
        message: "Staff member registered successfully",
        id: result.insertId
      });
    }
  );
};

/**
 * Updates basic staff properties
 */
const updateStaff = (req, res) => {
  const { name, role, mobile, username, password } = req.body;
  const staffId = req.params.id;

  const fields = ["name = ?", "role = ?", "mobile = ?", "username = ?"];
  const params = [name, role, mobile || null, username];

  if (password && password.trim() !== "") {
    const hashedPassword = bcrypt.hashSync(password, 10);
    fields.push("password = ?");
    params.push(hashedPassword);
  }

  params.push(staffId);

  db.query(
    `UPDATE staff_members SET ${fields.join(", ")} WHERE id = ? AND deleted_at IS NULL`,
    params,
    (err) => {
      if (err) {
        console.error("Error updating staff profile:", err);
        return res.status(500).json({ error: err.message });
      }
      res.json({ success: true, message: "Staff profile updated successfully" });
    }
  );
};

/**
 * Soft deletes staff profile
 */
const deleteStaff = (req, res) => {
  const staffId = req.params.id;

  db.query(
    "UPDATE staff_members SET deleted_at = NOW(), status = 'Inactive' WHERE id = ?",
    [staffId],
    (err) => {
      if (err) {
        console.error("Error deleting staff member:", err);
        return res.status(500).json({ error: err.message });
      }
      res.json({ success: true, message: "Staff member deactivated successfully" });
    }
  );
};

module.exports = {
  getStaff,
  addStaff,
  updateStaff,
  deleteStaff
};

const db = require("../database/dbConnectionManager");
const bcrypt = require("bcryptjs");

/**
 * Retrieves all doctors, joining with super_admin_db.doctor_specializations for names
 * and extracting the shift and disease dynamically from availability JSON.
 */
const getDoctors = (req, res) => {
  const store = db.asyncLocalStorage?.getStore();
  if (!store || store.dbName === "super_admin_db") {
    return res.json([]);
  }

  const { status } = req.query;
  let query = `
    SELECT d.*, 
           s.specialization_name AS specialization,
           COALESCE(JSON_UNQUOTE(JSON_EXTRACT(d.availability, '$.shift')), 'Morning') AS shift,
           COALESCE(JSON_UNQUOTE(JSON_EXTRACT(d.availability, '$.disease')), 'General Consultation') AS disease
    FROM doctors d 
    LEFT JOIN super_admin_db.doctor_specializations s ON d.specialization_id = s.id 
    WHERE d.deleted_at IS NULL
  `;
  const params = [];

  if (status) {
    query += " AND d.status = ?";
    params.push(status);
  }

  query += " ORDER BY d.id DESC";

  db.query(query, params, (err, data) => {
    if (err) {
      console.error("Database query error in GET /api/doctors:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json(data);
  });
};

/**
 * Helper to find or create doctor specialization ID by name or direct ID
 */
const resolveSpecializationId = (specializationId, specializationName, callback) => {
  const idNum = parseInt(specializationId);
  if (!isNaN(idNum) && idNum > 0) {
    return callback(null, idNum);
  }

  if (!specializationName || typeof specializationName !== "string" || specializationName.trim() === "") {
    return callback(new Error("Specialization is required"));
  }

  const cleanName = specializationName.trim();
  
  db.query(
    "SELECT id FROM super_admin_db.doctor_specializations WHERE LOWER(specialization_name) = LOWER(?)",
    [cleanName],
    (err, results) => {
      if (err) return callback(err);

      if (results && results.length > 0) {
        return callback(null, results[0].id);
      }

      db.query(
        "INSERT INTO super_admin_db.doctor_specializations (specialization_name) VALUES (?)",
        [cleanName],
        (err, result) => {
          if (err) return callback(err);
          callback(null, result.insertId);
        }
      );
    }
  );
};

/**
 * Registers a new Doctor profile inside the active tenant clinic database
 */
const addDoctor = (req, res) => {
  const { name, specialization, specialization_id, mobile, fees, username, password, availability, shift, disease, image } = req.body;

  if (!name || (!specialization_id && !specialization) || !username || !password) {
    return res.status(400).json({ error: "Missing required doctor fields: name, specialization, username, password" });
  }

  resolveSpecializationId(specialization_id, specialization, (err, resolvedSpecId) => {
    if (err) {
      console.error("Error resolving specialization ID:", err);
      return res.status(500).json({ error: err.message });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const shiftVal = shift || "Morning";
    let finalAvailObj = {
      days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      startTime: shiftVal === "Morning" ? "10:00 AM" : "05:00 PM",
      endTime: shiftVal === "Morning" ? "01:00 PM" : "08:00 PM",
      slotDuration: 30,
      blockedDates: [],
      shift: shiftVal,
      disease: disease || "General Consultation"
    };

    if (availability) {
      let parsed = {};
      if (typeof availability === "string") {
        try { parsed = JSON.parse(availability); } catch (e) {}
      } else if (typeof availability === "object" && availability !== null) {
        parsed = availability;
      }
      finalAvailObj = { ...finalAvailObj, ...parsed };
    }
    
    if (shiftVal) finalAvailObj.shift = shiftVal;
    if (disease) finalAvailObj.disease = disease;

    const defaultAvailability = JSON.stringify(finalAvailObj);

    db.query(
      `INSERT INTO doctors 
       (name, specialization_id, mobile, fees, username, password, availability, status, image) 
       VALUES (?, ?, ?, ?, ?, ?, ?, 'Active', ?)`,
      [
        name.trim(),
        resolvedSpecId,
        mobile || null,
        parseInt(fees || 0),
        username.trim(),
        hashedPassword,
        defaultAvailability,
        image || null
      ],
      (err, result) => {
        if (err) {
          console.error("Error adding doctor profile:", err);
          return res.status(500).json({ error: err.message });
        }
        res.json({
          success: true,
          message: "Doctor profile registered successfully",
          id: result.insertId
        });
      }
    );
  });
};

/**
 * Updates basic doctor properties
 */
const updateDoctor = (req, res) => {
  const { name, specialization, specialization_id, mobile, fees, username, password, availability, shift, disease, image } = req.body;
  const doctorId = req.params.id;

  resolveSpecializationId(specialization_id, specialization, (err, resolvedSpecId) => {
    if (err) {
      console.error("Error resolving specialization ID during update:", err);
      return res.status(500).json({ error: err.message });
    }

    // Retrieve existing availability to merge the shift update
    db.query("SELECT availability FROM doctors WHERE id = ?", [doctorId], (availErr, availRes) => {
      let currentAvail = {
        days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        startTime: "10:00 AM",
        endTime: "01:00 PM",
        slotDuration: 30,
        blockedDates: [],
        shift: "Morning",
        disease: "General Consultation"
      };

      if (!availErr && availRes && availRes[0] && availRes[0].availability) {
        try {
          currentAvail = JSON.parse(availRes[0].availability);
        } catch (e) {}
      }

      if (availability) {
        let parsedAvail = {};
        if (typeof availability === "string") {
          try {
            parsedAvail = JSON.parse(availability);
          } catch (e) {
            console.error("Error parsing doctor availability during update:", e);
          }
        } else if (typeof availability === "object" && availability !== null) {
          parsedAvail = availability;
        }
        currentAvail = { ...currentAvail, ...parsedAvail };
      }

      if (shift) {
        currentAvail.shift = shift;
        currentAvail.startTime = shift === "Morning" ? "10:00 AM" : "05:00 PM";
        currentAvail.endTime = shift === "Morning" ? "01:00 PM" : "08:00 PM";
      }

      if (disease) {
        currentAvail.disease = disease;
      }

      const finalAvailability = JSON.stringify(currentAvail);

      const fields = [
        "name = ?",
        "specialization_id = ?",
        "mobile = ?",
        "fees = ?",
        "username = ?",
        "availability = ?"
      ];
      const params = [
        name,
        resolvedSpecId,
        mobile || null,
        parseInt(fees || 0),
        username,
        finalAvailability
      ];

      if (password && password.trim() !== "") {
        const hashedPassword = bcrypt.hashSync(password, 10);
        fields.push("password = ?");
        params.push(hashedPassword);
      }

      if (image !== undefined) {
        fields.push("image = ?");
        params.push(image);
      }

      params.push(doctorId);

      db.query(
        `UPDATE doctors SET ${fields.join(", ")} WHERE id = ? AND deleted_at IS NULL`,
        params,
        (err) => {
          if (err) {
            console.error("Error updating doctor profile:", err);
            return res.status(500).json({ error: err.message });
          }
          res.json({ success: true, message: "Doctor profile updated successfully" });
        }
      );
    });
  });
};

/**
 * Toggles doctor status between Active and Inactive
 */
const toggleDoctorStatus = (req, res) => {
  const doctorId = req.params.id;

  db.query(
    "SELECT status FROM doctors WHERE id = ? AND deleted_at IS NULL",
    [doctorId],
    (err, results) => {
      if (err) {
        console.error("Error fetching doctor status:", err);
        return res.status(500).json({ error: err.message });
      }
      if (!results || results.length === 0) {
        return res.status(404).json({ error: "Doctor not found" });
      }

      const currentStatus = results[0].status || "Active";
      const newStatus = currentStatus === "Active" ? "Inactive" : "Active";

      db.query(
        "UPDATE doctors SET status = ? WHERE id = ?",
        [newStatus, doctorId],
        (updateErr) => {
          if (updateErr) {
            console.error("Error updating doctor status:", updateErr);
            return res.status(500).json({ error: updateErr.message });
          }
          res.json({
            success: true,
            message: `Doctor status updated to ${newStatus}`,
            status: newStatus
          });
        }
      );
    }
  );
};

module.exports = {
  getDoctors,
  addDoctor,
  updateDoctor,
  toggleDoctorStatus
};

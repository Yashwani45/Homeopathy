const db = require("../database/dbConnectionManager");
const bcrypt = require("bcryptjs");

/**
 * Generates a unique Patient ID based on a random suffix
 */
const generatePatientId = (callback) => {
  const store = db.asyncLocalStorage.getStore();
  const adminId = store ? store.adminId : null;

  const getPrefixAndGenerate = (prefix) => {
    const generateId = () => {
      const cleanPrefix = (prefix || "P").trim();
      const id = `${cleanPrefix}-${Math.floor(10000 + Math.random() * 90000)}`;
      db.query("SELECT COUNT(*) as count FROM patients WHERE patient_id = ?", [id], (err, result) => {
        if (err) {
          console.error("Error checking patient ID uniqueness: ", err);
          return callback(id);
        }
        if (result && result[0] && result[0].count > 0) {
          generateId();
        } else {
          callback(id);
        }
      });
    };

    if (store) {
      db.asyncLocalStorage.run(store, () => {
        generateId();
      });
    } else {
      generateId();
    }
  };

  if (adminId) {
    db.superAdminDb.query("SELECT patient_prefix FROM admins WHERE id = ?", [adminId], (err, results) => {
      const prefix = (results && results[0] && results[0].patient_prefix) || "P";
      getPrefixAndGenerate(prefix);
    });
  } else {
    getPrefixAndGenerate("P");
  }
};

/**
 * Retrieves patients, joining with super_admin_db.disease_types for disease area names
 */
const getPatients = (req, res) => {
  const store = db.asyncLocalStorage?.getStore();
  if (!store || store.dbName === "super_admin_db") {
    return res.json([]);
  }

  const query = `
    SELECT p.*, d.name as disease_name,
    (SELECT COUNT(*) FROM appointments b WHERE b.patient_id = p.patient_id AND b.deleted_at IS NULL) as total_appointments
    FROM patients p
    LEFT JOIN super_admin_db.disease_types d ON p.disease_type_id = d.id
    WHERE p.deleted_at IS NULL
    ORDER BY p.created_at DESC
  `;

  db.query(query, (err, data) => {
    if (err) {
      console.error("Error fetching patients directory:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json(data);
  });
};

/**
 * Searches patients
 */
const searchPatients = (req, res) => {
  const searchStr = `%${req.query.q || ""}%`;
  db.query(
    `SELECT p.*, d.name as disease_name 
     FROM patients p
     LEFT JOIN super_admin_db.disease_types d ON p.disease_type_id = d.id
     WHERE (p.patient_id LIKE ? OR p.name LIKE ? OR p.mobile LIKE ?) AND p.deleted_at IS NULL 
     LIMIT 20`,
    [searchStr, searchStr, searchStr],
    (err, data) => {
      if (err) {
        console.error("Error searching patients:", err);
        return res.status(500).json({ error: err.message });
      }
      res.json(data);
    }
  );
};

/**
 * Guest profile retrieval
 */
/**
 * Guest profile retrieval (supports cross-tenant lookup by Patient ID or Mobile)
 */
const getPublicPatientProfile = (req, res) => {
  const rawId = (req.params.patientId || "").trim();
  if (!rawId) {
    return res.status(400).json({ error: "Patient ID or Mobile is required" });
  }

  const queryAdminId = req.query.adminId || req.headers["x-tenant-id"];

  // Helper to query a specific tenant database pool
  const queryTenant = (dbName, adminInfo) => {
    return new Promise((resolve) => {
      try {
        const pool = db.getTenantConnection(dbName);
        const searchTerms = [rawId];
        if (/^\d+$/.test(rawId)) {
          searchTerms.push(`P-${rawId}`);
        } else if (/^p-?\d+/i.test(rawId)) {
          const numOnly = rawId.replace(/^[a-z]-?/i, "");
          searchTerms.push(`P-${numOnly}`);
          searchTerms.push(numOnly);
        }

        const placeholders = searchTerms.map(() => "?").join(", ");
        const querySql = `
          SELECT patient_id, name, mobile, age, gender, disease_type_id 
          FROM patients 
          WHERE (patient_id IN (${placeholders}) OR mobile IN (${placeholders}))
            AND deleted_at IS NULL 
          LIMIT 1
        `;
        const params = [...searchTerms, ...searchTerms];

        pool.query(querySql, params, (err, rows) => {
          if (!err && rows && rows.length > 0) {
            resolve({
              ...rows[0],
              admin_id: adminInfo.id,
              clinic_name: adminInfo.admin_name
            });
          } else {
            resolve(null);
          }
        });
      } catch (e) {
        resolve(null);
      }
    });
  };

  function searchAllClinics() {
    db.superAdminDb.query(
      "SELECT id, admin_name, database_name FROM admins WHERE database_name IS NOT NULL AND deleted_at IS NULL AND status = 'Active'",
      async (err, admins) => {
        if (err || !admins || admins.length === 0) {
          return res.status(404).json({ error: "No active clinics found" });
        }

        for (const admin of admins) {
          try {
            const patient = await queryTenant(admin.database_name, admin);
            if (patient) {
              return res.json({ success: true, profile: patient });
            }
          } catch (e) {
            console.error("Error searching clinic:", e);
          }
        }

        return res.status(404).json({ error: "Patient not found with ID: " + rawId });
      }
    );
  }

  // If a specific adminId is specified:
  if (queryAdminId) {
    db.superAdminDb.query(
      "SELECT id, admin_name, database_name FROM admins WHERE id = ? AND deleted_at IS NULL AND status = 'Active'",
      [parseInt(queryAdminId)],
      async (err, admins) => {
        if (!err && admins && admins.length > 0 && admins[0].database_name) {
          const patient = await queryTenant(admins[0].database_name, admins[0]);
          if (patient) {
            return res.json({ success: true, profile: patient });
          }
        }
        // If not found in specified clinic, fall back to searching all clinics
        searchAllClinics();
      }
    );
    return;
  }

  searchAllClinics();
};

/**
 * Detailed profile retrieval
 */
const getPatientProfile = (req, res) => {
  const patientId = req.params.patientId;

  db.query(
    `SELECT p.*, d.name as disease_name 
     FROM patients p 
     LEFT JOIN super_admin_db.disease_types d ON p.disease_type_id = d.id 
     WHERE p.patient_id = ? AND p.deleted_at IS NULL`,
    [patientId],
    (err, pResult) => {
      if (err) {
        console.error("Error fetching profile:", err);
        return res.status(500).json({ error: err.message });
      }

      if (pResult.length === 0) {
        return res.status(404).json({ error: "Patient not found" });
      }

      const patient = pResult[0];

      // Fetch appointments
      db.query(
        `SELECT b.*, doc.name as doctor_name 
         FROM appointments b
         LEFT JOIN doctors doc ON b.doctor_id = doc.id
         WHERE b.patient_id = ? AND b.deleted_at IS NULL
         ORDER BY b.date DESC`,
        [patientId],
        (bErr, appointments) => {
          if (bErr) {
            console.error("Error fetching appointments:", bErr);
            return res.status(500).json({ error: bErr.message });
          }

          // Fetch prescriptions
          db.query(
            `SELECT pr.*, doc.name as doctor_name, COALESCE(pr.medicines, med.medicine_name) AS medicines 
             FROM prescriptions pr
             LEFT JOIN doctors doc ON pr.doctor_id = doc.id
             LEFT JOIN super_admin_db.medicine_master med ON pr.medicine_id = med.id
             WHERE pr.patient_id = ? AND pr.deleted_at IS NULL
             ORDER BY pr.created_at DESC`,
            [patientId],
            (prErr, prescriptions) => {
              if (prErr) {
                console.error("Error fetching prescriptions:", prErr);
                return res.status(500).json({ error: prErr.message });
              }

              // Fetch health records (vitals)
              db.query(
                "SELECT * FROM health_records WHERE patient_id = ? AND deleted_at IS NULL ORDER BY created_at DESC",
                [patientId],
                (hErr, healthRecords) => {
                  if (hErr) {
                    console.error("Error fetching health logs:", hErr);
                    return res.status(500).json({ error: hErr.message });
                  }

                  res.json({
                    success: true,
                    profile: patient,
                    appointments,
                    prescriptions,
                    healthRecords,
                    latestVitals: healthRecords[0] || null
                  });
                }
              );
            }
          );
        }
      );
    }
  );
};

/**
 * Updates patient's basic profile details
 */
const updatePatientProfile = (req, res) => {
  const { age, gender, name, mobile, disease_type_id, password } = req.body;
  const patientId = req.params.patientId;

  const fields = [
    "age = ?",
    "gender = ?",
    "name = ?",
    "mobile = ?",
    "disease_type_id = ?"
  ];
  const params = [
    parseInt(age) || null,
    gender || null,
    name,
    mobile,
    disease_type_id ? parseInt(disease_type_id) : null
  ];

  if (password && password.trim() !== "") {
    const hashedPassword = bcrypt.hashSync(password, 10);
    fields.push("password = ?");
    params.push(hashedPassword);
  }

  params.push(patientId);

  db.query(
    `UPDATE patients SET ${fields.join(", ")} WHERE patient_id = ? AND deleted_at IS NULL`,
    params,
    (err) => {
      if (err) {
        console.error("Error updating patient profile:", err);
        return res.status(500).json({ error: err.message });
      }
      res.json({ success: true, message: "Patient profile updated successfully" });
    }
  );
};

/**
 * Auto-registers patient or links existing profile based on mobile
 */
const resolveOrCreatePatient = (req, res) => {
  const { booking_id, patient_name, mobile, disease_type_id } = req.body;

  if (!booking_id || !patient_name || !mobile) {
    return res.status(400).json({ error: "Missing resolve fields: booking_id, patient_name, mobile" });
  }

  db.query("SELECT * FROM patients WHERE mobile = ? AND deleted_at IS NULL", [mobile], (err, results) => {
    if (err) {
      console.error("Error checking patients:", err);
      return res.status(500).json({ error: err.message });
    }

    const linkAndReturn = (patientId) => {
      db.query(
        "UPDATE appointments SET patient_id = ? WHERE booking_id = ? AND deleted_at IS NULL",
        [patientId, booking_id],
        (updateErr) => {
          if (updateErr) return res.status(500).json({ error: updateErr.message });
          res.json({ success: true, patient_id: patientId });
        }
      );
    };

    if (results.length > 0) {
      linkAndReturn(results[0].patient_id);
    } else {
      generatePatientId((newId) => {
        // Default password to mobile number
        const defaultPassword = mobile;

        db.query(
          `INSERT INTO patients (patient_id, name, mobile, password, disease_type_id, status) 
           VALUES (?, ?, ?, ?, ?, 'Active')`,
          [newId, patient_name, mobile, defaultPassword, disease_type_id ? parseInt(disease_type_id) : null],
          (insertErr) => {
            if (insertErr) {
              console.error("Failed to auto-register patient profile:", insertErr);
              return res.status(500).json({ error: insertErr.message });
            }
            linkAndReturn(newId);
          }
        );
      });
    }
  });
};

module.exports = {
  getPatients,
  searchPatients,
  getPublicPatientProfile,
  getPatientProfile,
  updatePatientProfile,
  resolveOrCreatePatient
};

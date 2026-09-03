const db = require("../database/dbConnectionManager");
const bcrypt = require("bcryptjs");
const { sendWhatsAppAlert } = require("../services/whatsappService");

/**
 * Generates a random alphanumeric password
 */
const generatePassword = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let pwd = "";
  for (let i = 0; i < 7; i++) {
    pwd += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pwd;
};

/**
 * Generates a unique Patient ID
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
 * Creates a new booking / appointment
 */
const createAppointment = (req, res) => {
  const { patient_id, patient_name, mobile, doctor_id, date, appointment_time, patient_diseases, age, gender, disease_type_id } = req.body;

  if (!patient_name || !mobile || !doctor_id || !date) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const saveBooking = (patientId, rawPassword = null, isNewPatient = false) => {
    db.query("SELECT COUNT(*) as count FROM appointments", (countErr, countResult) => {
      if (countErr) return res.status(500).json({ error: countErr.message });
      
      const count = countResult && countResult[0] ? countResult[0].count : 0;
      const booking_id = "BK" + String(count + 1).padStart(3, "0");

      db.query(
        `INSERT INTO appointments 
        (booking_id, patient_name, mobile, doctor_id, date, status, patient_diseases, patient_id, appointment_time)
        VALUES (?, ?, ?, ?, ?, 'Pending', ?, ?, ?)`,
        [
          booking_id,
          patient_name.trim(),
          mobile,
          parseInt(doctor_id),
          date,
          patient_diseases || "Consultation",
          patientId,
          appointment_time || "10:00 AM"
        ],
        (insertErr) => {
          if (insertErr) {
            console.error("Error inserting appointment:", insertErr);
            return res.status(500).json({ error: insertErr.message });
          }

          db.query("SELECT name FROM doctors WHERE id = ?", [doctor_id], (docErr, docResult) => {
            const doctorName = docResult && docResult[0] ? docResult[0].name : "Doctor";
            const displayPassword = isNewPatient ? rawPassword : "[Your Existing Password]";
            sendWhatsAppAlert(patient_name, mobile, doctorName, date, appointment_time || "10:00 AM", patientId, displayPassword);

            res.json({
              success: true,
              message: "Appointment created successfully",
              booking_id,
              patient_id: patientId,
              password: rawPassword,
              isNewPatient
            });
          });
        }
      );
    });
  };

  if (patient_id) {
    db.query("SELECT * FROM patients WHERE patient_id = ? AND deleted_at IS NULL", [patient_id], (err, pResult) => {
      if (err) return res.status(500).json({ error: err.message });

      if (pResult.length > 0) {
        const activePatientId = pResult[0].patient_id;
        const updateFields = [];
        const updateParams = [];
        if (age) {
          updateFields.push("age = ?");
          updateParams.push(parseInt(age));
        }
        if (gender) {
          updateFields.push("gender = ?");
          updateParams.push(gender);
        }
        if (disease_type_id) {
          updateFields.push("disease_type_id = ?");
          updateParams.push(parseInt(disease_type_id));
        }

        if (updateFields.length > 0) {
          db.query(
            `UPDATE patients SET ${updateFields.join(", ")} WHERE patient_id = ?`,
            [...updateParams, activePatientId],
            (updateErr) => {
              if (updateErr) console.warn("Failed to update patient details during booking:", updateErr.message);
              saveBooking(activePatientId, null, false);
            }
          );
        } else {
          saveBooking(activePatientId, null, false);
        }
      } else {
        saveBooking(patient_id, null, false);
      }
    });
  } else {
    db.query("SELECT * FROM patients WHERE mobile = ? AND deleted_at IS NULL", [mobile], (err, pResult) => {
      if (err) return res.status(500).json({ error: err.message });

      if (pResult.length > 0) {
        const activePatientId = pResult[0].patient_id;
        const updateFields = [];
        const updateParams = [];
        if (age) {
          updateFields.push("age = ?");
          updateParams.push(parseInt(age));
        }
        if (gender) {
          updateFields.push("gender = ?");
          updateParams.push(gender);
        }
        if (disease_type_id) {
          updateFields.push("disease_type_id = ?");
          updateParams.push(parseInt(disease_type_id));
        }

        if (updateFields.length > 0) {
          db.query(
            `UPDATE patients SET ${updateFields.join(", ")} WHERE patient_id = ?`,
            [...updateParams, activePatientId],
            (updateErr) => {
              if (updateErr) console.warn("Failed to update patient profile during booking:", updateErr.message);
              saveBooking(activePatientId, null, false);
            }
          );
        } else {
          saveBooking(activePatientId, null, false);
        }
      } else {
        // Register new patient
        generatePatientId((newId) => {
          const rawPassword = generatePassword();

          db.query(
            `INSERT INTO patients (patient_id, name, mobile, password, age, gender, disease_type_id, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, 'Active')`,
            [
              newId,
              patient_name.trim(),
              mobile,
              rawPassword,
              age ? parseInt(age) : null,
              gender || null,
              disease_type_id ? parseInt(disease_type_id) : null
            ],
            (pInsertErr) => {
              if (pInsertErr) return res.status(500).json({ error: pInsertErr.message });
              saveBooking(newId, rawPassword, true);
            }
          );
        });
      }
    });
  }
};

/**
 * Fetches appointments for a patient
 */
const getPatientAppointments = (req, res) => {
  db.query(
    `SELECT b.*, doc.name as doctor_name 
     FROM appointments b
     LEFT JOIN doctors doc ON b.doctor_id = doc.id
     WHERE b.patient_id = ? AND b.deleted_at IS NULL
     ORDER BY b.date DESC`,
    [req.params.patientId],
    (err, data) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(data);
    }
  );
};

/**
 * Updates status of an appointment
 */
const updateAppointmentStatus = (req, res) => {
  const { status } = req.body;
  db.query(
    "UPDATE appointments SET status = ? WHERE id = ? AND deleted_at IS NULL",
    [status, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, message: "Appointment status updated" });
    }
  );
};

module.exports = {
  createAppointment,
  getPatientAppointments,
  updateAppointmentStatus
};

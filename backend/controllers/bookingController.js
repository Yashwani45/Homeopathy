const db = require("../database/dbConnectionManager");
const bcrypt = require("bcryptjs");
const { sendWhatsAppAlert } = require("../services/whatsappService");

/**
 * Generates a random 7-character password
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
 * Books an appointment
 */
const bookAppointment = (req, res) => {
  const { patient_name, mobile, doctor_id, date, appointment_time, patient_diseases, age, gender, disease_type_id } = req.body;

  if (!patient_name || !mobile || !doctor_id || !date) {
    return res.status(400).json({ error: "Missing required booking fields: patient_name, mobile, doctor_id, date" });
  }

  db.query("SELECT * FROM patients WHERE mobile = ? AND deleted_at IS NULL", [mobile], (err, pResult) => {
    if (err) {
      console.error("Error checking patients:", err);
      return res.status(500).json({ error: err.message });
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
                message: "Appointment booked successfully",
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

    if (pResult.length > 0) {
      const patientId = pResult[0].patient_id;
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
          [...updateParams, patientId],
          (updateErr) => {
            if (updateErr) console.warn("Failed to update patient details during booking:", updateErr.message);
            saveBooking(patientId, null, false);
          }
        );
      } else {
        saveBooking(patientId, null, false);
      }
    } else {
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
            if (pInsertErr) {
              console.error("Error registering patient during booking:", pInsertErr);
              return res.status(500).json({ error: pInsertErr.message });
            }
            saveBooking(newId, rawPassword, true);
          }
        );
      });
    }
  });
};

/**
 * Rebooks an appointment
 */
const rebookAppointment = (req, res) => {
  const { patient_id, patient_name, doctor_id, date, appointment_time, patient_diseases } = req.body;

  if (!patient_id || !patient_name || !doctor_id || !date) {
    return res.status(400).json({ error: "Missing required rebooking fields." });
  }

  db.query("SELECT mobile FROM patients WHERE patient_id = ? AND deleted_at IS NULL", [patient_id], (err, pResult) => {
    if (err || pResult.length === 0) {
      return res.status(404).json({ error: "Patient ID not found." });
    }

    const mobile = pResult[0].mobile;

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
          patient_id,
          appointment_time || "10:00 AM"
        ],
        (insertErr) => {
          if (insertErr) return res.status(500).json({ error: insertErr.message });

          db.query("SELECT name FROM doctors WHERE id = ?", [doctor_id], (docErr, docResult) => {
            const doctorName = docResult && docResult[0] ? docResult[0].name : "Doctor";
            sendWhatsAppAlert(patient_name, mobile, doctorName, date, appointment_time || "10:00 AM", patient_id, "[Your Existing Password]");
            
            res.json({
              success: true,
              message: "Appointment rebooked successfully",
              booking_id,
              patient_id
            });
          });
        }
      );
    });
  });
};

/**
 * Gets booking records for active clinic
 */
const getBookings = (req, res) => {
  const store = db.asyncLocalStorage?.getStore();
  if (!store || store.dbName === "super_admin_db") {
    return res.json([]);
  }

  db.query(
    `SELECT a.*, d.name as doctor_name, d.fees as doctor_fees 
     FROM appointments a 
     LEFT JOIN doctors d ON a.doctor_id = d.id
     WHERE a.deleted_at IS NULL
     ORDER BY a.date DESC, a.id DESC`,
    (err, data) => {
      if (err) {
        console.error("Error fetching appointments list:", err);
        return res.status(500).json({ error: err.message });
      }
      res.json(data);
    }
  );
};

/**
 * Updates status of a booking
 */
const updateBookingStatus = (req, res) => {
  const { status } = req.body;
  const bookingId = req.params.id;

  db.query(
    "UPDATE appointments SET status = ? WHERE id = ? AND deleted_at IS NULL",
    [status, bookingId],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.send("Status updated");
    }
  );
};

module.exports = {
  bookAppointment,
  rebookAppointment,
  getBookings,
  updateBookingStatus
};

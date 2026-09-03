const db = require("../database/dbConnectionManager");

/**
 * Retrieves all prescriptions registered across the active clinic (for Admin dashboard)
 */
const getPrescriptions = (req, res) => {
  db.query(
    `SELECT p.*, doc.name as doctor_name, COALESCE(p.medicines, med.medicine_name) AS medicines 
     FROM prescriptions p 
     LEFT JOIN doctors doc ON p.doctor_id = doc.id 
     LEFT JOIN super_admin_db.medicine_master med ON p.medicine_id = med.id
     WHERE p.deleted_at IS NULL 
     ORDER BY p.created_at DESC`,
    (err, data) => {
      if (err) {
        console.error("Database query error in GET /api/prescriptions:", err);
        return res.status(500).json({ error: err.message });
      }
      res.json(data);
    }
  );
};

/**
 * Retrieves prescriptions registered for a specific patient
 */
const getPatientPrescriptions = (req, res) => {
  const { patientId } = req.params;

  db.query(
    `SELECT p.*, doc.name as doctor_name, COALESCE(p.medicines, med.medicine_name) AS medicines 
     FROM prescriptions p 
     LEFT JOIN doctors doc ON p.doctor_id = doc.id 
     LEFT JOIN super_admin_db.medicine_master med ON p.medicine_id = med.id
     WHERE p.patient_id = ? AND p.deleted_at IS NULL 
     ORDER BY p.created_at DESC`,
    [patientId],
    (err, data) => {
      if (err) {
        console.error("Database query error in GET /api/prescriptions/patient:", err);
        return res.status(500).json({ error: err.message });
      }
      res.json(data);
    }
  );
};

/**
 * Creates a new prescription
 */
const addPrescription = (req, res) => {
  const {
    patient_id,
    doctor_id,
    medicine_id,
    medicines,
    dosage,
    instructions,
    notes,
    chief_complaints,
    diagnosis,
    examination_notes,
    observations,
    advice,
    follow_up_date,
    follow_up_notes,
    logo_url,
    category,
    address,
    next_of_kin,
    visit_type,
    referred_by,
    occupation,
    visit_validity
  } = req.body;

  if (!patient_id || !doctor_id) {
    return res.status(400).json({ error: "Patient ID and Doctor ID are required." });
  }

  db.query(
    `INSERT INTO prescriptions 
     (patient_id, doctor_id, medicine_id, medicines, dosage, instructions, notes, chief_complaints, diagnosis, 
      examination_notes, observations, advice, follow_up_date, follow_up_notes, logo_url, status,
      category, address, next_of_kin, visit_type, referred_by, occupation, visit_validity)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Active', ?, ?, ?, ?, ?, ?, ?)`,
    [
      patient_id,
      parseInt(doctor_id),
      medicine_id ? parseInt(medicine_id) : null,
      medicines || null,
      dosage || null,
      instructions || null,
      notes || null,
      chief_complaints || null,
      diagnosis || null,
      examination_notes || null,
      observations || null,
      advice || null,
      follow_up_date || null,
      follow_up_notes || null,
      logo_url || null,
      category || null,
      address || null,
      next_of_kin || null,
      visit_type || null,
      referred_by || null,
      occupation || null,
      visit_validity || null
    ],
    (err, result) => {
      if (err) {
        console.error("Error creating prescription:", err);
        return res.status(500).json({ error: err.message });
      }
      res.json({
        success: true,
        message: "Prescription recorded successfully",
        id: result.insertId
      });
    }
  );
};

/**
 * Fetches single prescription details
 */
const getPrescriptionById = (req, res) => {
  const prescriptionId = req.params.id;

  db.query(
    `SELECT p.*, doc.name as doctor_name, COALESCE(p.medicines, med.medicine_name) AS medicines, med.generic_name
     FROM prescriptions p 
     LEFT JOIN doctors doc ON p.doctor_id = doc.id 
     LEFT JOIN super_admin_db.medicine_master med ON p.medicine_id = med.id
     WHERE p.id = ? AND p.deleted_at IS NULL`,
    [prescriptionId],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      if (results.length === 0) return res.status(404).json({ error: "Prescription not found" });
      res.json(results[0]);
    }
  );
};

module.exports = {
  getPrescriptions,
  getPatientPrescriptions,
  addPrescription,
  getPrescriptionById
};

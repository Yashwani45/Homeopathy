const db = require("../database/dbConnectionManager");

/**
 * Sets a doctor's availability/shift schedule (as a JSON configuration object)
 */
const setDoctorShifts = (req, res) => {
  const {
    doctorId,
    days,
    startTime,
    endTime,
    morningStartTime,
    morningEndTime,
    eveningStartTime,
    eveningEndTime,
    slotDuration,
    blockedDates
  } = req.body;

  if (!doctorId) {
    return res.status(400).json({ error: "Doctor ID is required" });
  }

  const availabilityObj = {
    days: days || [],
    startTime: startTime || "10:00 AM",
    endTime: endTime || "01:00 PM",
    morningStartTime: morningStartTime || null,
    morningEndTime: morningEndTime || null,
    eveningStartTime: eveningStartTime || null,
    eveningEndTime: eveningEndTime || null,
    slotDuration: parseInt(slotDuration || 30),
    blockedDates: blockedDates || []
  };

  db.query(
    "UPDATE doctors SET availability = ? WHERE id = ? AND deleted_at IS NULL",
    [JSON.stringify(availabilityObj), doctorId],
    (err) => {
      if (err) {
        console.error("Error setting doctor shifts:", err);
        return res.status(500).json({ error: err.message });
      }
      res.json({ success: true, message: "Shift schedule saved successfully" });
    }
  );
};

/**
 * Retrieves appointments for a specific doctor
 */
const getDoctorAppointments = (req, res) => {
  const { doctorId } = req.query;

  if (!doctorId) {
    return res.status(400).json({ error: "Doctor ID is required" });
  }

  db.query(
    `SELECT b.*, d.name as doctor_name, d.fees as doctor_fees,
            COALESCE(JSON_UNQUOTE(JSON_EXTRACT(d.availability, '$.shift')), 'Morning') AS doctor_shift,
            COALESCE(JSON_UNQUOTE(JSON_EXTRACT(d.availability, '$.disease')), 'General Consultation') AS doctor_disease,
            p.password AS patient_password
     FROM appointments b 
     LEFT JOIN doctors d ON b.doctor_id = d.id 
     LEFT JOIN patients p ON b.patient_id = p.patient_id
     WHERE b.doctor_id = ? AND b.deleted_at IS NULL AND b.status IN ('Approved', 'Completed')
     ORDER BY b.date DESC, b.id DESC`,
    [doctorId],
    (err, data) => {
      if (err) {
        console.error("Error fetching doctor bookings:", err);
        return res.status(500).json({ error: err.message });
      }
      res.json(data);
    }
  );
};

module.exports = {
  setDoctorShifts,
  getDoctorAppointments
};

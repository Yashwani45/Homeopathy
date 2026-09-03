const router = require("express").Router();
const appointmentController = require("../controllers/appointmentController");

router.post("/", appointmentController.createAppointment);
router.get("/patient/:patientId", appointmentController.getPatientAppointments);
router.patch("/:id", appointmentController.updateAppointmentStatus);

module.exports = router;

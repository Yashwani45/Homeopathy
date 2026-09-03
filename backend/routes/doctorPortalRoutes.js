const router = require("express").Router();
const doctorPortalController = require("../controllers/doctorPortalController");

router.post("/shifts", doctorPortalController.setDoctorShifts);
router.get("/appointments", doctorPortalController.getDoctorAppointments);

module.exports = router;

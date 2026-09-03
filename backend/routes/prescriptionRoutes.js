const router = require("express").Router();
const { verifyAdmin } = require("../middleware/authMiddleware");
const prescriptionController = require("../controllers/prescriptionController");

router.post("/add", prescriptionController.addPrescription);
router.get("/patient/:patientId", prescriptionController.getPatientPrescriptions);
router.get("/", verifyAdmin, prescriptionController.getPrescriptions);

module.exports = router;

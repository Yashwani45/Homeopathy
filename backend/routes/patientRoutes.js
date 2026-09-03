const router = require("express").Router();
const { verifyToken } = require("../middleware/authMiddleware");
const patientController = require("../controllers/patientController");

router.get("/", verifyToken, patientController.getPatients);
router.get("/search", verifyToken, patientController.searchPatients);
router.get("/public-profile/:patientId", patientController.getPublicPatientProfile);
router.get("/profile/:patientId", verifyToken, patientController.getPatientProfile);
router.put("/profile/:patientId", verifyToken, patientController.updatePatientProfile);
router.post("/resolve-or-create", patientController.resolveOrCreatePatient);

module.exports = router;

const router = require("express").Router();
const healthRecordController = require("../controllers/healthRecordController");

router.post("/add", healthRecordController.addHealthRecord);
router.get("/patient/:patientId", healthRecordController.getHealthHistory);
router.get("/patient/:patientId/latest", healthRecordController.getLatestHealthRecord);

module.exports = router;

const router = require("express").Router();
const { verifyAdmin } = require("../middleware/authMiddleware");
const doctorController = require("../controllers/doctorController");

router.post("/add", verifyAdmin, doctorController.addDoctor);
router.get("/", doctorController.getDoctors);
router.put("/update/:id", verifyAdmin, doctorController.updateDoctor);
router.put("/status/:id", verifyAdmin, doctorController.toggleDoctorStatus);

module.exports = router;
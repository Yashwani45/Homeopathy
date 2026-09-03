const router = require("express").Router();
const { verifyAdminOrDoctor } = require("../middleware/authMiddleware");
const medicineController = require("../controllers/medicineController");

router.post("/add", verifyAdminOrDoctor, medicineController.addMedicine);
router.get("/", medicineController.getMedicines);
router.delete("/delete/:id", verifyAdminOrDoctor, medicineController.deleteMedicine);

module.exports = router;

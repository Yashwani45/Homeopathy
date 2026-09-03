const router = require("express").Router();
const { verifyAdmin } = require("../middleware/authMiddleware");
const staffController = require("../controllers/staffController");

router.get("/", verifyAdmin, staffController.getStaff);
router.post("/add", verifyAdmin, staffController.addStaff);
router.put("/update/:id", verifyAdmin, staffController.updateStaff);
router.delete("/delete/:id", verifyAdmin, staffController.deleteStaff);

module.exports = router;

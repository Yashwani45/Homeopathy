const router = require("express").Router();
const leaveController = require("../controllers/leaveController");
const { verifyToken } = require("../middleware/authMiddleware");

// All leave operations require a verified session token
router.use(verifyToken);

router.post("/", leaveController.addLeave);
router.get("/", leaveController.getLeaves);
router.put("/:id", leaveController.updateLeave);
router.delete("/:id", leaveController.deleteLeave);

module.exports = router;

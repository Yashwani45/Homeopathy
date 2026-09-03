const router = require("express").Router();
const { verifyAdmin } = require("../middleware/authMiddleware");
const shiftController = require("../controllers/shiftController");

router.post("/add", verifyAdmin, shiftController.addShift);
router.get("/", shiftController.getShifts);

module.exports = router;
const router = require("express").Router();
const slotController = require("../controllers/slotController");

router.get("/", slotController.getAvailableSlots);

module.exports = router;

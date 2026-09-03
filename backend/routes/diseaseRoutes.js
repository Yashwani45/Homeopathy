const router = require("express").Router();
const { verifyAdmin } = require("../middleware/authMiddleware");
const diseaseController = require("../controllers/diseaseController");

router.post("/add", verifyAdmin, diseaseController.addDisease);
router.get("/", diseaseController.getDiseases);
router.put("/update/:id", verifyAdmin, diseaseController.updateDisease);

module.exports = router;
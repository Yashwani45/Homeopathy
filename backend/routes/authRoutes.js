const router = require("express").Router();
const { verifyAdmin } = require("../middleware/authMiddleware");
const authController = require("../controllers/authController");

// Unified login for all roles with compatibility endpoints for frontend modal requests
router.post("/login", authController.login);
router.post("/patient/login", authController.login);
router.post("/doctor/login", authController.login);

// Super admin clinic/tenant management
router.get("/admins", verifyAdmin, authController.getAdmins);
router.post("/admins/add", verifyAdmin, authController.addAdmin);
router.put("/admins/update/:id", verifyAdmin, authController.updateAdmin);
router.put("/admins/status/:id", verifyAdmin, authController.toggleAdminStatus);

// Clinic branding configuration
router.get("/branding/:adminId", authController.getBranding);
router.put("/branding", verifyAdmin, authController.updateBranding);
router.get("/public-clinics", authController.getPublicClinics);

module.exports = router;
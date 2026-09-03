require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const app = express();

app.use(cors());
app.use(express.json());

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Serve uploads folder statically
app.use("/uploads", express.static(uploadsDir));

// IMAGE UPLOAD API
app.post("/api/upload", upload.single("image"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const host = req.get("host");
    const imageUrl = `${req.protocol}://${host}/uploads/${req.file.filename}`;
    res.json({ success: true, url: imageUrl });
  } catch (error) {
    console.error("Error in /api/upload:", error);
    res.status(500).json({ error: error.message });
  }
});

const tenantMiddleware = require("./middleware/tenantMiddleware");
app.use(tenantMiddleware);

// ROUTES
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/doctors", require("./routes/doctorRoutes"));
app.use("/api/shifts", require("./routes/shiftRoutes"));
app.use("/api/diseases", require("./routes/diseaseRoutes"));
app.use("/api/bookings", require("./routes/bookingRoutes"));
app.use("/api/patients", require("./routes/patientRoutes"));
app.use("/api/staff", require("./routes/staffRoutes"));
app.use("/api/prescriptions", require("./routes/prescriptionRoutes"));
app.use("/api/medicines", require("./routes/medicineRoutes"));
app.use("/api/health-records", require("./routes/healthRecordRoutes"));
app.use("/api/leaves", require("./routes/leaveRoutes"));

// New V2 Routes
const slotRoutes = require("./routes/slotRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const doctorPortalRoutes = require("./routes/doctorPortalRoutes");

app.use("/api/slots", slotRoutes);
app.use("/slots", slotRoutes);

app.use("/api/appointments", appointmentRoutes);
app.use("/appointments", appointmentRoutes);

app.use("/api/doctor", doctorPortalRoutes);
app.use("/doctor", doctorPortalRoutes);

const initDatabases = require("./database/initDatabases");
const PORT = process.env.PORT || 5000;

initDatabases().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch((err) => {
  console.error("[Server Start] Database initialization failed:", err.message);
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} (Database Offline)`);
  });
});
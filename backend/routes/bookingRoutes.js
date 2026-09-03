const router = require("express").Router();
const { verifyAdmin } = require("../middleware/authMiddleware");
const bookingController = require("../controllers/bookingController");

router.post("/book", bookingController.bookAppointment);
router.post("/rebook", bookingController.rebookAppointment);
router.get("/", verifyAdmin, bookingController.getBookings);
router.put("/status/:id", verifyAdmin, bookingController.updateBookingStatus);

module.exports = router;
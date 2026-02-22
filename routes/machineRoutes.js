const express = require("express");
const router = express.Router();

const authOwner = require("../middleware/authOwner");
const {
  addMachine,
  getMachines,
  filterMachines,
  getOwnerMachines
} = require("../controllers/machineController");
const {
  createBooking,
  getBookings,
  updateBookingStatus,
  getUserBookings,
  cancelBooking,
  deleteBooking,
  completeBooking
} = require("../controllers/bookingController");
const {
  loginOwner,
  registerOwner
} = require("../controllers/authController");

router.post("/owner/register", registerOwner);
router.post("/owner/login", loginOwner);

router.get("/machines", getMachines);
router.get("/machines/filter", filterMachines);
router.post("/machines", authOwner, addMachine);
router.get("/owner/machines", authOwner, getOwnerMachines);

router.post("/book", createBooking);
router.get("/user-bookings", getUserBookings);
router.put("/book/cancel/:id", cancelBooking);

router.get("/bookings", authOwner, getBookings);
router.put("/book/update/:id", authOwner, updateBookingStatus);
router.delete("/book/delete/:id", authOwner, deleteBooking);
router.put("/book/complete/:id", authOwner, completeBooking);

module.exports = router;

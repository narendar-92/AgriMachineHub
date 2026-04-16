const express = require("express");
const router = express.Router();

const authOwner = require("../middleware/authOwner");
const authUser = require("../middleware/authUser");
const {
  addMachine,
  getMachines,
  filterMachines,
  getOwnerMachines,
  getMachineById
} = require("../controllers/machineController");
const {
  getOwnerProfile,
  getOwnerMachinesPublic,
  rateOwner
} = require("../controllers/ownerProfileController");
const {
  createBooking,
  createBookingPaymentOrder,
  verifyBookingPayment,
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
const {
  loginUser,
  registerUser
} = require("../controllers/userAuthController");

router.post("/owner/register", registerOwner);
router.post("/owner/login", loginOwner);
router.post("/user/register", registerUser);
router.post("/user/login", loginUser);

router.get("/machines", getMachines);
router.get("/machines/filter", filterMachines);
router.get("/machines/:id", getMachineById);
router.post("/machines", authOwner, addMachine);
router.get("/owner/machines", authOwner, getOwnerMachines);

router.get("/owners/:id", getOwnerProfile);
router.get("/owners/:id/machines", getOwnerMachinesPublic);
router.post("/owners/:id/rate", authUser, rateOwner);

router.post("/book", authUser, createBooking);
router.post("/book/:id/payment/order", authUser, createBookingPaymentOrder);
router.post("/book/:id/payment/verify", authUser, verifyBookingPayment);
router.get("/user-bookings", authUser, getUserBookings);
router.put("/book/cancel/:id", authUser, cancelBooking);

router.get("/bookings", authOwner, getBookings);
router.put("/book/update/:id", authOwner, updateBookingStatus);
router.delete("/book/delete/:id", authOwner, deleteBooking);
router.put("/book/complete/:id", authOwner, completeBooking);

module.exports = router;

const Booking = require("../models/Booking");
const Machine = require("../models/Machine");
const User = require("../models/User");
const Owner = require("../models/Owner");
const Razorpay = require("razorpay");
const crypto = require("crypto");

const getOwnerMachineIds = async (ownerId) => {
  const owner = await Owner.findById(ownerId).select("phone");
  let machineQuery = { ownerId };
  if (owner?.phone) {
    machineQuery = { $or: [{ ownerId }, { phone: owner.phone }] };
  }

  const machines = await Machine.find(machineQuery).select("_id");
  return machines.map((m) => m._id);
};

const getRazorpayInstance = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    return null;
  }
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
};

const calculateBookingAmountInPaise = (booking, machine) => {
  const pricePerHour = Number(machine?.pricePerHour || 0);
  if (!pricePerHour) {
    throw new Error("Machine price is invalid");
  }

  const [startH, startM] = String(booking.startTime || "").split(":").map(Number);
  const [endH, endM] = String(booking.endTime || "").split(":").map(Number);
  if ([startH, startM, endH, endM].some((n) => Number.isNaN(n))) {
    throw new Error("Booking time is invalid");
  }

  let startMinutes = startH * 60 + startM;
  let endMinutes = endH * 60 + endM;
  if (endMinutes <= startMinutes) {
    endMinutes += 24 * 60;
  }

  const hours = (endMinutes - startMinutes) / 60;
  const billableHours = Math.max(hours, 1);
  return Math.round(pricePerHour * billableHours * 100);
};

const createBooking = async (req, res) => {
  try {
    const {
      machineId,
      village,
      bookingDate,
      startTime,
      endTime,
      paymentMethod
    } = req.body;

    if (!machineId || !bookingDate || !startTime || !endTime) {
      return res.status(400).json({ message: "Missing required booking fields" });
    }

    const normalizedPaymentMethod = paymentMethod || "CashAfterWork";
    const allowedPaymentMethods = ["CashAfterWork", "OnlineBeforeWork"];
    if (!allowedPaymentMethods.includes(normalizedPaymentMethod)) {
      return res.status(400).json({ message: "Invalid payment method" });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(401).json({ message: "User not found for this token" });
    }

    const machine = await Machine.findById(machineId);
    if (!machine) {
      return res.status(404).json({ message: "Machine not found" });
    }

    const alreadyBooked = await Booking.findOne({
      machineId,
      userId: req.userId,
      status: { $in: ["Pending", "Approved"] }
    });

    if (alreadyBooked) {
      return res.status(400).json({ message: "You already have an active booking" });
    }

    const booking = await Booking.create({
      userId: req.userId,
      machineId,
      ownerId: machine.ownerId,
      farmerName: user.name,
      farmerPhone: user.phone,
      village,
      bookingDate,
      startTime,
      endTime,
      paymentMethod: normalizedPaymentMethod,
      paymentStatus: "Pending",
      status: "Pending"
    });

    return res.status(201).json({
      message: "Booking successful",
      data: booking
    });
  } catch (error) {
    return res.status(500).json({
      message: "Booking failed",
      error: error.message
    });
  }
};

const createBookingPaymentOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id).populate("machineId");
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (String(booking.userId) !== String(req.userId)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (booking.paymentMethod !== "OnlineBeforeWork") {
      return res.status(400).json({ message: "This booking does not require online payment" });
    }

    if (booking.paymentStatus === "Paid") {
      return res.status(400).json({ message: "Payment already completed for this booking" });
    }

    if (["Cancelled", "Rejected", "Completed"].includes(booking.status)) {
      return res.status(400).json({ message: "Cannot pay for this booking status" });
    }

    const razorpay = getRazorpayInstance();
    if (!razorpay) {
      return res.status(500).json({ message: "Payment gateway is not configured" });
    }

    const amount = calculateBookingAmountInPaise(booking, booking.machineId);
    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: `booking_${booking._id}_${Date.now()}`
    });

    booking.paymentOrderId = order.id;
    await booking.save();

    return res.status(201).json({
      message: "Payment order created",
      data: {
        bookingId: booking._id,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID
      }
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to create payment order",
      error: error.message
    });
  }
};

const verifyBookingPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: "Missing payment verification fields" });
    }

    if (!process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({ message: "Payment gateway is not configured" });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (String(booking.userId) !== String(req.userId)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (booking.paymentMethod !== "OnlineBeforeWork") {
      return res.status(400).json({ message: "This booking does not require online payment" });
    }

    if (booking.paymentStatus === "Paid") {
      return res.json({
        message: "Payment already verified",
        data: booking
      });
    }

    if (!booking.paymentOrderId || booking.paymentOrderId !== razorpay_order_id) {
      return res.status(400).json({ message: "Invalid payment order reference" });
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Payment signature verification failed" });
    }

    booking.paymentStatus = "Paid";
    booking.paymentTransactionId = razorpay_payment_id;
    booking.paidAt = new Date();
    await booking.save();

    return res.json({
      message: "Payment verified successfully",
      data: booking
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to verify payment",
      error: error.message
    });
  }
};

const getBookings = async (req, res) => {
  try {
    const machineIds = await getOwnerMachineIds(req.ownerId);
    const bookings = await Booking.find({
      $or: [{ ownerId: req.ownerId }, { machineId: { $in: machineIds } }]
    }).populate("machineId");

    return res.status(200).json({
      message: "Owner bookings fetched successfully",
      data: bookings
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch bookings",
      error: error.message
    });
  }
};

const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const allowedStatuses = ["Pending", "Approved", "Rejected", "Cancelled", "Completed"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid booking status" });
    }

    const booking = await Booking.findById(id).populate("machineId");
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const machineIds = await getOwnerMachineIds(req.ownerId);
    const isOwner =
      String(booking.ownerId) === String(req.ownerId) ||
      machineIds.some((machineId) => String(machineId) === String(booking.machineId?._id));

    if (!isOwner) {
      return res.status(403).json({ message: "Forbidden" });
    }

    booking.status = status;
    await booking.save();

    if (status === "Approved") {
      await Machine.findByIdAndUpdate(booking.machineId._id, { available: false });
    } else if (["Rejected", "Cancelled", "Completed"].includes(status)) {
      await Machine.findByIdAndUpdate(booking.machineId._id, { available: true });
    }

    return res.json({
      message: "Status updated successfully",
      data: booking
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update status",
      error: error.message
    });
  }
};

const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.userId }).populate("machineId");

    return res.json({
      message: "User bookings fetched successfully",
      data: bookings
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch user bookings",
      error: error.message
    });
  }
};

const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id).populate("machineId");
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (String(booking.userId) !== String(req.userId)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (["Rejected", "Completed", "Cancelled"].includes(booking.status)) {
      return res.status(400).json({ message: "This booking cannot be cancelled" });
    }

    booking.status = "Cancelled";
    await booking.save();

    await Machine.findByIdAndUpdate(booking.machineId._id, { available: true });

    return res.json({
      message: "Booking cancelled successfully",
      data: booking
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to cancel booking",
      error: error.message
    });
  }
};

const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id).populate("machineId");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const machineIds = await getOwnerMachineIds(req.ownerId);
    const isOwner =
      String(booking.ownerId) === String(req.ownerId) ||
      machineIds.some((machineId) => String(machineId) === String(booking.machineId?._id));

    if (!isOwner) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await Booking.findByIdAndDelete(id);

    return res.json({ message: "Booking deleted successfully" });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to delete booking",
      error: error.message
    });
  }
};

const completeBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id).populate("machineId");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const machineIds = await getOwnerMachineIds(req.ownerId);
    const isOwner =
      String(booking.ownerId) === String(req.ownerId) ||
      machineIds.some((machineId) => String(machineId) === String(booking.machineId?._id));

    if (!isOwner) {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (booking.status !== "Approved") {
      return res.status(400).json({ message: "Only approved bookings can be completed" });
    }

    booking.status = "Completed";
    if (booking.paymentMethod === "CashAfterWork" && booking.paymentStatus !== "Paid") {
      booking.paymentStatus = "Paid";
      booking.paidAt = new Date();
    }
    await booking.save();
    await Machine.findByIdAndUpdate(booking.machineId._id, { available: true });

    return res.json({
      message: "Booking marked as completed",
      data: booking
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update booking",
      error: error.message
    });
  }
};

module.exports = {
  createBooking,
  createBookingPaymentOrder,
  verifyBookingPayment,
  getBookings,
  updateBookingStatus,
  getUserBookings,
  cancelBooking,
  deleteBooking,
  completeBooking
};

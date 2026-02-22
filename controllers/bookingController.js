const Booking = require("../models/Booking");
const Machine = require("../models/Machine");

const createBooking = async (req, res) => {
  try {
    const {
      machineId,
      farmerName,
      farmerPhone,
      village,
      bookingDate,
      startTime,
      endTime
    } = req.body;

    if (!machineId || !farmerName || !farmerPhone || !bookingDate || !startTime || !endTime) {
      return res.status(400).json({ message: "Missing required booking fields" });
    }

    const machine = await Machine.findById(machineId);
    if (!machine) {
      return res.status(404).json({ message: "Machine not found" });
    }

    const alreadyBooked = await Booking.findOne({
      machineId,
      farmerPhone,
      status: { $in: ["Pending", "Approved"] }
    });

    if (alreadyBooked) {
      return res.status(400).json({ message: "You already have an active booking" });
    }

    const booking = await Booking.create({
      machineId,
      ownerId: machine.ownerId,
      farmerName,
      farmerPhone,
      village,
      bookingDate,
      startTime,
      endTime,
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

const getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ ownerId: req.ownerId }).populate("machineId");

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

    if (String(booking.ownerId) !== String(req.ownerId)) {
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
    const { phone } = req.query;
    if (!phone) {
      return res.status(400).json({ message: "Phone is required" });
    }

    const bookings = await Booking.find({ farmerPhone: phone }).populate("machineId");

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

    if (["Rejected", "Completed"].includes(booking.status)) {
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
    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (String(booking.ownerId) !== String(req.ownerId)) {
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

    if (String(booking.ownerId) !== String(req.ownerId)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (booking.status !== "Approved") {
      return res.status(400).json({ message: "Only approved bookings can be completed" });
    }

    booking.status = "Completed";
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
  getBookings,
  updateBookingStatus,
  getUserBookings,
  cancelBooking,
  deleteBooking,
  completeBooking
};

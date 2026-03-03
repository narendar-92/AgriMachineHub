const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  machineId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Machine",
    required: true
  },

  ownerId: {                    // ✅ ADD THIS
    type: mongoose.Schema.Types.ObjectId,
    ref: "Owner",
    required: true
  },

  farmerName: String,
  farmerPhone: String,
  village: String,
  bookingDate: String,
  startTime: String,
  endTime: String,

  status: {
    type: String,
    default: "Pending"
  }
}, { timestamps: true });


module.exports = mongoose.model("Booking", bookingSchema);

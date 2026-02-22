const mongoose = require("mongoose");

const machineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },

    ownerName: {
      type: String,
      required: true
    },

    phone: {
      type: String,
      required: true
    },

    type: {
      type: String,
      required: true
    },

    pricePerHour: {
      type: Number,
      required: true
    },

    location: {
      village: String,
      district: String,
      state: String
    },

    available: {
      type: Boolean,
      default: true
    },

    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Owner",
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Machine", machineSchema);

const mongoose = require("mongoose");

const ownerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  phone: {
    type: String,
    unique: true,
    required: true
  },

  password: {
    type: String,
    required: true
  },

  ratings: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
      },
      value: {
        type: Number,
        min: 1,
        max: 5,
        required: true
      },
      updatedAt: {
        type: Date,
        default: Date.now
      }
    }
  ],

  ratingAvg: {
    type: Number,
    default: 0
  },

  ratingCount: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model("Owner", ownerSchema);


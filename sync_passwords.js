const mongoose = require("mongoose");
const User = require("./models/User");
const Owner = require("./models/Owner");

const syncPasswords = async () => {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/AgriMachineHub");
    
    // Find the owner created recently
    const owner = await Owner.findOne({ phone: "9948650186" });
    if (!owner) {
      console.log("Owner not found");
      process.exit(1);
    }

    // Update the user with the same phone to have the owner's password hash
    const result = await User.updateOne(
      { phone: "9948650186" },
      { $set: { password: owner.password } }
    );

    console.log("Updated user password to match owner password.", result);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

syncPasswords();

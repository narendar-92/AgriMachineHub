const mongoose = require("mongoose");
const Owner = require("./models/Owner");

const checkOwners = async () => {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/AgriMachineHub");
    const owners = await Owner.find({});
    console.log("Owners in DB:", owners);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

checkOwners();

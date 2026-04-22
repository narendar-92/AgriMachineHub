const mongoose = require("mongoose");
const User = require("./models/User");

const checkUsers = async () => {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/AgriMachineHub");
    const users = await User.find({});
    console.log("Users in DB:", users);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

checkUsers();

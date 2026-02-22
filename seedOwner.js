const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Owner = require("./models/Owner");

async function seedOwner() {
  await mongoose.connect("mongodb://127.0.0.1:27017/AgriMachineHub");

  const hash = await bcrypt.hash("1234", 10);

  await Owner.create({
    name: "Admin",
    phone: "9999999999",
    password: hash
  });

  console.log("Owner Created 🎉");
  process.exit();
}

seedOwner();

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Owner = require("../models/Owner");
const { SECRET_KEY } = require("../config/auth");

const registerOwner = async (req, res) => {
  try {
    const { name, phone, password } = req.body;

    if (!name || !phone || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const exists = await Owner.findOne({ phone });
    if (exists) {
      return res.status(400).json({ message: "Owner already exists" });
    }

    const hash = await bcrypt.hash(password, 10);
    const owner = await Owner.create({
      name: name.trim(),
      phone: String(phone).trim(),
      password: hash
    });

    return res.status(201).json({
      message: "Owner registered successfully",
      owner: {
        _id: owner._id,
        name: owner.name,
        phone: owner.phone
      }
    });
  } catch (error) {
    return res.status(500).json({
      message: "Registration failed",
      error: error.message
    });
  }
};

const loginOwner = async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ message: "Phone and password required" });
    }

    const owner = await Owner.findOne({ phone: String(phone).trim() });
    if (!owner) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, owner.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ ownerId: owner._id }, SECRET_KEY, {
      expiresIn: "7d"
    });

    return res.json({
      message: "Login success",
      token
    });
  } catch (error) {
    return res.status(500).json({
      message: "Login failed",
      error: error.message
    });
  }
};

module.exports = {
  registerOwner,
  loginOwner
};

const Machine = require("../models/Machine");

// ---------------- ADD MACHINE ----------------
const addMachine = async (req, res) => {
  try {
    const { name, ownerName, phone, type, pricePerHour, location } = req.body;
    if (!name || !ownerName || !phone || !type || !pricePerHour) {
      return res.status(400).json({ message: "Missing required machine fields" });
    }

    const machine = await Machine.create({
      ...req.body,
      location: {
        village: location?.village || "",
        district: location?.district || "",
        state: location?.state || ""
      },
      ownerId: req.ownerId
    });

    res.json({
      message: "Machine added successfully",
      machine
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------------- GET ALL MACHINES ----------------
const getMachines = async (req, res) => {
  try {
    const machines = await Machine.find({ available: true });

    res.status(200).json({
      message: "Machines fetched successfully",
      count: machines.length,
      data: machines
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch machines",
      error: error.message
    });
  }
};

// ---------------- FILTER MACHINES ----------------
const filterMachines = async (req, res) => {
  try {
    const { district, type } = req.query;
    const query = { available: true };

    if (district) query["location.district"] = district;
    if (type) query.type = type;

    const machines = await Machine.find(query);

    res.status(200).json({
      message: "Filtered machines fetched successfully",
      count: machines.length,
      data: machines
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to filter machines",
      error: error.message
    });
  }
};

// ---------------- GET OWNER MACHINES ----------------
const getOwnerMachines = async (req, res) => {
  try {
    const machines = await Machine.find({ ownerId: req.ownerId });

    res.status(200).json({
      message: "Owner machines fetched successfully",
      data: machines
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch owner machines",
      error: error.message
    });
  }
};

module.exports = {
  addMachine,
  getMachines,
  filterMachines,
  getOwnerMachines
};

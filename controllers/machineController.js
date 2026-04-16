const Machine = require("../models/Machine");

const MAX_IMAGES_PER_MACHINE = 5;
const MAX_IMAGE_DATA_URL_CHARS = 3_500_000; // ~2.5MB binary per image (base64 overhead)

const normalizeImages = (images) => {
  if (!images) return [];
  const list = Array.isArray(images) ? images : [images];

  return list
    .filter((v) => typeof v === "string")
    .map((v) => v.trim())
    .filter(Boolean)
    .filter((v) => v.startsWith("data:image/") && v.includes(";base64,"))
    .slice(0, MAX_IMAGES_PER_MACHINE)
    .filter((v) => v.length <= MAX_IMAGE_DATA_URL_CHARS);
};

// ---------------- ADD MACHINE ----------------
const addMachine = async (req, res) => {
  try {
    const { name, ownerName, phone, type, pricePerHour, location, images } = req.body;
    const price = Number(pricePerHour);
    if (!name || !ownerName || !phone || !type || !pricePerHour || !Number.isFinite(price) || price <= 0) {
      return res.status(400).json({ message: "Invalid or missing required machine fields" });
    }

    const normalizedImages = normalizeImages(images);
    if (Array.isArray(images) && images.length > MAX_IMAGES_PER_MACHINE) {
      return res.status(400).json({ message: `You can upload up to ${MAX_IMAGES_PER_MACHINE} images.` });
    }

    const machine = await Machine.create({
      name: String(name).trim(),
      ownerName: String(ownerName).trim(),
      phone: String(phone).trim(),
      type: String(type).trim(),
      pricePerHour: price,
      images: normalizedImages,
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

// ---------------- GET MACHINE BY ID (PUBLIC) ----------------
const getMachineById = async (req, res) => {
  try {
    const machine = await Machine.findById(req.params.id);
    if (!machine) {
      return res.status(404).json({ message: "Machine not found" });
    }

    return res.status(200).json({
      message: "Machine fetched successfully",
      data: machine
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch machine",
      error: error.message
    });
  }
};

module.exports = {
  addMachine,
  getMachines,
  filterMachines,
  getOwnerMachines,
  getMachineById
};

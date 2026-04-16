const Owner = require("../models/Owner");
const Machine = require("../models/Machine");

const clampRatingValue = (value) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return null;
  const rounded = Math.round(num);
  if (rounded < 1 || rounded > 5) return null;
  return rounded;
};

const recomputeRatingStats = (ratings) => {
  const count = Array.isArray(ratings) ? ratings.length : 0;
  if (!count) return { ratingAvg: 0, ratingCount: 0 };
  const sum = ratings.reduce((acc, r) => acc + Number(r?.value || 0), 0);
  const avg = sum / count;
  return { ratingAvg: Math.round(avg * 10) / 10, ratingCount: count };
};

// Public: owner basic info + rating stats
const getOwnerProfile = async (req, res) => {
  try {
    const owner = await Owner.findById(req.params.id).select("name phone ratingAvg ratingCount");
    if (!owner) return res.status(404).json({ message: "Owner not found" });

    return res.status(200).json({
      message: "Owner fetched successfully",
      data: owner
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch owner", error: error.message });
  }
};

// Public: list machines for an owner
const getOwnerMachinesPublic = async (req, res) => {
  try {
    const ownerId = req.params.id;
    const machines = await Machine.find({ ownerId }).sort({ createdAt: -1 });
    return res.status(200).json({
      message: "Owner machines fetched successfully",
      count: machines.length,
      data: machines
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch owner machines", error: error.message });
  }
};

// User: rate an owner (upsert 1 rating per user per owner)
const rateOwner = async (req, res) => {
  try {
    const ownerId = req.params.id;
    const userId = req.userId;
    const value = clampRatingValue(req.body?.value);
    if (!value) return res.status(400).json({ message: "Rating value must be between 1 and 5" });

    const owner = await Owner.findById(ownerId);
    if (!owner) return res.status(404).json({ message: "Owner not found" });

    const existing = owner.ratings.find((r) => String(r.userId) === String(userId));
    if (existing) {
      existing.value = value;
      existing.updatedAt = new Date();
    } else {
      owner.ratings.push({ userId, value, updatedAt: new Date() });
    }

    const stats = recomputeRatingStats(owner.ratings);
    owner.ratingAvg = stats.ratingAvg;
    owner.ratingCount = stats.ratingCount;
    await owner.save();

    return res.status(200).json({
      message: "Rating saved",
      data: { ratingAvg: owner.ratingAvg, ratingCount: owner.ratingCount }
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to save rating", error: error.message });
  }
};

module.exports = {
  getOwnerProfile,
  getOwnerMachinesPublic,
  rateOwner
};


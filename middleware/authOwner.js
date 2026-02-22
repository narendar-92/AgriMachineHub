const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config/auth");

module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authorization token missing" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, SECRET_KEY);

    req.ownerId = decoded.ownerId;
    req.owner = { id: decoded.ownerId };

    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

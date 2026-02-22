if (process.env.NODE_ENV === "production" && !process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is required in production");
}

const SECRET_KEY = process.env.JWT_SECRET || "agrimachine_secret_key";

module.exports = { SECRET_KEY };

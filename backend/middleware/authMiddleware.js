const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-key";

const authMiddleware = (req, res, next) => {
  try {
    const authorization = req.headers.authorization;

    if (!authorization) {
      return res.status(401).json({
        message: "Authorization token is required.",
      });
    }

    const parts = authorization.split(" ");

    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return res.status(401).json({
        message: "Authorization format must be: Bearer <token>.",
      });
    }

    const token = parts[1];

    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token.",
    });
  }
};

module.exports = authMiddleware;
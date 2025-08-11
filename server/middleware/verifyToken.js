const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Example: Bearer eyJhbGciOiJIUzI1NiIsInR...
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // نمرر بيانات المستخدم (id/email/is_admin)
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token." });
  }
};

function isAdmin(req, res, next) {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied" });
  }
  next();
}

module.exports = verifyToken,isAdmin;

const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) return res.status(403).json({ message: "Token missing" });

  try {
    const decoded = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);
    req.user = decoded; // The decoded token already contains the employeeId
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

const allowRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) return res.status(403).json({ message: "Unauthorized" });
    next();
  };
};

module.exports = { verifyToken, allowRoles };

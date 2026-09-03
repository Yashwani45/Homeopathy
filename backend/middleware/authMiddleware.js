const jwt = require("jsonwebtoken");
const SECRET = process.env.JWT_SECRET || "hospital_secret";

/**
 * Verifies JWT token and binds parsed payload to req.user
 */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(403).json({ error: "Access denied. No token provided." });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(403).json({ error: "Access denied. Invalid token format." });
  }

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token." });
  }
};

/**
 * Verifies that the user has admin or super_admin permissions
 */
const verifyAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user && (req.user.role === "admin" || req.user.role === "super_admin" || req.user.role === "staff")) {
      next();
    } else {
      return res.status(403).json({ error: "Access denied. Admin role required." });
    }
  });
};

/**
 * Verifies that the user has admin, super_admin, staff, or doctor permissions
 */
const verifyAdminOrDoctor = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user && (req.user.role === "admin" || req.user.role === "super_admin" || req.user.role === "staff" || req.user.role === "doctor")) {
      next();
    } else {
      return res.status(403).json({ error: "Access denied. Admin or Doctor role required." });
    }
  });
};

/**
 * Resolves the clinic admin ID scope for requests
 */
const resolveScopingAdminId = (req) => {
  if (req.user) {
    if (req.user.role === "super_admin") {
      const targetId = req.query.adminId || req.body?.adminId || req.body?.admin_id;
      return targetId ? parseInt(targetId) : null;
    }
    return req.user.adminId;
  }

  // Fallback
  const authHeader = req.headers["authorization"];
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    if (token) {
      try {
        const decoded = jwt.verify(token, SECRET);
        if (decoded.role === "super_admin") {
          const targetId = req.query.adminId || req.body?.adminId || req.body?.admin_id;
          return targetId ? parseInt(targetId) : null;
        }
        return decoded.adminId;
      } catch (err) {}
    }
  }

  const queryId = req.query.adminId || req.body?.adminId || req.body?.admin_id;
  return queryId ? parseInt(queryId) : 1;
};

module.exports = { verifyToken, verifyAdmin, verifyAdminOrDoctor, resolveScopingAdminId };

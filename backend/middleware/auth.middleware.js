import jwt from "jsonwebtoken";

// Verifies the JWT from the Authorization header and attaches the payload to req.user.
export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: no token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
    req.user = decoded; // { id, role }
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized: invalid or expired token" });
  }
};

// Requires the authenticated user to be an admin. Use after verifyToken.
export const requireAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Forbidden: admin access required" });
  }
  next();
};

// Requires staff access (admin or barber). Use after verifyToken.
export const requireStaff = (req, res, next) => {
  if (req.user?.role !== "admin" && req.user?.role !== "barber") {
    return res.status(403).json({ message: "Forbidden: staff access required" });
  }
  next();
};

// Optional auth: attaches req.user when a valid token is present, but never
// blocks the request. Used for public endpoints that behave better when the
// caller happens to be logged in (e.g. linking a booking to a client account).
export const attachUser = (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (token) {
    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
    } catch {
      // Ignore invalid token — request continues as anonymous.
    }
  }
  next();
};

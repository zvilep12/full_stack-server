import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

/**
 * Middleware to authenticate requests using JSON Web Tokens (JWT).
 * Expects header: Authorization: Bearer <TOKEN>
 */
export const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Admin Master Access / Basic Auth bypass (for testing without login steps)
  if (authHeader && authHeader.startsWith('Basic ')) {
    try {
      const credentials = Buffer.from(authHeader.split(' ')[1], 'base64').toString('ascii');
      const [username, password] = credentials.split(':');
      if (username === 'admin' && password === '123') {
        req.user = { id: 1, email: 'admin@restaurant.com', role: 'manager' };
        return next();
      }
    } catch (err) {
      // Fall through to token auth
    }
  }

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access denied. No authentication token provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Block temporary 2FA tokens from accessing operational endpoints!
    if (decoded.step === '2fa_pending' || !decoded.role) {
      return res.status(401).json({ error: 'Access denied. Two-step verification pending. Please complete OTP verification.' });
    }

    req.user = decoded; // Attach payload: { id, email, role }
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired authentication token.' });
  }
};

/**
 * Middleware to authorize requests based on employee roles.
 * Must be placed AFTER authenticateJWT.
 * 
 * @param {...string} allowedRoles - List of roles permitted to access the route
 */
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
    const userRole = (req.user.role === 'menager') ? 'manager' : req.user.role;

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ error: 'Access denied. Insufficient permissions.' });
    }

    next();
  };
};}

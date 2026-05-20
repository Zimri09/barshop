const supabase = require('../services/supabaseClient');

/**
 * Middleware to verify and attach JWT token to request
 * Extracts token from Authorization: Bearer <token> header
 */
async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // Optional: allow unauthenticated requests
      req.user = null;
      return next();
    }

    const token = authHeader.slice(7); // Remove "Bearer " prefix

    // Verify token with Supabase
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Attach user info and token to request
    req.user = data.user;
    req.token = token;

    next();
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed' });
  }
}

/**
 * Middleware to require authentication
 * Use this for protected routes
 */
function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
}

module.exports = { authMiddleware, requireAuth };

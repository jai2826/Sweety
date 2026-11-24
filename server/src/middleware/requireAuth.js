import { verifyToken } from '../lib/auth.js';
import { ApiError } from '../lib/ApiError.js';

// Reads a Bearer token, verifies it, and attaches { id, email, role } to req.user.
export function requireAuth(req, _res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return next(ApiError.unauthorized('Missing or malformed Authorization header.'));
  }

  try {
    const payload = verifyToken(token);
    req.user = { id: payload.sub, email: payload.email, role: payload.role };
    next();
  } catch {
    next(ApiError.unauthorized('Invalid or expired token.'));
  }
}

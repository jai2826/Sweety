import { ApiError } from '../lib/ApiError.js';

// 404 handler for unmatched routes.
export function notFoundHandler(_req, res) {
  res.status(404).json({ error: 'Route not found.' });
}

// Central error handler. Converts ApiError (and anything else) into JSON.
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  if (err instanceof ApiError) {
    return res.status(err.status).json({ error: err.message });
  }

  // Prisma unique-constraint violation, just in case one slips past our checks.
  if (err?.code === 'P2002') {
    return res.status(409).json({ error: 'That record already exists.' });
  }

  console.error('Unexpected error:', err);
  return res.status(500).json({ error: 'Something went wrong on the server.' });
}

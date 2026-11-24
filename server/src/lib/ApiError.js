// A small error type that carries an HTTP status plus a user-facing message.
// Thrown by controllers and translated to JSON by the error middleware.
export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }

  static badRequest(message) {
    return new ApiError(400, message);
  }

  static unauthorized(message = 'Not authenticated.') {
    return new ApiError(401, message);
  }

  static forbidden(message = 'Not allowed.') {
    return new ApiError(403, message);
  }

  static notFound(message = 'Not found.') {
    return new ApiError(404, message);
  }

  static conflict(message) {
    return new ApiError(409, message);
  }
}

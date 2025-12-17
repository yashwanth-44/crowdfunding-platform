export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code: string = 'INTERNAL_SERVER_ERROR'
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }

  static badRequest(message: string, code = 'BAD_REQUEST'): AppError {
    return new AppError(message, 400, code);
  }

  static unauthorized(message: string, code = 'UNAUTHORIZED'): AppError {
    return new AppError(message, 401, code);
  }

  static forbidden(message: string, code = 'FORBIDDEN'): AppError {
    return new AppError(message, 403, code);
  }

  static notFound(message: string, code = 'NOT_FOUND'): AppError {
    return new AppError(message, 404, code);
  }

  static conflict(message: string, code = 'CONFLICT'): AppError {
    return new AppError(message, 409, code);
  }

  static unprocessable(message: string, code = 'UNPROCESSABLE_ENTITY'): AppError {
    return new AppError(message, 422, code);
  }

  static serverError(message: string, code = 'INTERNAL_SERVER_ERROR'): AppError {
    return new AppError(message, 500, code);
  }
}

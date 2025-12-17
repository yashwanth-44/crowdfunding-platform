import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { errorResponse } from '../utils/response';

export function errorHandler(
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error('Error:', error);

  if (error instanceof AppError) {
    res.status(error.statusCode).json(
      errorResponse(error.message, error.statusCode, req.path)
    );
    return;
  }

  // Handle Zod validation errors
  if (error.name === 'ZodError') {
    res.status(400).json(
      errorResponse((error as any).errors[0]?.message || 'Validation failed', 400, req.path)
    );
    return;
  }

  // Default error
  res.status(500).json(
    errorResponse('Internal server error', 500, req.path)
  );
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json(
    errorResponse(`Route ${req.path} not found`, 404, req.path)
  );
}

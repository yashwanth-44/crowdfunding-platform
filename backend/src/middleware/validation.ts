import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { AppError } from '../utils/errors';

export function validateRequest(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validated = schema.parse(req.body);
      req.body = validated;
      next();
    } catch (error: any) {
      const message = error.errors?.[0]?.message || 'Validation failed';
      next(AppError.badRequest(message, 'VALIDATION_ERROR'));
    }
  };
}

export function validateQuery(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validated = schema.parse(req.query);
      req.query = validated as any;
      next();
    } catch (error: any) {
      const message = error.errors?.[0]?.message || 'Validation failed';
      next(AppError.badRequest(message, 'VALIDATION_ERROR'));
    }
  };
}

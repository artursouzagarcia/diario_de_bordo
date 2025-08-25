import { Request, Response, NextFunction } from 'express';

export class ApiError extends Error {
  status: number;
  details?: unknown;
  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof ApiError) {
    return res
      .status(err.status)
      .json({ error: err.message, details: err.details });
  }
  const message = err instanceof Error ? err.message : 'Internal Server Error';
  return res.status(500).json({ error: message });
}

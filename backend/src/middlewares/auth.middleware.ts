import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest, JwtUserPayload, UserRole } from '../types/auth.types';

const JWT_SECRET = process.env.JWT_SECRET || 'medeasy_jwt_default_secret_dev_2026';

/**
 * Middleware: Verify Bearer JWT Token in Authorization header
 */
export const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') 
    ? authHeader.split(' ')[1] 
    : null;

  if (!token) {
    res.status(401).json({
      success: false,
      message: 'Access denied: No authorization token provided',
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtUserPayload;
    req.user = decoded;
    next();
  } catch (error: any) {
    res.status(403).json({
      success: false,
      message: 'Forbidden: Invalid or expired authorization token',
      error: error.message,
    });
  }
};

/**
 * Middleware: Require one or more specific user roles
 */
export const requireRoles = (...allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized: User not authenticated',
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Forbidden: User role '${req.user.role}' is not authorized to access this resource`,
      });
      return;
    }

    next();
  };
};

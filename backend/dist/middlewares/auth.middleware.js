"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRoles = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'medeasy_jwt_default_secret_dev_2026';
/**
 * Middleware: Verify Bearer JWT Token in Authorization header
 */
const authenticateToken = (req, res, next) => {
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
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (error) {
        res.status(403).json({
            success: false,
            message: 'Forbidden: Invalid or expired authorization token',
            error: error.message,
        });
    }
};
exports.authenticateToken = authenticateToken;
/**
 * Middleware: Require one or more specific user roles
 */
const requireRoles = (...allowedRoles) => {
    return (req, res, next) => {
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
exports.requireRoles = requireRoles;

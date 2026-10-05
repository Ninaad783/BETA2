"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
exports.authRouter = (0, express_1.Router)();
// Public routes
exports.authRouter.post('/login', auth_controller_1.login);
exports.authRouter.post('/logout', auth_controller_1.logout);
exports.authRouter.post('/forgot-password', auth_controller_1.forgotPassword);
// Protected routes (Requires Bearer JWT token)
exports.authRouter.get('/me', auth_middleware_1.authenticateToken, auth_controller_1.getMe);
exports.authRouter.post('/change-password', auth_middleware_1.authenticateToken, auth_controller_1.changePassword);
exports.authRouter.get('/users', auth_middleware_1.authenticateToken, auth_controller_1.getUsers);
exports.authRouter.post('/register', auth_middleware_1.authenticateToken, (0, auth_middleware_1.requireRoles)('ADMIN'), auth_controller_1.register);

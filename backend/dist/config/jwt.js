"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.restrictTo = exports.protect = exports.verifyToken = exports.signToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'siteflow_dev_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
/** Sign a JWT token */
const signToken = (payload) => {
    return jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};
exports.signToken = signToken;
/** Verify a JWT token */
const verifyToken = (token) => {
    return jsonwebtoken_1.default.verify(token, JWT_SECRET);
};
exports.verifyToken = verifyToken;
/** Express middleware: protect routes with JWT */
const protect = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ success: false, message: 'Unauthorized: No token provided' });
            return;
        }
        const token = authHeader.split(' ')[1];
        const decoded = (0, exports.verifyToken)(token);
        // Attach user info to request
        req.user = decoded;
        next();
    }
    catch {
        res.status(401).json({ success: false, message: 'Unauthorized: Invalid or expired token' });
    }
};
exports.protect = protect;
/** Middleware: restrict to specific roles */
const restrictTo = (...roles) => {
    return (req, res, next) => {
        const user = req.user;
        if (!roles.includes(user.role)) {
            res.status(403).json({ success: false, message: 'Forbidden: Insufficient permissions' });
            return;
        }
        next();
    };
};
exports.restrictTo = restrictTo;

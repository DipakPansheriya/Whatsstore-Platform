"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTheme = exports.getMe = exports.login = exports.register = exports.registerSuperAdmin = void 0;
const auth_model_1 = __importDefault(require("./auth.model"));
const business_model_1 = __importDefault(require("../business/business.model"));
const jwt_1 = require("../config/jwt");
/** POST /api/auth/setup-superadmin (Hidden route for Postman) */
const registerSuperAdmin = async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;
        if (!name || !email || !phone || !password) {
            res.status(400).json({ success: false, message: 'All fields are required' });
            return;
        }
        const existingUser = await auth_model_1.default.findOne({ $or: [{ email }, { phone }] });
        if (existingUser) {
            res.status(409).json({ success: false, message: 'Email or phone already registered' });
            return;
        }
        const user = await auth_model_1.default.create({ name, email, phone, passwordHash: password, role: 'SUPERADMIN', isVerified: true });
        const token = (0, jwt_1.signToken)({ userId: user.id, email: user.email, role: user.role });
        res.status(201).json({
            success: true,
            message: 'SuperAdmin created successfully',
            token,
            user: { id: user.id, name: user.name, email: user.email, role: user.role, theme: user.theme },
        });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.registerSuperAdmin = registerSuperAdmin;
/** POST /api/auth/register */
const register = async (req, res) => {
    try {
        const { name, email, phone, password, businessName, slug } = req.body;
        if (!name || !email || !phone || !password || !businessName || !slug) {
            res.status(400).json({ success: false, message: 'All fields are required' });
            return;
        }
        const existing = await auth_model_1.default.findOne({ $or: [{ email }, { phone }] });
        if (existing) {
            res.status(409).json({ success: false, message: 'Email or phone already registered' });
            return;
        }
        const existingSlug = await business_model_1.default.findOne({ websiteSlug: slug });
        if (existingSlug) {
            res.status(409).json({ success: false, message: 'Store URL slug is already taken' });
            return;
        }
        const user = await auth_model_1.default.create({ name, email, phone, passwordHash: password, role: 'ADMIN' });
        // Automatically create business profile
        const business = await business_model_1.default.create({
            owner: user.id,
            name: businessName,
            email,
            phone,
            whatsappNumber: phone,
            websiteSlug: slug,
        });
        // Automatically start 10-day free trial
        const { default: Subscription } = await Promise.resolve().then(() => __importStar(require('../subscriptions/subscription.model')));
        await Subscription.create({
            user: user.id,
            store: business.id,
            status: 'TRIAL_ACTIVE',
            trialStartDate: new Date(),
            // TEMPORARY: Set to 10 minutes for testing. Change back to 10 days (10 * 24 * 60 * 60 * 1000) after testing.
            trialEndDate: new Date(Date.now() + 10 * 60 * 1000)
        });
        const token = (0, jwt_1.signToken)({ userId: user.id, email: user.email, role: user.role });
        res.status(201).json({
            success: true,
            message: 'Registration successful',
            token,
            user: { id: user.id, name: user.name, email: user.email, role: user.role, theme: user.theme },
        });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.register = register;
/** POST /api/auth/login */
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ success: false, message: 'Email and password are required' });
            return;
        }
        const user = await auth_model_1.default.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
            return;
        }
        const token = (0, jwt_1.signToken)({ userId: user.id, email: user.email, role: user.role });
        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: { id: user.id, name: user.name, email: user.email, role: user.role, theme: user.theme },
        });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.login = login;
/** GET /api/auth/me */
const getMe = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const user = await auth_model_1.default.findById(userId).select('-passwordHash');
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }
        res.json({ success: true, user });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.getMe = getMe;
/** PUT /api/auth/theme */
const updateTheme = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { theme } = req.body;
        if (!theme || !['light', 'dark', 'system'].includes(theme)) {
            res.status(400).json({ success: false, message: 'Invalid theme value' });
            return;
        }
        const user = await auth_model_1.default.findByIdAndUpdate(userId, { theme }, { new: true });
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }
        res.json({ success: true, theme: user.theme });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.updateTheme = updateTheme;

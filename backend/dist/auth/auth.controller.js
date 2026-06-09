"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.login = exports.register = void 0;
const auth_model_1 = __importDefault(require("./auth.model"));
const business_model_1 = __importDefault(require("../business/business.model"));
const jwt_1 = require("../config/jwt");
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
        const user = await auth_model_1.default.create({ name, email, phone, passwordHash: password, role: 'business' });
        // Automatically create business profile
        await business_model_1.default.create({
            owner: user.id,
            name: businessName,
            email,
            phone,
            whatsappNumber: phone,
            websiteSlug: slug,
        });
        const token = (0, jwt_1.signToken)({ userId: user.id, email: user.email, role: user.role });
        res.status(201).json({
            success: true,
            message: 'Registration successful',
            token,
            user: { id: user.id, name: user.name, email: user.email, role: user.role },
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
            user: { id: user.id, name: user.name, email: user.email, role: user.role },
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

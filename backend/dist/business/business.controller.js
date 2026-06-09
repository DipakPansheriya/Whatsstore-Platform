"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPublicStore = exports.updateBusiness = exports.createBusiness = exports.getMyBusiness = void 0;
const business_model_1 = __importDefault(require("./business.model"));
/** GET /api/business/me */
const getMyBusiness = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const business = await business_model_1.default.findOne({ owner: userId });
        if (!business) {
            res.status(404).json({ success: false, message: 'Business profile not found' });
            return;
        }
        res.json({ success: true, business });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.getMyBusiness = getMyBusiness;
/** POST /api/business */
const createBusiness = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const existing = await business_model_1.default.findOne({ owner: userId });
        if (existing) {
            res.status(409).json({ success: false, message: 'Business profile already exists' });
            return;
        }
        const business = await business_model_1.default.create({ ...req.body, owner: userId });
        res.status(201).json({ success: true, business });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.createBusiness = createBusiness;
/** PATCH /api/business/me */
const updateBusiness = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const business = await business_model_1.default.findOneAndUpdate({ owner: userId }, { $set: req.body }, { new: true, runValidators: true });
        if (!business) {
            res.status(404).json({ success: false, message: 'Business not found' });
            return;
        }
        res.json({ success: true, business });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.updateBusiness = updateBusiness;
/** GET /api/business/store/:slug — Public */
const getPublicStore = async (req, res) => {
    try {
        const business = await business_model_1.default.findOne({ websiteSlug: req.params.slug, isPublished: true });
        if (!business) {
            res.status(404).json({ success: false, message: 'Store not found' });
            return;
        }
        res.json({ success: true, business });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.getPublicStore = getPublicStore;

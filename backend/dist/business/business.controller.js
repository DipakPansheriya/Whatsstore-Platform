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
        // Check if store owner's subscription is active
        const { default: Subscription } = await Promise.resolve().then(() => __importStar(require('../subscriptions/subscription.model')));
        const sub = await Subscription.findOne({ user: business.owner });
        if (!sub || sub.status === 'CANCELLED' || sub.status === 'SUSPENDED') {
            res.status(403).json({ success: false, message: 'Store is currently unavailable' });
            return;
        }
        res.json({ success: true, business });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.getPublicStore = getPublicStore;

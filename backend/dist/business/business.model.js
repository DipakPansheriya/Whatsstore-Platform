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
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const BusinessSchema = new mongoose_1.Schema({
    owner: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    description: { type: String, default: '' },
    phone: { type: String, required: true },
    whatsappNumber: { type: String, required: true },
    logoUrl: { type: String, default: '' },
    address: { type: String, default: '' },
    category: { type: String, default: 'General' },
    websiteSlug: { type: String, unique: true, lowercase: true, trim: true },
    isPublished: { type: Boolean, default: false },
    layoutConfig: {
        template: { type: String, default: 'Shop' },
        theme: { type: String, default: 'Classic Green' },
        heroTitle: { type: String, default: 'Welcome to our store' },
        heroSubtitle: { type: String, default: 'Browse our products and order easily via WhatsApp.' },
        heroImageUrl: { type: String, default: '' },
        aboutTitle: { type: String, default: 'About Us' },
        aboutText: { type: String, default: 'We are a small business dedicated to providing premium quality products.' },
        ctaTitle: { type: String, default: 'Have questions? Chat with us!' },
    },
}, { timestamps: true });
exports.default = mongoose_1.default.model('Business', BusinessSchema);

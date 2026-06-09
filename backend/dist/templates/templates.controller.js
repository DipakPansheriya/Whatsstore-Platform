"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTemplate = exports.getTemplates = void 0;
const templates_model_1 = __importDefault(require("./templates.model"));
/** GET /api/templates */
const getTemplates = async (req, res) => {
    try {
        const { category, isPremium } = req.query;
        const filter = {};
        if (category)
            filter.category = category;
        if (isPremium !== undefined)
            filter.isPremium = isPremium === 'true';
        const templates = await templates_model_1.default.find(filter).sort({ createdAt: -1 });
        res.json({ success: true, templates });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.getTemplates = getTemplates;
/** GET /api/templates/:id */
const getTemplate = async (req, res) => {
    try {
        const template = await templates_model_1.default.findById(req.params.id);
        if (!template) {
            res.status(404).json({ success: false, message: 'Template not found' });
            return;
        }
        res.json({ success: true, template });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.getTemplate = getTemplate;

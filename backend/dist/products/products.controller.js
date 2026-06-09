"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getPublicProduct = exports.getPublicProducts = exports.getProducts = void 0;
const products_model_1 = __importDefault(require("./products.model"));
const business_model_1 = __importDefault(require("../business/business.model"));
/** GET /api/products — Get all products for authenticated business */
const getProducts = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const business = await business_model_1.default.findOne({ owner: userId });
        if (!business) {
            res.status(404).json({ success: false, message: 'Business not found' });
            return;
        }
        const products = await products_model_1.default.find({ business: business._id }).sort({ createdAt: -1 });
        res.json({ success: true, products });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.getProducts = getProducts;
/** GET /api/products/public/:businessId — Public product list */
const getPublicProducts = async (req, res) => {
    try {
        const products = await products_model_1.default.find({
            business: req.params.businessId,
            isAvailable: true,
        }).sort({ createdAt: -1 });
        res.json({ success: true, products });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.getPublicProducts = getPublicProducts;
/** GET /api/products/public/product/:id — Public product details */
const getPublicProduct = async (req, res) => {
    try {
        const product = await products_model_1.default.findById(req.params.id);
        if (!product || !product.isAvailable) {
            res.status(404).json({ success: false, message: 'Product not found' });
            return;
        }
        res.json({ success: true, product });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.getPublicProduct = getPublicProduct;
/** POST /api/products */
const createProduct = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const business = await business_model_1.default.findOne({ owner: userId });
        if (!business) {
            res.status(404).json({ success: false, message: 'Business not found' });
            return;
        }
        const product = await products_model_1.default.create({ ...req.body, business: business._id });
        res.status(201).json({ success: true, product });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.createProduct = createProduct;
/** PATCH /api/products/:id */
const updateProduct = async (req, res) => {
    try {
        const product = await products_model_1.default.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true, runValidators: true });
        if (!product) {
            res.status(404).json({ success: false, message: 'Product not found' });
            return;
        }
        res.json({ success: true, product });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.updateProduct = updateProduct;
/** DELETE /api/products/:id */
const deleteProduct = async (req, res) => {
    try {
        await products_model_1.default.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Product deleted' });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.deleteProduct = deleteProduct;

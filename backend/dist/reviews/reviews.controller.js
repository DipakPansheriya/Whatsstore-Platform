"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProductReview = exports.getProductReviews = void 0;
const reviews_model_1 = __importDefault(require("./reviews.model"));
/** GET /api/reviews/product/:productId — Public product reviews list */
const getProductReviews = async (req, res) => {
    try {
        const reviews = await reviews_model_1.default.find({ product: req.params.productId }).sort({ createdAt: -1 });
        res.json({ success: true, reviews });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.getProductReviews = getProductReviews;
/** POST /api/reviews/product/:productId — Public create review */
const createProductReview = async (req, res) => {
    try {
        const { name, rating, comment } = req.body;
        if (!name || !rating || !comment) {
            res.status(400).json({ success: false, message: 'Name, rating, and comment are required' });
            return;
        }
        const review = await reviews_model_1.default.create({
            product: req.params.productId,
            name,
            rating,
            comment
        });
        res.status(201).json({ success: true, review });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.createProductReview = createProductReview;

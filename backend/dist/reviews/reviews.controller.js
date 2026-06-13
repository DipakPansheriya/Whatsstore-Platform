"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateReviewStatus = exports.getAdminReviews = exports.createProductReview = exports.getProductReviews = void 0;
const reviews_model_1 = __importDefault(require("./reviews.model"));
const products_model_1 = __importDefault(require("../products/products.model"));
const business_model_1 = __importDefault(require("../business/business.model"));
const notification_model_1 = __importDefault(require("../notifications/notification.model"));
/** GET /api/reviews/product/:productId — Public product reviews list */
const getProductReviews = async (req, res) => {
    try {
        const reviews = await reviews_model_1.default.find({
            product: req.params.productId,
            status: 'APPROVED'
        }).sort({ createdAt: -1 });
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
            comment,
            status: 'PENDING'
        });
        // Generate Notification for the business owner
        const product = await products_model_1.default.findById(req.params.productId);
        if (product) {
            const business = await business_model_1.default.findById(product.business);
            if (business) {
                await notification_model_1.default.create({
                    recipient: business.owner,
                    type: 'REVIEW_NEW',
                    title: 'New Review Pending',
                    message: `You have a new ${rating}-star review for "${product.title}" from ${name}.`,
                    relatedId: review._id.toString()
                });
            }
        }
        res.status(201).json({ success: true, review });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.createProductReview = createProductReview;
/** GET /api/reviews/admin — Admin get all reviews for their products */
const getAdminReviews = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const business = await business_model_1.default.findOne({ owner: userId });
        if (!business) {
            res.status(404).json({ success: false, message: 'Business not found' });
            return;
        }
        const products = await products_model_1.default.find({ business: business._id }).select('_id');
        const productIds = products.map(p => p._id);
        const reviews = await reviews_model_1.default.find({ product: { $in: productIds } })
            .populate('product', 'title images')
            .sort({ createdAt: -1 });
        res.json({ success: true, reviews });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.getAdminReviews = getAdminReviews;
/** PUT /api/reviews/admin/:id/status — Admin approve/reject review */
const updateReviewStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
            res.status(400).json({ success: false, message: 'Invalid status' });
            return;
        }
        const review = await reviews_model_1.default.findByIdAndUpdate(req.params.id, { $set: { status } }, { new: true });
        if (!review) {
            res.status(404).json({ success: false, message: 'Review not found' });
            return;
        }
        res.json({ success: true, review });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.updateReviewStatus = updateReviewStatus;

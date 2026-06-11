"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrderStatus = exports.createOrder = exports.getPublicOrder = exports.getOrders = void 0;
const orders_model_1 = __importDefault(require("./orders.model"));
const business_model_1 = __importDefault(require("../business/business.model"));
const products_model_1 = __importDefault(require("../products/products.model"));
const subscription_model_1 = __importDefault(require("../subscriptions/subscription.model"));
const cart_model_1 = __importDefault(require("../cart/cart.model"));
const coupon_model_1 = __importDefault(require("../coupons/coupon.model"));
/** GET /api/orders (Protected: Admin lists their store orders) */
const getOrders = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const business = await business_model_1.default.findOne({ owner: userId });
        if (!business) {
            res.status(404).json({ success: false, message: 'Business not found' });
            return;
        }
        const orders = await orders_model_1.default.find({ business: business._id })
            .populate('items.product', 'title price images')
            .sort({ createdAt: -1 });
        res.json({ success: true, orders });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.getOrders = getOrders;
/** GET /api/orders/public/:id (Public: customer tracks their order) */
const getPublicOrder = async (req, res) => {
    try {
        const order = await orders_model_1.default.findById(req.params.id)
            .populate('items.product', 'title price images category')
            .populate('business', 'name logoUrl whatsappNumber');
        if (!order) {
            res.status(404).json({ success: false, message: 'Order not found' });
            return;
        }
        res.json({ success: true, order });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.getPublicOrder = getPublicOrder;
/** POST /api/orders — Public: customer places an order */
const createOrder = async (req, res) => {
    try {
        const { business, items, cartId } = req.body;
        const store = await business_model_1.default.findById(business);
        if (!store) {
            res.status(404).json({ success: false, message: 'Storefront business not found' });
            return;
        }
        // Check store owner's subscription status
        const subscription = await subscription_model_1.default.findOne({ user: store.owner });
        if (subscription) {
            // Lazy status check
            const now = new Date();
            let updated = false;
            if (subscription.status === 'TRIAL_ACTIVE' && subscription.trialEndDate < now) {
                subscription.status = 'TRIAL_EXPIRED';
                updated = true;
            }
            else if (subscription.status === 'ACTIVE' && subscription.expiryDate && subscription.expiryDate < now) {
                subscription.status = 'EXPIRED';
                updated = true;
            }
            if (updated) {
                await subscription.save();
            }
            const isAllowed = subscription.status === 'ACTIVE' || subscription.status === 'TRIAL_ACTIVE';
            if (!isAllowed) {
                res.status(403).json({
                    success: false,
                    code: 'SUBSCRIPTION_EXPIRED',
                    message: 'Checkouts are temporarily disabled for this store due to plan expiration.',
                });
                return;
            }
        }
        // Verify coupon validity and prevent double use
        const { customerPhone, couponCode } = req.body;
        if (couponCode) {
            const couponRecord = await coupon_model_1.default.findOne({ business: store._id, code: couponCode.toUpperCase() });
            if (!couponRecord || !couponRecord.isActive) {
                res.status(400).json({ success: false, message: 'Invalid or inactive coupon code.' });
                return;
            }
            if (couponRecord.expiryDate && new Date(couponRecord.expiryDate) < new Date()) {
                res.status(400).json({ success: false, message: 'This coupon has expired.' });
                return;
            }
            // Check if this customer (by phone number) has already used this coupon code
            const used = await orders_model_1.default.findOne({
                business: store._id,
                customerPhone,
                couponCode: couponCode.toUpperCase(),
                status: { $ne: 'CANCELLED' }
            });
            if (used) {
                res.status(400).json({ success: false, message: 'You have already used this coupon code.' });
                return;
            }
        }
        // Verify stock availability and deduct stock for each item
        for (const item of items) {
            const product = await products_model_1.default.findById(item.product);
            if (!product || !product.isAvailable) {
                res.status(404).json({ success: false, message: `Product "${item.name}" is no longer available` });
                return;
            }
            if (product.stock < item.quantity) {
                res.status(400).json({ success: false, message: `Only ${product.stock} items available in stock for "${product.title}"` });
                return;
            }
        }
        // Perform actual stock deduction
        for (const item of items) {
            await products_model_1.default.findByIdAndUpdate(item.product, {
                $inc: { stock: -item.quantity }
            });
        }
        // Create the order record
        const order = await orders_model_1.default.create(req.body);
        // If order was created from a guest cart session, mark the cart as converted
        if (cartId) {
            await cart_model_1.default.findOneAndUpdate({ sessionId: cartId, business: store._id }, { isConverted: true, items: [], totalAmount: 0 } // Clear cart items after successful conversion
            );
        }
        res.status(201).json({ success: true, order });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.createOrder = createOrder;
/** PATCH /api/orders/:id/status (Protected: Admin manages orders) */
const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const oldOrder = await orders_model_1.default.findById(req.params.id);
        if (!oldOrder) {
            res.status(404).json({ success: false, message: 'Order not found' });
            return;
        }
        // If order is transitioned to CANCELLED and was not previously cancelled, restore stock
        if (status === 'CANCELLED' && oldOrder.status !== 'CANCELLED') {
            for (const item of oldOrder.items) {
                await products_model_1.default.findByIdAndUpdate(item.product, {
                    $inc: { stock: item.quantity }
                });
            }
        }
        // If order is transitioned FROM CANCELLED to another status, deduct stock again
        else if (oldOrder.status === 'CANCELLED' && status !== 'CANCELLED') {
            for (const item of oldOrder.items) {
                const product = await products_model_1.default.findById(item.product);
                if (product) {
                    await products_model_1.default.findByIdAndUpdate(item.product, {
                        $inc: { stock: -Math.min(product.stock, item.quantity) } // Avoid negative stock if stock changed
                    });
                }
            }
        }
        const order = await orders_model_1.default.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true });
        res.json({ success: true, order });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.updateOrderStatus = updateOrderStatus;

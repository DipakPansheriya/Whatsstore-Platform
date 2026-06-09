"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrderStatus = exports.createOrder = exports.getOrders = void 0;
const orders_model_1 = __importDefault(require("./orders.model"));
const business_model_1 = __importDefault(require("../business/business.model"));
/** GET /api/orders */
const getOrders = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const business = await business_model_1.default.findOne({ owner: userId });
        if (!business) {
            res.status(404).json({ success: false, message: 'Business not found' });
            return;
        }
        const orders = await orders_model_1.default.find({ business: business._id })
            .populate('items.product', 'title price')
            .sort({ createdAt: -1 });
        res.json({ success: true, orders });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.getOrders = getOrders;
/** POST /api/orders — Public: customer places an order */
const createOrder = async (req, res) => {
    try {
        const order = await orders_model_1.default.create(req.body);
        res.status(201).json({ success: true, order });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.createOrder = createOrder;
/** PATCH /api/orders/:id/status */
const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const order = await orders_model_1.default.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true });
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
exports.updateOrderStatus = updateOrderStatus;

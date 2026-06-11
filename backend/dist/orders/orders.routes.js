"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const orders_controller_1 = require("./orders.controller");
const jwt_1 = require("../config/jwt");
const subscription_guard_1 = require("../config/subscription-guard");
const router = (0, express_1.Router)();
// Public
router.post('/', orders_controller_1.createOrder);
router.get('/public/:id', orders_controller_1.getPublicOrder);
// Protected: business manages orders
router.use(jwt_1.protect);
router.use(subscription_guard_1.subscriptionGuard);
router.get('/', orders_controller_1.getOrders);
router.patch('/:id/status', orders_controller_1.updateOrderStatus);
exports.default = router;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const orders_controller_1 = require("./orders.controller");
const jwt_1 = require("../config/jwt");
const router = (0, express_1.Router)();
// Public: customer places order
router.post('/', orders_controller_1.createOrder);
// Protected: business manages orders
router.use(jwt_1.protect);
router.get('/', orders_controller_1.getOrders);
router.patch('/:id/status', orders_controller_1.updateOrderStatus);
exports.default = router;

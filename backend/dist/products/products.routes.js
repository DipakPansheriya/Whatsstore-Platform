"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const products_controller_1 = require("./products.controller");
const jwt_1 = require("../config/jwt");
const subscription_guard_1 = require("../config/subscription-guard");
const router = (0, express_1.Router)();
// Public
router.get('/public/:businessId', products_controller_1.getPublicProducts);
router.get('/public/product/:id', products_controller_1.getPublicProduct);
// Protected
router.use(jwt_1.protect);
router.use(subscription_guard_1.subscriptionGuard);
router.get('/', products_controller_1.getProducts);
router.post('/', products_controller_1.createProduct);
router.patch('/:id', products_controller_1.updateProduct);
router.delete('/:id', products_controller_1.deleteProduct);
exports.default = router;

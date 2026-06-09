"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reviews_controller_1 = require("./reviews.controller");
const router = (0, express_1.Router)();
// Public routes for product reviews
router.get('/product/:productId', reviews_controller_1.getProductReviews);
router.post('/product/:productId', reviews_controller_1.createProductReview);
exports.default = router;

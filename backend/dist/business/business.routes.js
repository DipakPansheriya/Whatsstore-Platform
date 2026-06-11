"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const business_controller_1 = require("./business.controller");
const jwt_1 = require("../config/jwt");
const subscription_guard_1 = require("../config/subscription-guard");
const router = (0, express_1.Router)();
// Public
router.get('/store/:slug', business_controller_1.getPublicStore);
// Protected
router.use(jwt_1.protect);
router.use(subscription_guard_1.subscriptionGuard);
router.get('/me', business_controller_1.getMyBusiness);
router.post('/', business_controller_1.createBusiness);
router.patch('/me', business_controller_1.updateBusiness);
exports.default = router;

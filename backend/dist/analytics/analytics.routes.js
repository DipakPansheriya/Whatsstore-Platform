"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const analytics_controller_1 = require("./analytics.controller");
const jwt_1 = require("../config/jwt");
const router = (0, express_1.Router)();
// Public event tracker
router.post('/track', analytics_controller_1.trackEvent);
// Protected merchant analytics dashboard stats
router.get('/dashboard', jwt_1.protect, analytics_controller_1.getAnalyticsDashboard);
exports.default = router;

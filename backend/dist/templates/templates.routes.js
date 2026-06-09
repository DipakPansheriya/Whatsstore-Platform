"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const templates_controller_1 = require("./templates.controller");
const router = (0, express_1.Router)();
router.get('/', templates_controller_1.getTemplates);
router.get('/:id', templates_controller_1.getTemplate);
exports.default = router;

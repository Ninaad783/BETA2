"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.purchaseRouter = void 0;
const express_1 = require("express");
const purchase_controller_1 = require("../controllers/purchase.controller");
exports.purchaseRouter = (0, express_1.Router)();
exports.purchaseRouter.get('/', purchase_controller_1.getPurchaseInvoices);
exports.purchaseRouter.post('/', purchase_controller_1.createPurchaseInvoice);

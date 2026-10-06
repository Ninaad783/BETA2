"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supplierRouter = void 0;
const express_1 = require("express");
const supplier_controller_1 = require("../controllers/supplier.controller");
exports.supplierRouter = (0, express_1.Router)();
exports.supplierRouter.get('/', supplier_controller_1.getSuppliers);
exports.supplierRouter.post('/', supplier_controller_1.createSupplier);

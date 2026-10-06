"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.customerRouter = void 0;
const express_1 = require("express");
const customer_controller_1 = require("../controllers/customer.controller");
exports.customerRouter = (0, express_1.Router)();
// Routes (can be accessed with or without auth, store fallback applied)
exports.customerRouter.get('/', customer_controller_1.getCustomers);
exports.customerRouter.get('/:id', customer_controller_1.getCustomerById);
exports.customerRouter.post('/', customer_controller_1.createCustomer);
exports.customerRouter.put('/:id', customer_controller_1.updateCustomer);

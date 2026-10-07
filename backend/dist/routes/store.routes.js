"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storeRouter = void 0;
const express_1 = require("express");
const store_controller_1 = require("../controllers/store.controller");
exports.storeRouter = (0, express_1.Router)();
exports.storeRouter.get('/', store_controller_1.getStoreProfile);
exports.storeRouter.put('/', store_controller_1.updateStoreProfile);

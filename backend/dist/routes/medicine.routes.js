"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.medicineRouter = void 0;
const express_1 = require("express");
const medicine_controller_1 = require("../controllers/medicine.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
exports.medicineRouter = (0, express_1.Router)();
// Fast search 1,000+ Master Catalog
exports.medicineRouter.get('/master', medicine_controller_1.searchMasterMedicines);
// Unified search for Billing & Counter POS (In-stock + Master suggestions)
exports.medicineRouter.get('/search', medicine_controller_1.searchUnifiedMedicines);
// Inward a master catalog medicine directly to store inventory (Pharmacist / Admin)
exports.medicineRouter.post('/inward-from-master', auth_middleware_1.authenticateToken, medicine_controller_1.inwardFromMaster);

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = require("./db");
const auth_routes_1 = require("./routes/auth.routes");
const medicine_routes_1 = require("./routes/medicine.routes");
const customer_routes_1 = require("./routes/customer.routes");
const sale_routes_1 = require("./routes/sale.routes");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Base Health Check
app.get("/api/health", (_req, res) => {
    res.json({
        success: true,
        message: "MedEasy Pharmacy OS backend is running",
        timestamp: new Date().toISOString(),
    });
});
// Database Health Check
app.get("/api/db/health", async (_req, res) => {
    try {
        const result = await db_1.pool.query("SELECT NOW() as db_time, current_database() as database_name;");
        res.json({
            success: true,
            status: "connected",
            database: result.rows[0].database_name,
            time: result.rows[0].db_time,
        });
    }
    catch (error) {
        res.status(503).json({
            success: false,
            status: "disconnected",
            message: "PostgreSQL database not connected or credentials not configured in .env",
            error: error.message,
        });
    }
});
// Authentication Routes
app.use("/api/auth", auth_routes_1.authRouter);
// Medicine Catalog & Search Routes
app.use("/api/medicines", medicine_routes_1.medicineRouter);
// Customer Directory Routes
app.use("/api/customers", customer_routes_1.customerRouter);
// Sales & POS Invoicing Routes
app.use("/api/sales", sale_routes_1.saleRouter);
// Start server
app.listen(PORT, () => {
    console.log(`MedEasy Pharmacy OS backend running on http://localhost:${PORT}`);
});

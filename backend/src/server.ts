import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { pool } from "./db";
import { authRouter } from "./routes/auth.routes";
import { medicineRouter } from "./routes/medicine.routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

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
    const result = await pool.query("SELECT NOW() as db_time, current_database() as database_name;");
    res.json({
      success: true,
      status: "connected",
      database: result.rows[0].database_name,
      time: result.rows[0].db_time,
    });
  } catch (error: any) {
    res.status(503).json({
      success: false,
      status: "disconnected",
      message: "PostgreSQL database not connected or credentials not configured in .env",
      error: error.message,
    });
  }
});

// Authentication Routes
app.use("/api/auth", authRouter);

// Medicine Catalog & Search Routes
app.use("/api/medicines", medicineRouter);

// Start server
app.listen(PORT, () => {
  console.log(`MedEasy Pharmacy OS backend running on http://localhost:${PORT}`);
});
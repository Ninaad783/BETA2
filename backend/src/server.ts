import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    message: "BETA-1 backend is running",
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`BETA-1 backend running on http://localhost:${PORT}`);
});
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./configs/db";
import authRoutes from "./routes/auth.route";
import userRoutes from "./routes/user.route";

dotenv.config();
const app = express();

// CORS
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));

// Connect to database
connectDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

// Test endpoint
app.get("/", (req, res) => {
  res.json({ 
    message: "Splito Backend API", 
    version: "1.0.0",
    status: "running"
  });
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "OK", 
    timestamp: new Date().toISOString(),
    service: "splito-backend"
  });
});

// ✅ TEMPORARY: Skip the problematic 404 handler while we debug
// We'll add it back later when upload is working

// ✅ Global error handler
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("🔥 Global error handler:", error);
  
  // If headers already sent, delegate to default handler
  if (res.headersSent) {
    return next(error);
  }
  
  // Return JSON error response
  res.status(error.status || 500).json({
    success: false,
    message: error.message || "Internal server error",
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📡 Local: http://localhost:${PORT}`);
  console.log(`📁 Uploads: http://localhost:${PORT}/uploads`);
});
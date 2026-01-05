import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./configs/db";
import authRoutes from "./routes/auth.route";

dotenv.config();
const app = express();

app.use(cors({
  origin: 'http://localhost:3000', // or 3001 if your Next.js is running there
  credentials: true
}));
app.use(express.json());

connectDB();

app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

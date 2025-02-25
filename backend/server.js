import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import helmet from "helmet";
import voteRoutes from "./routes/voteRoutes.js";
import { connectDB } from "./config/db.js";

// Load environment variables
dotenv.config();

// Create Express app instance
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(helmet());
app.use(morgan("dev"));

// API Routes
app.use("/api/vote", voteRoutes);

// Database connection check
connectDB().then(() => {
  console.log("✅ MongoDB Connected");
}).catch((error) => {
  console.error("❌ MongoDB connection failed:", error);
});

// Start server with environment port or fallback to default 5001
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

// Optional: Aries Agent Connection (to be used if needed in future)
const { ARIES_AGENT_HOST, ARIES_AGENT_PORT } = process.env;
if (ARIES_AGENT_HOST && ARIES_AGENT_PORT) {
  console.log(`✅ Aries Agent is running at ${ARIES_AGENT_HOST}:${ARIES_AGENT_PORT}`);
} else {
  console.warn("❌ Aries Agent is not configured properly.");
}

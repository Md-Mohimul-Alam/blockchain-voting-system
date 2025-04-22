// server.js
import express from "express";
import dotenv from "dotenv";
import path from "path";
import cors from "cors";
import votingRoutes from "./routes/votingRoutes.js";

dotenv.config();
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Enable CORS for frontend communication
app.use(cors());

// Serve static files (uploaded profile images)
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Routes
app.use("/api/voting", votingRoutes);

// Server listen
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

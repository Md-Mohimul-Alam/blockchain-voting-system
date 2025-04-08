import express from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import morgan from "morgan";
import helmet from "helmet";
import connectDB from "./config/db.js"; // ✅ MongoDB Connection
import routes from "./routes/routes.js"; // Import the consolidated routes

dotenv.config();

const app = express();

// ✅ Middleware
app.use(cors());
app.use(express.json());
app.use(helmet());
app.use(morgan("dev"));

// ✅ Connect to MongoDB
connectDB();

// ✅ API Routes
app.use('/api', routes); // Use the consolidated routes for all API routes

// Get the directory path of the current module in ES Modules
const __dirname = path.dirname(new URL(import.meta.url).pathname);
const uploadsPath = path.join(__dirname, 'uploads');

// Serve images stored in the 'uploads' folder
app.use('/uploads', express.static(uploadsPath));  // This serves the 'uploads/' folder as static content

// ✅ Home Route
app.get("/", (req, res) => {
  res.send("Blockchain-Based E-Voting System API is running...");
});

// ✅ Start Server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import votingRoutes from "./routes/votingRoutes.js";

dotenv.config();
const app = express();

app.use(cors()); // Allow frontend access

app.use(express.json()); // Required to parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Required for form data
app.use("/api/voting", votingRoutes); // Prefix route

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

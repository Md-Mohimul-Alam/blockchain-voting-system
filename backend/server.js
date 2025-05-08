// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import votingRoutes from "./routes/votingRoutes.js";

dotenv.config();
const app = express();

app.use(cors());

// server.js or app.js
app.use(express.json({ limit: '40mb' }));
app.use(express.urlencoded({ limit: '40mb', extended: true }));

app.use("/api/voting", votingRoutes);

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));

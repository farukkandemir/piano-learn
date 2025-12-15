import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import imageCoversRouter from "./routes/image-covers.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

app.use("/api/image-covers", imageCoversRouter);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

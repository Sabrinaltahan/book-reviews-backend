import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth";

import reviewsRoutes from "./routes/reviews";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/reviews",reviewsRoutes);

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
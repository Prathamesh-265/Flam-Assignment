import "dotenv/config";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import generateRouter from "./routes/generate.js";
import { notFound, errorHandler } from "./middleware/errors.js";

const app = express();
const PORT = process.env.PORT || 3001;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";
const distDir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../dist",
);

app.set("trust proxy", 1);
app.disable("x-powered-by");
app.use(helmet());
app.use(cors({ origin: CLIENT_ORIGIN, methods: ["GET", "POST"] }));
app.use(express.json({ limit: "16kb" }));

app.use(
  "/api",
  rateLimit({
    windowMs: 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: "Too many requests. Please wait a minute and try again.",
      code: "RATE_LIMITED",
    },
  }),
);

app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.use("/api/generate", generateRouter);

// In production, serve the built React app from the same server.
app.use(express.static(distDir));
app.get(/^\/(?!api).*/, (_req, res) =>
  res.sendFile(path.join(distDir, "index.html")),
);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
  if (!process.env.GEMINI_API_KEY) {
    console.warn(
      "Heads up: GEMINI_API_KEY is not set. Copy .env.example to .env and add your key.",
    );
  }
});

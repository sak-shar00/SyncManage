import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { clerkMiddleware } from "@clerk/express";
import { serve } from "inngest/express";
import { inngest, functions } from "./inngest/index.js";

// Config dotenv
dotenv.config();

const app = express();

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json());
app.use(clerkMiddleware());

// Basic request logging (helps diagnose Vercel 500s)
app.use((req, _res, next) => {
  console.log(`[req] ${req.method} ${req.originalUrl}`);
  next();
});

app.use("/api/inngest", serve({ client: inngest, functions }));

// Test Route
app.get("/", (req, res) => {
  res.send("Server is running successfully");
});

// Sample API Route
app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "API working properly",
  });
});

// PORT
const PORT = process.env.PORT || 5000;

// Error handler (ensures Vercel logs show the stacktrace)
app.use((err, _req, res, _next) => {
  console.error("[error]", err);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error: err?.message,
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

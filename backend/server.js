import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { clerkMiddleware } from '@clerk/express'
import { serve } from "inngest/express";
import { inngest, functions } from "./inngest/index.js"

// Config dotenv
dotenv.config();

const app = express();

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(clerkMiddleware())
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

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
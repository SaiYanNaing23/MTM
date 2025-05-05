import express from "express";
import dotenv from "dotenv"
import connectDB from "./lib/db.js";
import authRoutes from "./routers/auth.routes.js";

// Configuration
dotenv.config();
const app = express();

// Routers
app.use("/api/auth", authRoutes)

app.listen(process.env.PORT, () => {
    console.log(`server is running on ${process.env.PORT}`);
    connectDB();
})
import express from "express";
import dotenv from "dotenv"
import connectDB from "./lib/db.js";
import authRoutes from "./routers/auth.routes.js";
import cookieParser from "cookie-parser";
import userRoutes from "./routers/user.routes.js";
import chatRoutes from "./routers/chat.routes.js";

// Configuration
dotenv.config();
const app = express();
app.use(express.json());
app.use(cookieParser());

// Routers
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/chat", chatRoutes)

app.listen(process.env.PORT, () => {
    console.log(`server is running on ${process.env.PORT}`);
    connectDB();
})
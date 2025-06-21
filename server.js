import dotenv from "dotenv";
import express from "express";
import { createServer } from "http";
import connectDB from "./db/connectDB.js";
import { Server } from "socket.io";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import carRoutes from "./routes/car-routes.js";
import authRoutes from "./routes/auth-routes.js";
import brandRoutes from "./routes/brand-routes.js";

dotenv.config();

await connectDB();

const PORT = process.env.PORT || 5000;
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { methods: ["GET", "POST"] });

app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:5173", "https://autoplac-frontend.vercel.app"],
    credentials: true,
  })
);
app.use(helmet());
app.use(cookieParser());

app.get("/", (req, res) => {
  console.log("AUTOPLAC API ");
  res.send("Welcome to AUTOPLAC API");
});

app.use("/api/auth", authRoutes);
app.use("/api/cars", carRoutes);
app.use("/api", brandRoutes);

app.use((error, req, res, next) => {
  console.error(error);
  res
    .status(error.statusCode || 500)
    .json({ message: error.message || "Something went wrong" });
});

io.on("connection", (socket) => {});

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

process.on("SIGINT", () => {
  console.log("Closing connections");
  io.close();
  httpServer.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});

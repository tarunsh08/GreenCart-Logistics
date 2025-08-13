import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./db/db.js";
import authRoutes from "./routes/authRoutes.js";
import { protect } from "./middleware/auth.js";
import driverRoutes from "./routes/driverRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import routeRoutes from "./routes/routeRoutes.js";
import simulationRoutes from "./routes/simulationRoutes.js";

dotenv.config();
const app = express();

const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
    origin: "https://green-cart-logistics-phi.vercel.app",
    credentials: true
}));
app.use(express.json());

// Log all requests
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Routes
app.use("/api/auth", authRoutes);

// Protected routes
app.use("/api/drivers", protect, driverRoutes);
app.use("/api/orders", protect, orderRoutes);
app.use("/api/routes", protect, routeRoutes);
app.use("/api/simulation", protect, simulationRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Global error handler:', err);
    res.status(500).json({
        message: 'Something went wrong!',
        ...(process.env.NODE_ENV === 'development' && { error: err.message })
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

export default app;

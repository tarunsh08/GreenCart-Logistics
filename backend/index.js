import express from "express";
import dotenv from "dotenv"
import cors from "cors"
import { connectDB } from "./db/db.js";
import authRoutes from "./routes/authRoutes.js"
import { protect } from "./middleware/auth.js";
import driverRoutes from "./routes/driverRoutes.js";
import simulationRoutes from "./routes/simulationRoutes.js";

dotenv.config();
const app = express();

const PORT = process.env.PORT || 3000;

connectDB();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes)

app.use("/api/drivers", protect, driverRoutes);  
app.use("/api/simulation", simulationRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

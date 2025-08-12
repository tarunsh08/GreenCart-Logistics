import express from "express";
import { connectDB } from "./db/db.js";
import driverRoutes from "./routes/driverRoutes.js";

const app = express();

const PORT = process.env.PORT || 3000;

connectDB();

app.use(express.json());
app.use("/api/drivers", driverRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

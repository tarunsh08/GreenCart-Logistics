import express from "express";
import { runSimulation, getSimulationHistory, getSimulationStats } from "../controllers/simulation.controller.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/run", protect, runSimulation);
router.get("/history", protect, getSimulationHistory);
router.get("/stats", protect, getSimulationStats);

export default router;

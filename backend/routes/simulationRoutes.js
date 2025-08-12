import express from "express";
import { runSimulation, getSimulationHistory } from "../controllers/simulation.controller.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/run", protect, runSimulation);
router.get("/history", protect, getSimulationHistory);

export default router;

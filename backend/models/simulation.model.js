import mongoose from "mongoose";

const SimulationResultSchema = new mongoose.Schema({
  kpis: {
    avgDeliveryTime: Number,
    onTimePercentage: Number,
    fuelConsumption: Number,
    totalOrders: Number
  },
  summary: {
    totalDrivers: Number,
    totalRoutes: Number,
    totalOrders: Number
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true 
  }
});

export default mongoose.model("SimulationResult", SimulationResultSchema);

import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  revenue: { type: Number, default: 0 },
  cost: { type: Number, default: 0 },
  status: { type: String, enum: ['Pending', 'In Progress', 'Delivered', 'Failed'], default: 'Pending' },
  isLate: { type: Boolean, default: false },
  vehicleType: { type: String, default: 'Standard' },
  fuelCost: { type: Number, default: 0 },
  deliveryTime: { type: Number, default: 0 },
  distance: { type: Number, default: 0 },
  estimatedTime: { type: Number, default: 0 },
  actualTime: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const SimulationResultSchema = new mongoose.Schema({
  kpis: {
    avgDeliveryTime: Number,
    onTimePercentage: Number,
    fuelConsumption: Number,
    totalOrders: Number,
    totalRevenue: Number,
    totalCost: Number,
    efficiencyScore: Number
  },
  summary: {
    totalDrivers: Number,
    totalRoutes: Number,
    totalOrders: Number,
    onTimeDeliveries: Number,
    lateDeliveries: Number
  },
  orders: [orderSchema],
  fuelCosts: {
    type: Map,
    of: Number,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true 
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field on save
SimulationResultSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model("SimulationResult", SimulationResultSchema);

import mongoose from "mongoose";

const DriverSchema = new mongoose.Schema({
  name: { type: String, required: true },
  shift_hours: { type: Number, default: 0 }, 
  past_week_hours: { type: [Number], default: [] } 
}, { timestamps: true });

const Driver = mongoose.model("Driver", DriverSchema);

export default Driver;

import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
  order_id: { type: Number, required: true, unique: true },
  value_rs: { type: Number, required: true },
  route: { type: mongoose.Schema.Types.ObjectId, ref: "Route", required: true },
  delivery_time: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const Order = mongoose.model("Order", OrderSchema);

export default Order;

import express from "express";
import Order from "../models/order.model.js";
import Route from "../models/route.model.js";

const router = express.Router();

// Get all orders
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find().populate('route');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single order
router.get("/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('route');
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new order
router.post("/", async (req, res) => {
  try {
    const { order_id, value_rs, route, delivery_time } = req.body;
    
    // Check if route exists
    const routeExists = await Route.findById(route);
    if (!routeExists) {
      return res.status(400).json({ message: "Route not found" });
    }

    const newOrder = new Order({
      order_id,
      value_rs,
      route,
      delivery_time: delivery_time || new Date()
    });

    const savedOrder = await newOrder.save();
    const populatedOrder = await Order.findById(savedOrder._id).populate('route');
    res.status(201).json(populatedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update an order
router.put("/:id", async (req, res) => {
  try {
    const { order_id, value_rs, route, delivery_time } = req.body;
    
    if (route) {
      const routeExists = await Route.findById(route);
      if (!routeExists) {
        return res.status(400).json({ message: "Route not found" });
      }
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { order_id, value_rs, route, delivery_time },
      { new: true }
    ).populate('route');

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(updatedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete an order
router.delete("/:id", async (req, res) => {
  try {
    const deletedOrder = await Order.findByIdAndDelete(req.params.id);
    if (!deletedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

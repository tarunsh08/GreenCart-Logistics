import express from "express";
import Route from "../models/route.model.js";

const router = express.Router();

// Get all routes
router.get("/", async (req, res) => {
  try {
    const routes = await Route.find();
    res.json(routes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single route
router.get("/:id", async (req, res) => {
  try {
    const route = await Route.findById(req.params.id);
    if (!route) return res.status(404).json({ message: "Route not found" });
    res.json(route);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new route
router.post("/", async (req, res) => {
  try {
    const { route_id, distance_km, traffic_level, base_time_min } = req.body;
    
    // Validate traffic level
    const validTrafficLevels = ["Low", "Medium", "High"];
    if (!validTrafficLevels.includes(traffic_level)) {
      return res.status(400).json({ 
        message: "Invalid traffic level. Must be one of: Low, Medium, High" 
      });
    }

    const newRoute = new Route({
      route_id,
      distance_km,
      traffic_level,
      base_time_min
    });

    const savedRoute = await newRoute.save();
    res.status(201).json(savedRoute);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a route
router.put("/:id", async (req, res) => {
  try {
    const { route_id, distance_km, traffic_level, base_time_min } = req.body;
    
    // Validate traffic level if provided
    if (traffic_level) {
      const validTrafficLevels = ["Low", "Medium", "High"];
      if (!validTrafficLevels.includes(traffic_level)) {
        return res.status(400).json({ 
          message: "Invalid traffic level. Must be one of: Low, Medium, High" 
        });
      }
    }

    const updatedRoute = await Route.findByIdAndUpdate(
      req.params.id,
      { route_id, distance_km, traffic_level, base_time_min },
      { new: true }
    );

    if (!updatedRoute) {
      return res.status(404).json({ message: "Route not found" });
    }

    res.json(updatedRoute);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a route
router.delete("/:id", async (req, res) => {
  try {
    // Check if there are any orders referencing this route
    const Order = (await import("../models/order.model.js")).default;
    const ordersWithRoute = await Order.find({ route: req.params.id });
    
    if (ordersWithRoute.length > 0) {
      return res.status(400).json({ 
        message: "Cannot delete route as it is being used by one or more orders" 
      });
    }

    const deletedRoute = await Route.findByIdAndDelete(req.params.id);
    if (!deletedRoute) {
      return res.status(404).json({ message: "Route not found" });
    }
    
    res.json({ message: "Route deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

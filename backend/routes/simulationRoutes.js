import express from "express";
import Driver from "../models/driver.model.js";
import RouteModel from "../models/route.model.js";
import Order from "../models/order.model.js";

const router = express.Router();

/**
 * @desc Simulate delivery allocation & calculate KPIs (with company rules)
 * @route POST /simulate
 */
router.post("/", async (req, res) => {
  try {
    const { available_drivers, route_start_time, max_hours_per_driver } = req.body;

    // 1️⃣ Validation
    if (
      available_drivers === undefined ||
      route_start_time === undefined ||
      max_hours_per_driver === undefined
    ) {
      return res.status(400).json({
        error: "Missing required parameters",
        required: ["available_drivers", "route_start_time", "max_hours_per_driver"]
      });
    }

    if (
      typeof available_drivers !== "number" ||
      available_drivers <= 0 ||
      typeof max_hours_per_driver !== "number" ||
      max_hours_per_driver <= 0 ||
      !/^\d{2}:\d{2}$/.test(route_start_time)
    ) {
      return res.status(400).json({
        error: "Invalid parameter format",
        rules: {
          available_drivers: "Positive number",
          route_start_time: "String in HH:MM format",
          max_hours_per_driver: "Positive number"
        }
      });
    }

    // 2️⃣ Fetch data
    const orders = await Order.find();
    const routes = await RouteModel.find();
    const drivers = await Driver.find().limit(available_drivers);

    if (!orders.length || !routes.length || !drivers.length) {
      return res.status(404).json({ error: "Not enough data to run simulation" });
    }

    // 3️⃣ Order allocation (round-robin)
    let driverIndex = 0;
    const allocatedOrders = orders.map(order => {
      const driver = drivers[driverIndex];
      driverIndex = (driverIndex + 1) % drivers.length;
      return { ...order.toObject(), assigned_driver: driver.name };
    });

    // 4️⃣ Apply rules & calculate KPIs
    let totalRevenue = 0;
    let totalProfit = 0;
    let totalTime = 0;
    let onTimeCount = 0;
    let penaltiesTotal = 0;
    let bonusTotal = 0;
    let fuelCostTotal = 0;

    allocatedOrders.forEach(order => {
      const route = routes.find(r => r.route_id === order.assigned_route);
      const driver = drivers.find(d => d.name === order.assigned_driver);
      if (!route || !driver) return;

      // Traffic multiplier
      let trafficMultiplier = 1;
      let fuelSurcharge = 0;
      if (route.traffic_level === "High") {
        trafficMultiplier = 1.5;
        fuelSurcharge = 2; // ₹2/km surcharge
      } else if (route.traffic_level === "Medium") {
        trafficMultiplier = 1.2;
      }

      // Fatigue Rule
      if (driver.current_shift_hours > 8) {
        trafficMultiplier *= 1.3; // speed decrease → more time
      }

      // Expected & Actual Time
      const expectedTime = route.base_time + 10; // rule: base + 10 minutes tolerance
      const actualTime = route.base_time * trafficMultiplier; // simulated delivery time
      totalTime += actualTime;

      // Revenue (order value)
      const orderValue = Number(order.value_rs) || 0;
      totalRevenue += orderValue;

      // Penalty Rule
      let penalty = 0;
      if (actualTime > expectedTime) {
        penalty = 50;
        penaltiesTotal += penalty;
      }

      // Bonus Rule
      let bonus = 0;
      if (orderValue > 1000 && actualTime <= expectedTime) {
        bonus = orderValue * 0.1;
        bonusTotal += bonus;
      }

      // Fuel cost rule
      const fuelCost = (route.distance_km * (5 + fuelSurcharge));
      fuelCostTotal += fuelCost;

      // Profit per order
      const orderProfit = orderValue + bonus - penalty - fuelCost;
      totalProfit += orderProfit;

      // On-Time delivery count
      if (actualTime <= expectedTime) {
        onTimeCount++;
      }
    });

    const totalOrders = allocatedOrders.length;
    const avgDeliveryTime = totalOrders ? totalTime / totalOrders : 0;
    const onTimePercentage = totalOrders ? (onTimeCount / totalOrders) * 100 : 0;
    const efficiencyScore = totalOrders ? (onTimeCount / totalOrders) * 100 : 0;

    const driverUtilization = drivers.map(driver => ({
      driver: driver.name,
      utilization_percent: ((max_hours_per_driver - driver.current_shift_hours) / max_hours_per_driver) * 100
    }));

    // 5️⃣ Send results
    res.json({
      simulation_parameters: { available_drivers, route_start_time, max_hours_per_driver },
      kpis: {
        total_orders: totalOrders,
        total_revenue_rs: totalRevenue,
        total_profit_rs: totalProfit,
        total_penalties_rs: penaltiesTotal,
        total_bonus_rs: bonusTotal,
        total_fuel_cost_rs: fuelCostTotal,
        avg_delivery_time_minutes: avgDeliveryTime,
        on_time_delivery_percent: onTimePercentage,
        efficiency_score: efficiencyScore
      },
      driver_utilization: driverUtilization
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

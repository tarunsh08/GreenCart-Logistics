import mongoose from "mongoose";
import csv from "csvtojson";
import Order from "../models/order.model.js";
import Driver from "../models/driver.model.js";
import Route from "../models/route.model.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Get the current directory name in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from the parent directory
const envPath = path.join(__dirname, '..', '.env');
dotenv.config({ path: envPath });

// Debug log to check environment variables
console.log('Environment variables:', {
  MONGO_URI: process.env.MONGO_URI ? '*** URI is set ***' : '!!! URI is NOT set !!!',
  EnvPath: envPath
});

const loadCSV = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in environment variables');
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Function to get absolute path for CSV files
    const getCsvPath = (filename) => path.join(__dirname, '..', 'data', filename);

    // Clear existing data
    await Promise.all([
      Order.deleteMany({}),
      Driver.deleteMany({}),
      Route.deleteMany({})
    ]);
    console.log("Cleared existing data");

    // Load and process drivers
    console.log("Loading drivers...");
    const driversData = await csv().fromFile(getCsvPath('drivers.csv'));
    const processedDrivers = driversData.map(driver => ({
      name: driver.name,
      shift_hours: parseInt(driver.shift_hours),
      past_week_hours: driver.past_week_hours.split('|').map(Number)
    }));
    const drivers = await Driver.insertMany(processedDrivers);
    console.log(`Loaded ${drivers.length} drivers`);

    // Load routes first
    console.log("Loading routes...");
    const routesData = await csv().fromFile(getCsvPath('routes.csv'));
    const routes = await Route.insertMany(routesData.map(route => ({
      route_id: parseInt(route.route_id),
      distance_km: parseFloat(route.distance_km),
      traffic_level: route.traffic_level,
      base_time_min: parseInt(route.base_time_min)
    })));
    console.log(`Loaded ${routes.length} routes`);

    // Create a map of route_id to MongoDB _id
    const routeMap = {};
    routes.forEach(route => {
      routeMap[route.route_id] = route._id;
    });

    // Load orders with route references
    console.log("Loading orders...");
    const ordersData = await csv().fromFile(getCsvPath('orders.csv'));
    const orders = await Order.insertMany(ordersData.map(order => ({
      order_id: parseInt(order.order_id),
      value_rs: parseFloat(order.value_rs),
      route: routeMap[parseInt(order.route_id)],  // Reference the route _id
      delivery_time: order.delivery_time
    })));
    console.log(`Loaded ${orders.length} orders`);

    console.log("All data loaded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error loading CSV data:", error);
    process.exit(1);
  }
};

loadCSV();

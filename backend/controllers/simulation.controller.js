import SimulationResult from "../models/simulation.model.js";
import Order from "../models/order.model.js";
import Driver from "../models/driver.model.js";
import moment from "moment";

const calculateKPIs = (orders, drivers) => {
    const totalOrders = orders.length;
    const deliveredOrders = orders.filter(o => o.status === "Delivered").length;
    const avgDeliveryTime = totalOrders > 0
        ? (orders.reduce((sum, o) => sum + (o.deliveryTime || 0), 0) / totalOrders).toFixed(2)
        : 0;
    
    return {
        totalOrders,
        deliveredOrders,
        avgDeliveryTime
    };
};

export const runSimulation = async (req, res) => {
    try {
        const { availableDrivers, startTime, maxHoursPerDriver } = req.body;

        if (!availableDrivers || !startTime || !maxHoursPerDriver) {
            return res.status(400).json({ error: "Missing required parameters" });
        }

        if (isNaN(availableDrivers) || isNaN(maxHoursPerDriver)) {
            return res.status(400).json({ error: "Invalid number values" });
        }

        const orders = await Order.find().lean();
        const drivers = await Driver.find().limit(Number(availableDrivers)).lean();

        if (!orders.length || !drivers.length) {
            return res.status(400).json({ error: "Not enough data to run simulation" });
        }

        let driverIndex = 0;
        const allocatedOrders = orders.map(order => {
            const assignedDriver = drivers[driverIndex];
            driverIndex = (driverIndex + 1) % drivers.length;
            return {
                ...order,
                driverId: assignedDriver._id,
                status: "Delivered",
                deliveryTime: Math.random() * maxHoursPerDriver 
            };
        });

        const kpis = calculateKPIs(allocatedOrders, drivers);

        const savedResult = await SimulationResult.create({
            timestamp: moment().toISOString(),
            parameters: {
                availableDrivers,
                startTime,
                maxHoursPerDriver
            },
            KPIs: kpis
        });

        return res.status(200).json({
            message: "Simulation completed",
            KPIs: kpis,
            simulationId: savedResult._id
        });

    } catch (err) {
        console.error("Simulation error:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export const getSimulationHistory = async (req, res) => {
    try {
        const history = await SimulationResult.find()
            .sort({ timestamp: -1 })
            .limit(10) 
            .lean();

        return res.status(200).json(history);
    } catch (err) {
        console.error("History fetch error:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export const getSimulationStats = async (req, res) => {
    try {
        // Get all simulation results
        const simulations = await SimulationResult.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .lean();
        
        if (!simulations || simulations.length === 0) {
            // Return default values if no simulations exist yet
            return res.json({
                totalProfit: 0,
                efficiencyScore: 0,
                onTime: 0,
                late: 0,
                fuelCosts: {},
                lastUpdated: new Date()
            });
        }

        // Use the latest simulation
        const latestSimulation = simulations[0];
        
        // If we have orders, calculate stats from them
        if (latestSimulation.orders && latestSimulation.orders.length > 0) {
            // Calculate total profit
            const totalProfit = latestSimulation.orders.reduce((sum, order) => {
                const revenue = order.revenue || 0;
                const cost = order.cost || 0;
                return sum + (revenue - cost);
            }, 0);

            // Calculate efficiency score (percentage of on-time deliveries)
            const totalOrders = latestSimulation.orders.length;
            const onTimeDeliveries = latestSimulation.orders.filter(
                order => order.status === 'Delivered' && !order.isLate
            ).length;
            const efficiencyScore = Math.round((onTimeDeliveries / totalOrders) * 100) || 0;
            const lateDeliveries = totalOrders - onTimeDeliveries;

            // Calculate fuel cost breakdown
            const fuelCosts = latestSimulation.orders.reduce((acc, order) => {
                const vehicleType = order.vehicleType || 'Standard';
                const cost = order.fuelCost || 0;
                acc[vehicleType] = (acc[vehicleType] || 0) + cost;
                return acc;
            }, {});

            // Prepare response
            const stats = {
                totalProfit,
                efficiencyScore,
                onTime: onTimeDeliveries,
                late: lateDeliveries,
                fuelCosts,
                lastUpdated: latestSimulation.updatedAt || latestSimulation.createdAt || new Date()
            };

            return res.json(stats);
        } 
        // If no orders but we have kpis in the simulation, use those
        else if (latestSimulation.kpis) {
            return res.json({
                totalProfit: (latestSimulation.kpis.totalRevenue || 0) - (latestSimulation.kpis.totalCost || 0),
                efficiencyScore: latestSimulation.kpis.efficiencyScore || 0,
                onTime: latestSimulation.summary?.onTimeDeliveries || 0,
                late: latestSimulation.summary?.lateDeliveries || 0,
                fuelCosts: latestSimulation.fuelCosts || {},
                lastUpdated: latestSimulation.updatedAt || latestSimulation.createdAt || new Date()
            });
        }
        // Fallback to empty values
        else {
            return res.json({
                totalProfit: 0,
                efficiencyScore: 0,
                onTime: 0,
                late: 0,
                fuelCosts: {},
                lastUpdated: new Date()
            });
        }
    } catch (error) {
        console.error('Error fetching simulation stats:', error);
        res.status(500).json({ 
            error: 'Failed to fetch simulation statistics',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

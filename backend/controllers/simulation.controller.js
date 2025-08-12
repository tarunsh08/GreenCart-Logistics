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

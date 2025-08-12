import express from "express";
import Driver from "../models/driver.model.js";

const router = express.Router();


router.get("/", async (req, res) => {
  try {
    const drivers = await Driver.find();
    res.json(drivers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


router.get("/:id", async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);
    if (!driver) return res.status(404).json({ message: "Driver not found" });
    res.json(driver);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


router.post("/", async (req, res) => {
  try {
    const { name, current_shift_hours, past_7_days_hours } = req.body;

    const newDriver = new Driver({
      name,
      current_shift_hours,
      past_7_days_hours
    });

    const savedDriver = await newDriver.save();
    res.status(201).json(savedDriver);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


router.put("/:id", async (req, res) => {
  try {
    const updatedDriver = await Driver.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedDriver) return res.status(404).json({ message: "Driver not found" });
    res.json(updatedDriver);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


router.delete("/:id", async (req, res) => {
  try {
    const deletedDriver = await Driver.findByIdAndDelete(req.params.id);
    if (!deletedDriver) return res.status(404).json({ message: "Driver not found" });
    res.json({ message: "Driver deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

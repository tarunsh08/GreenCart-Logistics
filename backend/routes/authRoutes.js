import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Manager from "../models/manager.model.js";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

// Signup
router.post("/signup", async (req, res) => {
  try {
    const { username,email, password } = req.body;

    const existing = await Manager.findOne({ username });
    if (existing) return res.status(400).json({ error: "Manager already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newManager = await Manager.create({
      username,
      email,
      password: hashedPassword,
    });

    res.status(201).json({ message: "Manager created", managerId: newManager._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const manager = await Manager.findOne({ username });
    if (!manager) return res.status(404).json({ error: "Manager not found" });

    const isMatch = await bcrypt.compare(password, manager.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: manager._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    res.json({ message: "Login successful", token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

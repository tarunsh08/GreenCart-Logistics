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
    const { username, email, password } = req.body;

    const existing = await Manager.findOne({ $or: [{ username }, { email }] });
    if (existing) {
      return res.status(400).json({ 
        error: existing.username === username 
          ? "Username already exists" 
          : "Email already in use" 
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newManager = await Manager.create({
      username,
      email,
      password: hashedPassword,
    });

    const token = jwt.sign({ id: newManager._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    });

    // Prepare user data to return (excluding password)
    const userData = {
      id: newManager._id,
      username: newManager.username,
      email: newManager.email,
      // Add any other user fields you need
    };

    res.status(201).json({ 
      message: "Manager created successfully", 
      token,
      user: userData 
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // First, find the user without excluding the password
    const manager = await Manager.findOne({ username });
    if (!manager) {
      return res.status(404).json({ error: "Invalid username or password" });
    }

    // Compare the provided password with the hashed password
    const isMatch = await bcrypt.compare(password, manager.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    // Generate JWT token
    const token = jwt.sign({ id: manager._id }, process.env.JWT_SECRET || 'your_jwt_secret', {
      expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    });

    // Prepare user data to return (excluding password)
    const userData = {
      id: manager._id,
      username: manager.username,
      email: manager.email,
      // Add any other user fields you need
    };

    res.json({ 
      message: "Login successful", 
      token,
      user: userData 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'An error occurred during login',
      // Only include error details in development
      ...(process.env.NODE_ENV === 'development' && { details: error.message })
    });
  }
});

// Get current user
router.get("/me", async (req, res) => {
  try {
    // Get the token from the Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find the user by ID from the token
    const user = await Manager.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ user });
  } catch (error) {
    console.error('Auth check error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;

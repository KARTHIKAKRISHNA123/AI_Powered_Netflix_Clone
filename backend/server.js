// --- 1. INITIAL SETUP & IMPORTS ---
import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cookieParser from "cookie-parser";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { connectToDB } from "./config/db.js";
import User from "./models/user.model.js";
import cors from "cors";

// --- 2. EXPRESS APP CONFIGURATION ---
const app = express();
const PORT = process.env.PORT || 5000;

// *** CRITICAL FIX FOR RENDER DEPLOYMENT ***
// This tells Express to trust the Load Balancer (HTTPS)
// Without this, the 'secure' cookie flag is ignored on Render
app.set("trust proxy", 1); 

// --- 3. MIDDLEWARE SETUP ---
app.use(
  cors({
    origin: process.env.CLIENT_URL, // Ensure this matches your Frontend URL exactly
    credentials: true, // This allows cookies to travel
  })
);
app.use(express.json());
app.use(cookieParser()); 

// --- 4. API ROUTES ---
app.get("/", (req, res) => {
  res.send("API is running...");
});

// --- AUTHENTICATION ROUTES ---

// SIGNUP ROUTE
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password || username.trim() === "" || email.trim() === "") {
      return res.status(400).json({ message: "All fields are required" });
    }
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({ message: "Username or email already exists" });
    }
    const hashedPassword = await bcryptjs.hash(password, 10);
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
    });
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "15d",
    });

    const isProduction = process.env.NODE_ENV === "production";

    res.cookie("token", token, {
      maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
      httpOnly: true,
      sameSite: isProduction ? "none" : "lax", // 'none' is REQUIRED for cross-site (Render)
      secure: isProduction, // Must be true if sameSite is 'none'
    });

    const userResponse = {
      _id: newUser._id,
      username: newUser.username,
      email: newUser.email,
    };
    res.status(201).json({ user: userResponse, message: "User signed up successfully" });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// SIGNIN ROUTE
app.post("/api/auth/signin", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const userDoc = await User.findOne({ username });
    if (!userDoc || !(await bcryptjs.compare(password, userDoc.password))) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign({ id: userDoc._id }, process.env.JWT_SECRET, {
      expiresIn: "15d",
    });
    
    const isProduction = process.env.NODE_ENV === "production";

    res.cookie("token", token, {
      maxAge: 15 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: isProduction ? "none" : "lax",
      secure: isProduction,
    });

    const userResponse = {
      _id: userDoc._id,
      username: userDoc.username,
      email: userDoc.email,
    };
    res.status(200).json({ user: userResponse, message: "Logged in successfully" });
  } catch (error) {
    console.error("Signin Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// GET USER PROFILE ROUTE
app.get("/api/auth/me", async (req, res) => {
  try {
    const token = req.cookies.token; 
    
    if (!token) {
      return res.status(401).json({ message: "Authorization denied, no token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    // console.error("/api/auth/me Error:", error.message); // Optional: keep for dev error logging
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      res.status(401).json({ message: "Token is not valid" });
    } else {
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
});

// LOGOUT ROUTE
app.post("/api/auth/logout", (req, res) => {
  try {
    const isProduction = process.env.NODE_ENV === "production";
    
    res.clearCookie("token", {
      httpOnly: true,
      sameSite: isProduction ? "none" : "lax", 
      secure: isProduction,
    });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// --- 5. SERVER STARTUP ---
const startServer = async () => {
  try {
    await connectToDB();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`NODE_ENV is set to: ${process.env.NODE_ENV}`); 
      console.log(`CLIENT_URL is set to: ${process.env.CLIENT_URL}`); 
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
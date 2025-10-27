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
const PORT = process.env.PORT || 3000;

// --- 3. MIDDLEWARE SETUP ---

// Note: Using process.env.CLIENT_URL directly in origin is correct for production
app.use(
  cors({
    origin: process.env.CLIENT_URL, // Ensure this matches your frontend URL in production
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser()); // Make sure cookie-parser is used

// --- 4. API ROUTES ---
app.get("/", (req, res) => {
  res.send("API is running...");
});

// --- AUTHENTICATION ROUTES ---

// SIGNUP ROUTE
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (
      !username ||
      !email ||
      !password ||
      username.trim() === "" ||
      email.trim() === ""
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res
        .status(400)
        .json({ message: "Username or email already exists" });
    }
    const hashedPassword = await bcryptjs.hash(password, 10);
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
    });
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    const isProduction = process.env.NODE_ENV === "production";

    console.log(`Signup: Setting cookie. isProduction: ${isProduction}`); // Debug log

    res.cookie("token", token, {
      httpOnly: true,
      secure: isProduction, // Should be true in production (HTTPS)
      sameSite: isProduction ? "none" : "lax", // Must be 'none' for cross-site production
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    const userResponse = {
      _id: newUser._id,
      username: newUser.username,
      email: newUser.email,
    };
    res
      .status(201)
      .json({ user: userResponse, message: "User signed up successfully" });
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
      expiresIn: "7d",
    });
    const isProduction = process.env.NODE_ENV === "production";

    console.log(`Signin: Setting cookie. isProduction: ${isProduction}`); // Debug log

    res.cookie("token", token, {
      httpOnly: true,
      secure: isProduction, // Should be true in production (HTTPS)
      sameSite: isProduction ? "none" : "lax", // Must be 'none' for cross-site production
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    const userResponse = {
      _id: userDoc._id,
      username: userDoc.username,
      email: userDoc.email,
    };
    res
      .status(200)
      .json({ user: userResponse, message: "Logged in successfully" });
  } catch (error) {
    console.error("Signin Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// GET USER PROFILE ROUTE ***(WITH ADDED LOGGING)***
app.get("/api/auth/me", async (req, res) => {
  // --- START TEMPORARY LOGGING ---
  console.log("--- /api/auth/me Request Received ---");
  console.log("Request Origin:", req.headers.origin); // Log the origin
  console.log("Raw Cookies Header:", req.headers.cookie); // Log raw cookie header
  console.log("Parsed req.cookies:", req.cookies); // Log cookies parsed by cookie-parser
  // --- END TEMPORARY LOGGING ---
  try {
    const { token } = req.cookies; // Get token from parsed cookies
    console.log("Extracted token:", token); // Log the extracted token specifically

    if (!token) {
      console.log("No token found in parsed cookies."); // Log if token extraction failed
      return res
        .status(401)
        .json({ message: "Authorization denied, no token" });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Token decoded successfully:", decoded); // Log successful decoding

    // Find the user
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      console.log("User not found for ID:", decoded.id); // Log if user lookup failed
      return res.status(404).json({ message: "User not found" });
    }

    console.log("User found:", user.username); // Log successful user retrieval
    res.status(200).json({ user });

  } catch (error) {
    // Log the specific error during verification or user lookup
    console.error("/api/auth/me Error:", error.message);
    // Determine if it's a JWT error or another issue
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      res.status(401).json({ message: "Token is not valid" });
    } else {
      res.status(500).json({ message: "Internal Server Error during auth check" });
    }
  }
});


// LOGOUT ROUTE
app.post("/api/auth/logout", (req, res) => {
  try {
    const isProduction = process.env.NODE_ENV === "production";
    console.log(`Logout: Clearing cookie. isProduction: ${isProduction}`); // Debug log

    res.clearCookie("token", {
      httpOnly: true,
      secure: isProduction, // Match the setting logic used when creating
      sameSite: isProduction ? "none" : "lax", // Match the setting logic used when creating
      // Optionally add path: '/' if your cookies have a specific path
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
      console.log(`NODE_ENV is set to: ${process.env.NODE_ENV}`); // Log NODE_ENV on startup
      console.log(`CLIENT_URL is set to: ${process.env.CLIENT_URL}`); // Log CLIENT_URL on startup
    });

  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
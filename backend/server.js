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


app.use(
  cors({
    origin: process.env.CLIENT_URL, 
    credentials: true,
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

    console.log(`Signup: Setting cookie. isProduction: ${isProduction}`); 

    res.cookie("token", token, {
      httpOnly: true,
      secure: isProduction, 
      sameSite: isProduction ? "none" : "lax", 
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      domain: isProduction ? ".onrender.com" : undefined,
      path: "/",
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

    console.log(`Signin: Setting cookie. isProduction: ${isProduction}`); 

    res.cookie("token", token, {
      httpOnly: true,
      secure: isProduction, 
      sameSite: isProduction ? "none" : "lax", 
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      domain: isProduction ? ".onrender.com" : undefined,
      path: "/",
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
  console.log("Request Origin:", req.headers.origin); 
  console.log("Raw Cookies Header:", req.headers.cookie); 
  console.log("Parsed req.cookies:", req.cookies); 
  
  try {
    const { token } = req.cookies; 
    console.log("Extracted token:", token); 

    if (!token) {
      console.log("No token found in parsed cookies."); 
      return res
        .status(401)
        .json({ message: "Authorization denied, no token" });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Token decoded successfully:", decoded); 

    // Find the user
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      console.log("User not found for ID:", decoded.id); 
      return res.status(404).json({ message: "User not found" });
    }

    console.log("User found:", user.username); 
    res.status(200).json({ user });
  } catch (error) {
    
    console.error("/api/auth/me Error:", error.message);
    
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      res.status(401).json({ message: "Token is not valid" });
    } else {
      res
        .status(500)
        .json({ message: "Internal Server Error during auth check" });
    }
  }
});

// LOGOUT ROUTE
app.post("/api/auth/logout", (req, res) => {
  try {
    const isProduction = process.env.NODE_ENV === "production";
    console.log(`Logout: Clearing cookie. isProduction: ${isProduction}`); 

    res.clearCookie("token", {
      httpOnly: true,
      secure: isProduction, 
      sameSite: isProduction ? "none" : "lax", 
      domain: isProduction ? ".onrender.com" : undefined,
      path: "/",
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

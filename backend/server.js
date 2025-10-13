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

// CORRECTED AND SIMPLIFIED CORS CONFIGURATION
app.use(
  cors({
    origin: [process.env.CLIENT_URL, "https://ai-powered-netflix-clone-1.onrender.com"],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// --- 4. API ROUTES ---
// ... (The rest of your server.js file remains the same) ...
// ... (No other changes are needed below this line) ...

app.get("/", (req, res) => {
  res.send("API is running...");
});

// --- AUTHENTICATION ROUTES ---

/**
 * ROUTE: POST /api/auth/signup
 */
app.post("/api/auth/signup", async (req, res) => {
  console.log("\n[SIGNUP] Route hit.");
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password || username.trim() === "" || email.trim() === "") {
      return res.status(400).json({ message: "All fields are required" });
    }

    const trimmedEmail = email.trim();
    const trimmedUsername = username.trim();

    const emailExists = await User.findOne({ email: trimmedEmail });
    if (emailExists) {
      return res.status(400).json({ message: "User with this email already exists" });
    }
    const usernameExists = await User.findOne({ username: trimmedUsername });
    if (usernameExists) {
      return res.status(400).json({ message: "Username is already taken" });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);
    const newUser = await User.create({
      username: trimmedUsername,
      email: trimmedEmail,
      password: hashedPassword,
    });

    if (newUser) {
      const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });

      res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      const userResponse = { _id: newUser._id, username: newUser.username, email: newUser.email };
      return res.status(201).json({ user: userResponse, message: "User signed up successfully" });
    } else {
      throw new Error("User creation failed unexpectedly after validation.");
    }
  } catch (error) {
    console.error("[SIGNUP] CATCH BLOCK ERROR:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

/**
 * ROUTE: POST /api/auth/signin
 */
app.post("/api/auth/signin", async (req, res) => {
  console.log("\n[SIGNIN] Route hit.");
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    const userDoc = await User.findOne({ username: username.trim() });
    if (!userDoc) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await bcryptjs.compare(password, userDoc.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: userDoc._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const userResponse = { _id: userDoc._id, username: userDoc.username, email: userDoc.email };
    return res.status(200).json({ user: userResponse, message: "Logged in successfully" });
  } catch (error) {
    console.error("[SIGNIN] CATCH BLOCK ERROR:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

/**
 * ROUTE: GET /api/auth/me
 */
app.get("/api/auth/me", async (req, res) => {
  console.log("\n[ME] Route hit.");
  try {
    const { token } = req.cookies;
    if (!token) {
      return res.status(401).json({ message: "Authorization denied, no token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ user });
  } catch (error) {
    return res.status(401).json({ message: "Token is not valid" });
  }
});

/**
 * ROUTE: POST /api/auth/logout
 */
app.post("/api/auth/logout", (req, res) => {
  console.log("\n[LOGOUT] Route hit.");
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("[LOGOUT] CATCH BLOCK ERROR:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// --- 5. SERVER STARTUP ---
app.listen(PORT, () => {
  connectToDB();
  console.log(`Server is running on http://localhost:${PORT}`);
});
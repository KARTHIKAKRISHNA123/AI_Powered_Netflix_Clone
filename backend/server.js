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
app.use(express.json());
app.use(cookieParser());
app.use(cors({origin: process.env.CLIENT_URL, credentials: true}))

// --- 4. API ROUTES ---
app.get("/", (req, res) => {
  res.send("API is running...");
});

// --- AUTHENTICATION ROUTES ---

/**
 * ROUTE: POST /api/auth/signup
 * PURPOSE: To register a new user in the database.
 */
app.post("/api/auth/signup", async (req, res) => {
  console.log("\n[SIGNUP] Route hit.");
  try {
    console.log("[SIGNUP] Step 1: Destructuring request body.");
    const { username, email, password } = req.body;
    console.log("[SIGNUP] Received data:", {
      username,
      email,
      password: "REDACTED",
    });

    console.log("[SIGNUP] Step 2: Validating fields.");
    if (
      !username ||
      !email ||
      !password ||
      username.trim() === "" ||
      email.trim() === ""
    ) {
      console.log("[SIGNUP] Validation FAILED: Fields are missing or empty.");
      return res.status(400).json({ message: "All fields are required" });
    }
    console.log("[SIGNUP] Validation PASSED.");

    const trimmedEmail = email.trim();
    const trimmedUsername = username.trim();

    console.log("[SIGNUP] Step 3: Checking if user already exists.");
    const emailExists = await User.findOne({ email: trimmedEmail });
    if (emailExists) {
      console.log("[SIGNUP] Check FAILED: Email already exists.");
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }
    const usernameExists = await User.findOne({ username: trimmedUsername });
    if (usernameExists) {
      console.log("[SIGNUP] Check FAILED: Username already exists.");
      return res.status(400).json({ message: "Username is already taken" });
    }
    console.log("[SIGNUP] User does not exist. Proceeding.");

    console.log("[SIGNUP] Step 4: Hashing password.");
    const hashedPassword = await bcryptjs.hash(password, 10);
    console.log("[SIGNUP] Password hashed successfully.");

    console.log("[SIGNUP] Step 5: Creating new user in database.");
    const newUser = await User.create({
      username: trimmedUsername,
      email: trimmedEmail,
      password: hashedPassword,
    });
    console.log("[SIGNUP] User created with ID:", newUser._id);

    if (newUser) {
      console.log("[SIGNUP] Step 6: Generating JWT.");
      const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });
      console.log("[SIGNUP] JWT generated.");

      console.log("[SIGNUP] Step 7: Setting HTTP-only cookie.");
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      console.log("[SIGNUP] Cookie set.");

      const userResponse = {
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
      };

      console.log("[SIGNUP] Step 8: Sending 201 Created response.");
      return res
        .status(201)
        .json({ user: userResponse, message: "User signed up successfully" });
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
 * PURPOSE: To authenticate an existing user and create a session.
 */
app.post("/api/auth/signin", async (req, res) => {
  console.log("\n[SIGNIN] Route hit.");
  try {
    console.log("[SIGNIN] Step 1: Destructuring request body.");
    const { username, password } = req.body;
    console.log("[SIGNIN] Received data:", { username, password: "REDACTED" });

    if (!username || !password) {
      console.log("[SIGNIN] Validation FAILED: Fields are missing.");
      return res
        .status(400)
        .json({ message: "Username and password are required" });
    }
    console.log("[SIGNIN] Validation PASSED.");

    console.log(
      `[SIGNIN] Step 2: Finding user '${username.trim()}' in database.`
    );
    const userDoc = await User.findOne({ username: username.trim() });
    if (!userDoc) {
      console.log("[SIGNIN] Auth FAILED: User not found.");
      return res.status(400).json({ message: "Invalid credentials" });
    }
    console.log("[SIGNIN] User found with ID:", userDoc._id);

    console.log("[SIGNIN] Step 3: Comparing passwords.");
    const isPasswordValid = await bcryptjs.compare(password, userDoc.password);
    if (!isPasswordValid) {
      console.log("[SIGNIN] Auth FAILED: Passwords do not match.");
      return res.status(400).json({ message: "Invalid credentials" });
    }
    console.log("[SIGNIN] Password is valid.");

    console.log("[SIGNIN] Step 4: Generating JWT.");
    const token = jwt.sign({ id: userDoc._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    console.log("[SIGNIN] JWT generated.");

    console.log("[SIGNIN] Step 5: Setting HTTP-only cookie.");
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    console.log("[SIGNIN] Cookie set.");

    const userResponse = {
      _id: userDoc._id,
      username: userDoc.username,
      email: userDoc.email,
    };

    console.log("[SIGNIN] Step 6: Sending 200 OK response.");
    return res
      .status(200)
      .json({ user: userResponse, message: "Logged in successfully" });
  } catch (error) {
    console.error("[SIGNIN] CATCH BLOCK ERROR:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

/**
 * ROUTE: GET /api/auth/me
 * PURPOSE: To retrieve the profile of the currently logged-in user using their token.
 */
app.get("/api/auth/me", async (req, res) => {
  console.log("\n[ME] Route hit.");
  try {
    console.log("[ME] Step 1: Reading token from cookies.");
    const { token } = req.cookies;
    if (!token) {
      console.log("[ME] Auth FAILED: No token found in cookies.");
      return res
        .status(401)
        .json({ message: "Authorization denied, no token" });
    }
    console.log("[ME] Token found.");

    console.log("[ME] Step 2: Verifying token.");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("[ME] Token verified. Decoded payload:", decoded);

    console.log(`[ME] Step 3: Finding user by ID '${decoded.id}' in database.`);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      console.log(
        "[ME] Auth FAILED: User ID from token not found in database."
      );
      return res.status(404).json({ message: "User not found" });
    }
    console.log("[ME] User found:", user);

    console.log("[ME] Step 4: Sending 200 OK response with user data.");
    return res.status(200).json({ user });
  } catch (error) {
    console.error(
      "[ME] CATCH BLOCK ERROR (likely invalid/expired token):",
      error.message
    );
    return res.status(401).json({ message: "Token is not valid" });
  }
});

/**
 * ROUTE: POST /api/auth/logout
 * PURPOSE: To clear the user's session cookie, effectively logging them out.
 */
app.post("/api/auth/logout", (req, res) => {
  console.log("\n[LOGOUT] Route hit.");
  try {
    console.log("[LOGOUT] Step 1: Clearing 'token' cookie.");
    // The res.clearCookie() method is the simplest way to remove a cookie.
    res.clearCookie("token");
    console.log("[LOGOUT] Step 2: Sending 200 OK response.");
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

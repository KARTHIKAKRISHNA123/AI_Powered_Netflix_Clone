import { create } from "zustand";
import axios from "axios";

axios.defaults.withCredentials = true;

// *** DYNAMIC URL CONFIGURATION ***
// 1. If running 'npm run dev', it uses localhost:5000
// 2. If deployed on Render, it uses the Production URL
// const API_URL = import.meta.env.MODE === "development"
//     ? "http://localhost:5000"
//     : "https://ai-powered-netflix-clone.onrender.com"; // <--- PASTE YOUR COPIED RENDER BACKEND URL HERE


// REPLACE "https://your-backend.onrender.com" with your ACTUAL Backend URL
const API_URL = import.meta.env.MODE === "development" 
  ? "http://localhost:5000/api/auth" 
  : "https://ai-powered-netflix-clone.onrender.com/api/auth";

  
export const useAuthStore = create((set) => ({
  // Initial States
  user: null,
  isLoading: false,
  error: null,
  message: null,
  fetchingUser: true,

  //functions
  signup: async (username, email, password) => {
    set({ isLoading: true, message: null, error: null });

    try {
      const response = await axios.post(`${API_URL}/api/auth/signup`, {
        username,
        email,
        password,
      });

      set({ user: response.data.user, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || "Error signing up. Please try again.",
      });
      throw error;
    }
  },

  signin: async (username, password) => {
    set({ isLoading: true, message: null, error: null });

    try {
      const response = await axios.post(`${API_URL}/api/auth/signin`, {
        username,
        password,
      });

      const { user, message } = response.data;
      set({ user, message, isLoading: false });
      return { user, message };
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || "Error signing in. Please check your credentials.",
      });
      throw error;
    }
  },

  fetchUser: async () => {
    set({ fetchingUser: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/api/auth/me`);
      set({ user: response.data.user, fetchingUser: false });
    } catch (error) {
      // If error (e.g., 401 unauthorized), we stop loading and set user to null
      set({ fetchingUser: false, error: null, user: null });
    }
  },

  logout: async () => {
    set({ isLoading: true, error: null, message: null });

    try {
      const response = await axios.post(`${API_URL}/api/auth/logout`);
      const { message } = response.data;
      set({ message, isLoading: false, user: null, error: null });
      return { message };
    } catch (error) {
      set({
        isLoading: false,
        error: error.response?.data?.message || "Error logging out.",
      });
      throw error;
    }
  },
}));
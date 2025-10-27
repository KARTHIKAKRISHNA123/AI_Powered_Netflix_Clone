import { create } from "zustand";
import axios from "axios";

axios.defaults.withCredentials = true;
const API_URL = "https://ai-powered-netflix-clone.onrender.com";

// const API_URL =   "http://localhost:3000";

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
      // CORRECTED ERROR HANDLING
      set({
        isLoading: false,
        error:
          error.response?.data?.message ||
          "Error signing up. Please try again.",
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
      // CORRECTED ERROR HANDLING
      set({
        isLoading: false,
        error:
          error.response?.data?.message ||
          "Error signing in. Please check your credentials.",
      });
      throw error;
    }
  },

  fetchUser: async () => {
    console.log("authStore.js: fetchUser function started.");
    set({ fetchingUser: true, error: null });
    try {
      console.log(`authStore.js: Making GET request to ${API_URL}/api/auth/me`);
      const response = await axios.get(`${API_URL}/api/auth/me`);
      console.log(
        "authStore.js: Received response from /api/auth/me:",
        response.data
      );
      set({ user: response.data.user, fetchingUser: false });
    } catch (error) {
      console.error(
        "authStore.js: Error in fetchUser:",
        error.response || error.message
      );
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
      // CORRECTED ERROR HANDLING
      set({
        isLoading: false,
        error: error.response?.data?.message || "Error logging out.",
      });
      throw error;
    }
  },
}));

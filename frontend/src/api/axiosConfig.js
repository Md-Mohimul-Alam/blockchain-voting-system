// src/api/axiosConfig.js
import axios from 'axios';

// Create an Axios instance with a base URL
const API = axios.create({
  baseURL: "http://localhost:5001/api", // Base URL for your API
});

// Function to get the token from localStorage
const getAuthToken = () => localStorage.getItem("jwtToken");

// Add a request interceptor to automatically attach the JWT token to each request
API.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // Attach token to the request headers
    } else {
      console.log("No token found!");
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default API;

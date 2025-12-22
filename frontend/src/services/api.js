import axios from "axios";

/**
 * Base URL
 * - Local: http://localhost:5000
 * - Production: https://yala-travel-crew-backend.vercel.app
 */
const API_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

// JSON requests
const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

// File uploads (FormData)
const apiUpload = axios.create({
  baseURL: `${API_URL}/api`,
});

// ====================
// Tours API
// ====================
export const getTours = () => api.get("/tours");
export const getTourById = (id) => api.get(`/tours/${id}`);
export const createTour = (data) => apiUpload.post("/tours", data);
export const updateTour = (id, data) => apiUpload.put(`/tours/${id}`, data);
export const deleteTour = (id) => api.delete(`/tours/${id}`);

// ====================
// Rentals API
// ====================
export const getRentals = () => api.get("/rentals");
export const createRental = (data) => apiUpload.post("/rentals", data);
export const updateRental = (id, data) => apiUpload.put(`/rentals/${id}`, data);
export const deleteRental = (id) => api.delete(`/rentals/${id}`);

// ====================
// Packages API
// ====================
export const getPackages = () => api.get("/packages");
export const getPackage = (id) => api.get(`/packages/${id}`);
export const createPackage = (data) => apiUpload.post("/packages", data);
export const updatePackage = (id, data) =>
  apiUpload.put(`/packages/${id}`, data);
export const deletePackage = (id) => api.delete(`/packages/${id}`);

// ====================
// Gallery API
// ====================
export const getGallerys = () => api.get("/gallery");
export const getGalleryById = (id) => api.get(`/gallery/${id}`);
export const createGallery = (data) => apiUpload.post("/gallery", data);
export const updateGallery = (id, data) =>
  apiUpload.put(`/gallery/${id}`, data);
export const deleteGallery = (id) => api.delete(`/gallery/${id}`);

// ====================
// Admin & Contact (add if missing)
// ====================
export const adminLogin = (data) =>
  api.post("/admin/login", data);

export const sendContactEmail = (data) =>
  api.post("/contact/send-email", data);

export default api;

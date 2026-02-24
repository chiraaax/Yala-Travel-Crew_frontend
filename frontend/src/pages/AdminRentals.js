import React, { useEffect, useState, useCallback } from "react";
import { getImageUrl } from "../utils/getImageUrl";
import {
  getRentals,
  createRental,
  updateRental,
  deleteRental,
} from "../services/api";

export default function AdminRentals() {
  const [rentals, setRentals] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [currentImage, setCurrentImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState("all");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");

  const [form, setForm] = useState({
    vehicleName: "",
    vehicleType: "",
    seats: "",
    fuel: "",
    description: "",
    image: null,
    features: "",
    available: true,
  });

  // Get unique vehicle types for filter
  const uniqueVehicleTypes = ["all", ...new Set(rentals.map(rental => rental.vehicleType).filter(Boolean))];

  // Filter rentals
  const filteredRentals = rentals.filter(rental => {
    const matchesSearch = rental.vehicleName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rental.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rental.fuel?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (Array.isArray(rental.features) && 
                          rental.features.some(feature => 
                            feature.toLowerCase().includes(searchTerm.toLowerCase())));
    
    const matchesVehicleType = vehicleTypeFilter === "all" || rental.vehicleType === vehicleTypeFilter;
    const matchesAvailability = availabilityFilter === "all" || 
                               (availabilityFilter === "available" && rental.available) ||
                               (availabilityFilter === "unavailable" && !rental.available);
    
    return matchesSearch && matchesVehicleType && matchesAvailability;
  });

  const loadRentals = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getRentals();
      setRentals(res.data || []);
    } catch (error) {
      console.error("Error loading rentals:", error);
      alert("Error loading rentals: " + (error.response?.data?.message || error.message));
      setTimeout(loadRentals, 2000);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load rentals
  useEffect(() => {
    loadRentals();
  }, [loadRentals]);

  // Reset form
  const resetForm = () => {
    setForm({
      vehicleName: "",
      vehicleType: "",
      seats: "",
      fuel: "",
      description: "",
      image: null,
      features: "",
      available: true,
    });
    setCurrentImage("");
    setEditingId(null);
  };

  // Handle form input
  const handleChange = (e) => {
    let value = e.target.name === "available" ? e.target.checked : e.target.value;

    if (e.target.name === "image") {
      value = e.target.files[0];
      if (value) {
        const reader = new FileReader();
        reader.onload = (ev) => setCurrentImage(ev.target.result);
        reader.readAsDataURL(value);
      } else {
        setCurrentImage("");
      }
    }

    setForm({ ...form, [e.target.name]: value });
  };

  // Form validation
  const validateForm = () => {
    if (!form.vehicleName.trim()) {
      alert("Vehicle name is required!");
      return false;
    }
    if (!form.vehicleType.trim()) {
      alert("Vehicle type is required!");
      return false;
    }
    if (!form.fuel.trim()) {
      alert("Fuel type is required!");
      return false;
    }
    if (!form.description.trim()) {
      alert("Description is required!");
      return false;
    }

    const seatsNum = Number(form.seats);
    if (isNaN(seatsNum) || seatsNum < 1) {
      alert("Seats must be a valid number greater than 0!");
      return false;
    }

    if (!form.image && !editingId && !currentImage) {
      alert("Please select an image!");
      return false;
    }

    return true;
  };

  // Save or update rental
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (editingId && !window.confirm("Update this rental?")) return;

    setLoading(true);

    // Process features from comma-separated string
    const featuresArray = form.features.split(',').map(item => item.trim()).filter(item => item);

    const formData = new FormData();
    formData.append("vehicleName", form.vehicleName.trim());
    formData.append("vehicleType", form.vehicleType.trim());
    formData.append("seats", Number(form.seats).toString());
    formData.append("fuel", form.fuel.trim());
    formData.append("description", form.description.trim());
    formData.append("features", JSON.stringify(featuresArray));
    formData.append("available", form.available.toString());

    if (form.image && form.image.size > 0) {
      formData.append("image", form.image);
    }

    try {
      if (editingId) {
        await updateRental(editingId, formData);
        alert("Rental updated successfully!");
      } else {
        await createRental(formData);
        alert("Rental created successfully!");
      }

      resetForm();
      loadRentals();
    } catch (error) {
      console.error("Submit error:", error);
      alert("Error: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Edit rental
  const handleEdit = (rental) => {
    setEditingId(rental._id);
    setCurrentImage(getImageUrl(rental.image));

    setForm({
      vehicleName: rental.vehicleName || "",
      vehicleType: rental.vehicleType || "",
      seats: rental.seats || "",
      fuel: rental.fuel || "",
      description: rental.description || "",
      image: null,
      features: Array.isArray(rental.features) ? rental.features.join(", ") : (rental.features || ""),
      available: !!rental.available,
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Delete rental
  const handleDelete = async (id, vehicleName) => {
    if (!window.confirm(`Are you sure you want to delete "${vehicleName}"? This action cannot be undone.`)) return;

    try {
      setLoading(true);
      await deleteRental(id);
      loadRentals();
      alert("Rental deleted successfully!");
    } catch (error) {
      console.error("Delete error:", error);
      alert("Error deleting: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100">Manage Rentals</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Manage your vehicle rental fleet</p>
        </div>
        
        {rentals.length > 0 && (
          <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Search vehicles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-48 p-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <select
              value={vehicleTypeFilter}
              onChange={(e) => setVehicleTypeFilter(e.target.value)}
              className="p-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {uniqueVehicleTypes.map(type => (
                <option key={type} value={type}>
                  {type === "all" ? "All Types" : type}
                </option>
              ))}
            </select>
            <select
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value)}
              className="p-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="unavailable">Unavailable</option>
            </select>
          </div>
        )}
      </div>

      {/* ================= FORM ================= */}
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg mb-12 border border-gray-100 dark:border-gray-700">
        <h2 className="text-2xl font-semibold mb-6 text-gray-700 dark:text-gray-200">
          {editingId ? "Edit Rental" : "Add New Rental"}
        </h2>

        {currentImage && (
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
            <img 
              src={currentImage} 
              alt="Preview" 
              className="w-48 h-48 object-cover rounded-lg mx-auto" 
              onError={(e) => {
                e.currentTarget.src = 'https://via.placeholder.com/400x256?text=Image+Error';
              }}
            />
            <p className="text-sm text-gray-500 dark:text-gray-300 text-center mt-2">
              {editingId ? "Current image (upload new to replace)" : "Vehicle image preview"}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Vehicle Name *
            </label>
            <input
              type="text"
              name="vehicleName"
              placeholder="e.g., Toyota Prado"
              value={form.vehicleName}
              onChange={handleChange}
              className="w-full p-4 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Vehicle Type *
            </label>
            <select
              name="vehicleType"
              value={form.vehicleType}
              onChange={handleChange}
              className="w-full p-4 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              disabled={loading}
            >
              <option value="">Select type...</option>
              <option value="SUV">SUV</option>
              <option value="Sedan">Sedan</option>
              <option value="Van">Van</option>
              <option value="Jeep">Jeep</option>
              <option value="Minivan">Minivan</option>
              <option value="Luxury">Luxury</option>
              <option value="Economy">Economy</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Seats *
            </label>
            <input
              type="number"
              name="seats"
              placeholder="e.g., 5"
              value={form.seats}
              onChange={handleChange}
              min="1"
              className="w-full p-4 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Fuel Type *
            </label>
            <select
              name="fuel"
              value={form.fuel}
              onChange={handleChange}
              className="w-full p-4 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              disabled={loading}
            >
              <option value="">Select fuel...</option>
              <option value="Petrol">Petrol</option>
              <option value="Diesel">Diesel</option>
              <option value="Electric">Electric</option>
              <option value="Hybrid">Hybrid</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Upload Vehicle Image {!editingId && "*"}
            </label>
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleChange}
              className="w-full p-4 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 dark:file:bg-blue-900 file:text-blue-700 dark:file:text-blue-200 hover:file:bg-blue-100"
              required={!editingId && !currentImage}
              disabled={loading}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Supported formats: JPG, PNG, WebP. Max size: 5MB
            </p>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Features (comma separated)
            </label>
            <input
              type="text"
              name="features"
              placeholder="e.g., AC, GPS, WiFi, Sunroof"
              value={form.features}
              onChange={handleChange}
              className="w-full p-4 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              placeholder="Brief description of the vehicle..."
              value={form.description}
              onChange={handleChange}
              className="w-full p-4 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
              required
              disabled={loading}
            />
          </div>

          <div className="md:col-span-2 flex items-center gap-4">
            <label className="flex items-center gap-3 text-sm font-medium text-gray-700 dark:text-gray-200">
              <input
                type="checkbox"
                name="available"
                checked={form.available}
                onChange={handleChange}
                className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-400"
                disabled={loading}
              />
              Available for Rental
            </label>
          </div>

          <div className="md:col-span-2 flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-xl hover:from-blue-700 hover:to-blue-800 font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {editingId ? "Updating..." : "Creating..."}
                </>
              ) : (
                editingId ? "Update Rental" : "Add Rental"
              )}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                disabled={loading}
                className="px-8 py-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </div>

      {/* ================= RENTALS LIST ================= */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-transparent dark:border-gray-700">
        <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-700">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                All Rentals ({filteredRentals.length})
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-300 mt-1">
                {searchTerm || vehicleTypeFilter !== "all" || availabilityFilter !== "all"
                  ? `Showing filtered results` 
                  : "Manage your vehicle fleet"}
                {searchTerm && ` for "${searchTerm}"`}
                {vehicleTypeFilter !== "all" && ` • Type: ${vehicleTypeFilter}`}
                {availabilityFilter !== "all" && ` • Status: ${availabilityFilter}`}
              </p>
            </div>
            
            {(searchTerm || vehicleTypeFilter !== "all" || availabilityFilter !== "all") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setVehicleTypeFilter("all");
                  setAvailabilityFilter("all");
                }}
                className="mt-2 md:mt-0 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        {loading && rentals.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-500 dark:text-gray-300 mt-4">Loading rentals...</p>
          </div>
        ) : filteredRentals.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-gray-500 dark:text-gray-300 text-lg">
              {searchTerm || vehicleTypeFilter !== "all" || availabilityFilter !== "all"
                ? "No rentals found matching your filters" 
                : "No rentals added yet."}
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-400 mt-1">
              {searchTerm || vehicleTypeFilter !== "all" || availabilityFilter !== "all"
                ? "Try adjusting your search or filters" 
                : "Start by adding your first vehicle above!"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-8">
            {filteredRentals.map((rental) => (
              <div 
                key={rental._id} 
                className="group relative bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-800 rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 hover:border-blue-200"
              >
                {/* Image with overlay */}
                <div className="relative overflow-hidden">
                  <img
                    src={getImageUrl(rental.image)}
                    alt={rental.vehicleName}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => { 
                      e.currentTarget.src = "https://via.placeholder.com/400x256?text=No+Image";
                    }}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300"></div>
                  
                  {editingId === rental._id && (
                    <div className="absolute top-3 left-3 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      Editing
                    </div>
                  )}
                  
                  <div className="absolute top-3 right-3 flex flex-col gap-1">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${rental.available ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'}`}>
                      {rental.available ? 'Available' : 'Booked'}
                    </span>
                    {rental.vehicleType && (
                      <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs font-semibold">
                        {rental.vehicleType}
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2 group-hover:text-blue-600 transition-colors">
                    {rental.vehicleName}
                  </h3>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                      <svg className="w-4 h-4 mr-2 text-gray-400 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span className="mr-3">{rental.seats} seats</span>
                      <svg className="w-4 h-4 mr-2 text-gray-400 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span>{rental.fuel}</span>
                    </div>
                    
                    {Array.isArray(rental.features) && rental.features.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {rental.features.slice(0, 3).map((feature, idx) => (
                          <span key={idx} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                            {feature}
                          </span>
                        ))}
                        {rental.features.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full">
                            +{rental.features.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 line-clamp-2">
                    {rental.description}
                  </p>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleEdit(rental)}
                      disabled={loading}
                      className="flex-1 bg-yellow-500 text-white py-3 px-4 rounded-xl hover:bg-yellow-600 font-semibold transition-colors shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                      aria-label={`Edit ${rental.vehicleName}`}
                    >
                      {loading && editingId === rental._id ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Editing...
                        </span>
                      ) : (
                        "Edit"
                      )}
                    </button>

                    <button
                      onClick={() => handleDelete(rental._id, rental.vehicleName)}
                      disabled={loading}
                      className="flex-1 bg-red-500 text-white py-3 px-4 rounded-xl hover:bg-red-600 font-semibold transition-colors shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                      aria-label={`Delete ${rental.vehicleName}`}
                    >
                      {loading ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
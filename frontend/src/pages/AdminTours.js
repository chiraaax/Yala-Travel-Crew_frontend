import React, { useEffect, useState } from "react";
import { getImageUrl } from "../utils/getImageUrl";
import {
  getTours,
  createTour,
  updateTour,
  deleteTour,
} from "../services/api";

export default function AdminTours() {
  const [tours, setTours] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [currentImage, setCurrentImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageErrors, setImageErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    duration: "",
    price: "",
    maxParticipants: "",
    includes: "",
    image: null,
  });

  // Helper function to get image URL with fallback
  const getTourImage = (imagePath) => {
    if (!imagePath) return 'https://via.placeholder.com/400x256?text=No+Image';
    return getImageUrl(imagePath);
  };

  // Format price as LKR currency
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0
    }).format(price);
  };

  // Filter tours based on search
  const filteredTours = tours.filter(tour => 
    tour.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tour.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tour.duration?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Load tours
  useEffect(() => {
    loadTours();
  }, []);

  const loadTours = async () => {
    try {
      setLoading(true);
      const res = await getTours();
      setTours(res.data || []);
    } catch (error) {
      console.error("Error loading tours:", error);
      alert("Error loading tours: " + (error.response?.data?.message || error.message));
      setTimeout(loadTours, 2000);
    } finally {
      setLoading(false);
    }
  };

  // Reset form to initial state
  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      duration: "",
      price: "",
      maxParticipants: "",
      includes: "",
      image: null,
    });
    setCurrentImage("");
    setEditingId(null);
    setImageErrors({});
  };

  // Handle form input
  const handleChange = (e) => {
    let value = e.target.value;

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
    if (!form.title.trim()) {
      alert("Please enter a title");
      return false;
    }
    if (!form.description.trim()) {
      alert("Please enter a description");
      return false;
    }
    if (!form.duration.trim()) {
      alert("Please enter a duration");
      return false;
    }

    const priceNum = Number(form.price);
    const maxParticipantsNum = Number(form.maxParticipants);
    
    if (isNaN(priceNum) || priceNum < 0) {
      alert("Price must be a valid positive number!");
      return false;
    }
    if (isNaN(maxParticipantsNum) || maxParticipantsNum < 1) {
      alert("Max Participants must be a valid number greater than 0!");
      return false;
    }

    if (!form.image && !editingId && !currentImage) {
      alert("Please select an image!");
      return false;
    }

    return true;
  };

  // Save or update tour
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (editingId && !window.confirm("Update this tour?")) return;

    setLoading(true);

    // Create FormData
    const formData = new FormData();
    formData.append("title", form.title.trim());
    formData.append("description", form.description.trim());
    formData.append("duration", form.duration.trim());
    formData.append("price", Number(form.price).toString());
    formData.append("maxParticipants", Number(form.maxParticipants).toString());
    formData.append("includes", form.includes?.trim() || "");

    if (form.image && form.image.size > 0) {
      formData.append("image", form.image);
    }

    try {
      if (editingId) {
        await updateTour(editingId, formData);
        alert("Tour updated successfully!");
      } else {
        await createTour(formData);
        alert("Tour created successfully!");
      }

      resetForm();
      loadTours();
    } catch (error) {
      console.error("Submit error:", error);
      alert("Error: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Edit tour
  const handleEdit = (tour) => {
    setEditingId(tour._id);
    setCurrentImage(getTourImage(tour.image));

    setForm({
      title: tour.title || "",
      description: tour.description || "",
      duration: tour.duration || "",
      price: tour.price || "",
      maxParticipants: tour.maxParticipants || "",
      includes: Array.isArray(tour.includes) ? tour.includes.join(", ") : (tour.includes || ""),
      image: null,
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Delete tour
  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) return;

    try {
      setLoading(true);
      await deleteTour(id);
      loadTours();
      alert("Tour deleted successfully!");
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
          <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100">Manage Tours</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Create, edit, and delete tour packages</p>
        </div>
        
        {tours.length > 0 && (
          <div className="mt-4 md:mt-0">
            <input
              type="text"
              placeholder="Search tours..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-64 p-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        )}
      </div>

      {/* ================= FORM ================= */}
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg mb-12 border border-gray-100 dark:border-gray-700">
        <h2 className="text-2xl font-semibold mb-6 text-gray-700 dark:text-gray-200">
          {editingId ? "Edit Tour" : "Add New Tour"}
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
              {editingId ? "Current image (upload new to replace)" : "Image preview"}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Title *
            </label>
            <input
              type="text"
              name="title"
              placeholder="e.g., Yala Safari Adventure"
              value={form.title}
              onChange={handleChange}
              className="w-full p-4 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Duration *
            </label>
            <input
              type="text"
              name="duration"
              placeholder="e.g., 3 Days / 2 Nights"
              value={form.duration}
              onChange={handleChange}
              className="w-full p-4 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Price (LKR) *
            </label>
            <input
              type="number"
              name="price"
              placeholder="e.g., 25000"
              value={form.price}
              onChange={handleChange}
              min="0"
              step="100"
              className="w-full p-4 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Max Participants *
            </label>
            <input
              type="number"
              name="maxParticipants"
              placeholder="e.g., 10"
              value={form.maxParticipants}
              onChange={handleChange}
              min="1"
              className="w-full p-4 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              disabled={loading}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Upload Image (Vehicle Pic) {!editingId && "*"}
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
              Description *
            </label>
            <textarea
              name="description"
              placeholder="Brief description of the tour..."
              value={form.description}
              onChange={handleChange}
              className="w-full p-4 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
              required
              disabled={loading}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Includes (comma separated, optional)
            </label>
            <input
              type="text"
              name="includes"
              placeholder="e.g., Accommodation, Meals, Guide"
              value={form.includes}
              onChange={handleChange}
              className="w-full p-4 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Separate items with commas (e.g., Breakfast, WiFi, Parking)
            </p>
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
                editingId ? "Update Tour" : "Add Tour"
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

      {/* ================= TOURS LIST ================= */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-transparent dark:border-gray-700">
        <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-700">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                All Tours ({filteredTours.length})
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-300 mt-1">
                {searchTerm ? `Showing results for "${searchTerm}"` : "Manage your tour packages"}
              </p>
            </div>
            
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="mt-2 md:mt-0 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
              >
                Clear search
              </button>
            )}
          </div>
        </div>

        {loading && tours.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-500 dark:text-gray-300 mt-4">Loading tours...</p>
          </div>
        ) : filteredTours.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-gray-500 dark:text-gray-300 text-lg">
              {searchTerm ? "No tours found matching your search" : "No tours added yet."}
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-400 mt-1">
              {searchTerm ? "Try a different search term" : "Start by adding your first tour above!"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-8">
            {filteredTours.map((tour) => (
              <div
                key={tour._id}
                className="group relative bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-800 rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 hover:border-blue-200"
              >
                {/* Image with overlay */}
                <div className="relative overflow-hidden">
                  <img
                    src={getTourImage(tour.image)}
                    alt={tour.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/400x256?text=No+Image';
                      setImageErrors(prev => ({ ...prev, [tour._id]: true }));
                    }}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300"></div>
                  
                  {editingId === tour._id && (
                    <div className="absolute top-3 left-3 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      Editing
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2 group-hover:text-blue-600 transition-colors">
                    {tour.title}
                  </h3>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                    Duration: {tour.duration}
                  </p>

                  <div className="space-y-2 mb-4">
                    <p className="text-sm text-gray-700 dark:text-gray-300 flex items-center">
                      <span className="mr-2">👥</span> 
                      Max: {tour.maxParticipants} | Price: {formatPrice(tour.price)}
                    </p>

                    {Array.isArray(tour.includes) && tour.includes.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {tour.includes.slice(0, 3).map((inc, idx) => (
                          <span 
                            key={idx} 
                            className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded-full"
                          >
                            {inc}
                          </span>
                        ))}
                        {tour.includes.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full">
                            +{tour.includes.length - 3}
                          </span>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 dark:text-gray-400">No extras listed</p>
                    )}
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 line-clamp-2">
                    {tour.description}
                  </p>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleEdit(tour)}
                      disabled={loading}
                      className="flex-1 bg-yellow-500 text-white py-3 px-4 rounded-xl hover:bg-yellow-600 font-semibold transition-colors shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                      aria-label={`Edit ${tour.title}`}
                    >
                      {loading && editingId === tour._id ? (
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
                      onClick={() => handleDelete(tour._id, tour.title)}
                      disabled={loading}
                      className="flex-1 bg-red-500 text-white py-3 px-4 rounded-xl hover:bg-red-600 font-semibold transition-colors shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                      aria-label={`Delete ${tour.title}`}
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
import React, { useState, useEffect, useCallback } from "react";
import {
  getPackages,
  createPackage,
  updatePackage,
  deletePackage,
} from "../services/api";

export default function AdminPackages() {
  const [packages, setPackages] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [currentImage, setCurrentImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [form, setForm] = useState({
    name: "",
    description: "",
    duration: "",
    price: "",
    destinations: "",
    category: "",
    includes: "",
    highlights: "",
    image: null,
  });

  // Image URL handler
  const BACKEND_URL = process.env.REACT_APP_API_BASE_URL;

  const getImageUrl = (image) => {
    if (!image) {
      return "https://via.placeholder.com/400x256?text=No+Image";
    }

    // Cloudinary full URL → use directly
    if (image.startsWith("http")) {
      return image;
    }

    // Fallback for old relative paths
    return `${BACKEND_URL}${image}`;
  };

  // Format price as LKR currency
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0
    }).format(price);
  };

  // Filter packages based on search
  const filteredPackages = packages.filter(pkg => 
    pkg.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pkg.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pkg.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pkg.destinations?.some(dest => dest.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const loadPackages = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getPackages();
      setPackages(res.data || []);
    } catch (error) {
      console.error("Error loading packages:", error);
      alert("Error loading packages: " + (error.response?.data?.message || error.message));
      setTimeout(loadPackages, 2000);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load data
  useEffect(() => {
    loadPackages();
  }, [loadPackages]);

  // Reset form to initial state
  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      duration: "",
      price: "",
      destinations: "",
      category: "",
      includes: "",
      highlights: "",
      image: null,
    });
    setCurrentImage("");
    setEditingId(null);
  };

  // Form handling
  const handleChange = (e) => {
    let value = e.target.value;

    if (e.target.name === "image") {
      value = e.target.files[0];

      if (value) {
        const reader = new FileReader();
        reader.onload = (e) => setCurrentImage(e.target.result);
        reader.readAsDataURL(value);
      } else {
        setCurrentImage("");
      }
    }

    setForm({ ...form, [e.target.name]: value });
  };

  // Form validation
  const validateForm = () => {
    if (!form.name.trim()) {
      alert("Package name is required!");
      return false;
    }

    const priceNum = Number(form.price);
    if (isNaN(priceNum) || priceNum < 0) {
      alert("Price must be a valid positive number!");
      return false;
    }

    if (!form.image && !editingId && !currentImage) {
      alert("Please select an image!");
      return false;
    }

    if (!form.description.trim()) {
      alert("Description is required!");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (editingId && !window.confirm("Update this package?")) return;

    setLoading(true);

    // Process arrays from comma-separated strings
    const destinationsArray = form.destinations.split(',').map(item => item.trim()).filter(item => item);
    const includesArray = form.includes.split(',').map(item => item.trim()).filter(item => item);
    const highlightsArray = form.highlights.split(',').map(item => item.trim()).filter(item => item);

    const formData = new FormData();
    formData.append("name", form.name.trim());
    formData.append("description", form.description.trim());
    formData.append("duration", form.duration.trim());
    formData.append("price", Number(form.price).toString());
    formData.append("destinations", JSON.stringify(destinationsArray));
    formData.append("category", form.category.trim());
    formData.append("includes", JSON.stringify(includesArray));
    formData.append("highlights", JSON.stringify(highlightsArray));

    if (form.image) {
      formData.append("image", form.image);
    }

    try {
      if (editingId) {
        await updatePackage(editingId, formData);
        alert("Package updated successfully!");
      } else {
        await createPackage(formData);
        alert("Package created successfully!");
      }

      resetForm();
      loadPackages();
    } catch (error) {
      console.error("Submit error:", error);
      alert("Error: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (pkg) => {
    setEditingId(pkg._id);
    setCurrentImage(getImageUrl(pkg.image));

    setForm({
      name: pkg.name || "",
      description: pkg.description || "",
      duration: pkg.duration || "",
      price: pkg.price || "",
      destinations: Array.isArray(pkg.destinations) ? pkg.destinations.join(", ") : (pkg.destinations || ""),
      category: pkg.category || "",
      includes: Array.isArray(pkg.includes) ? pkg.includes.join(", ") : (pkg.includes || ""),
      highlights: Array.isArray(pkg.highlights) ? pkg.highlights.join(", ") : (pkg.highlights || ""),
      image: null,
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) return;

    try {
      setLoading(true);
      await deletePackage(id);
      loadPackages();
      alert("Package deleted successfully!");
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
          <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100">Manage Packages</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Create, edit, and delete tour packages</p>
        </div>
        
        {packages.length > 0 && (
          <div className="mt-4 md:mt-0">
            <input
              type="text"
              placeholder="Search packages..."
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
          {editingId ? "Edit Package" : "Add New Package"}
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
              Package Name *
            </label>
            <input
              type="text"
              name="name"
              placeholder="e.g., Luxury Beach Getaway"
              value={form.name}
              onChange={handleChange}
              className="w-full p-4 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Category
            </label>
            <input
              type="text"
              name="category"
              placeholder="e.g., Adventure, Relaxation, Family"
              value={form.category}
              onChange={handleChange}
              className="w-full p-4 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Duration
            </label>
            <input
              type="text"
              name="duration"
              placeholder="e.g., 5 Days / 4 Nights"
              value={form.duration}
              onChange={handleChange}
              className="w-full p-4 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              placeholder="e.g., 75000"
              value={form.price}
              onChange={handleChange}
              min="0"
              step="100"
              className="w-full p-4 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              disabled={loading}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Destinations (comma separated)
            </label>
            <input
              type="text"
              name="destinations"
              placeholder="e.g., Colombo, Kandy, Nuwara Eliya"
              value={form.destinations}
              onChange={handleChange}
              className="w-full p-4 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Includes (comma separated)
            </label>
            <input
              type="text"
              name="includes"
              placeholder="e.g., Breakfast, WiFi, Airport Transfer"
              value={form.includes}
              onChange={handleChange}
              className="w-full p-4 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Highlights (comma separated)
            </label>
            <input
              type="text"
              name="highlights"
              placeholder="e.g., Sunset Cruise, Wildlife Safari, Spa Treatment"
              value={form.highlights}
              onChange={handleChange}
              className="w-full p-4 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Upload Image {!editingId && "*"}
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
              placeholder="Detailed description of the package..."
              value={form.description}
              onChange={handleChange}
              className="w-full p-4 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
              required
              disabled={loading}
            />
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
                editingId ? "Update Package" : "Add Package"
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

      {/* ================= PACKAGES LIST ================= */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-transparent dark:border-gray-700">
        <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-700">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                All Packages ({filteredPackages.length})
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

        {loading && packages.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-500 dark:text-gray-300 mt-4">Loading packages...</p>
          </div>
        ) : filteredPackages.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-gray-500 dark:text-gray-300 text-lg">
              {searchTerm ? "No packages found matching your search" : "No packages added yet."}
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-400 mt-1">
              {searchTerm ? "Try a different search term" : "Start by adding your first package above!"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-8">
            {filteredPackages.map((pkg) => (
              <div
                key={pkg._id}
                className="group relative bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-800 rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 hover:border-blue-200"
              >
                {/* Image with overlay */}
                <div className="relative overflow-hidden">
                  <img
                    src={getImageUrl(pkg.image)}
                    alt={pkg.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/400x256?text=No+Image';
                    }}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300"></div>
                  
                  {editingId === pkg._id && (
                    <div className="absolute top-3 left-3 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      Editing
                    </div>
                  )}
                  
                  {pkg.category && (
                    <div className="absolute top-3 right-3 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      {pkg.category}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {pkg.name}
                    </h3>
                    <span className="text-lg font-bold text-green-600 dark:text-green-400">
                      {formatPrice(pkg.price)}
                    </span>
                  </div>
                  
                  {pkg.duration && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 flex items-center">
                      <span className="mr-2">⏱️</span> {pkg.duration}
                    </p>
                  )}

                  <div className="space-y-3 mb-4">
                    {Array.isArray(pkg.destinations) && pkg.destinations.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Destinations:</p>
                        <div className="flex flex-wrap gap-1">
                          {pkg.destinations.slice(0, 3).map((dest, idx) => (
                            <span 
                              key={idx} 
                              className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-xs rounded-full"
                            >
                              {dest}
                            </span>
                          ))}
                          {pkg.destinations.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full">
                              +{pkg.destinations.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {Array.isArray(pkg.highlights) && pkg.highlights.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Highlights:</p>
                        <div className="flex flex-wrap gap-1">
                          {pkg.highlights.slice(0, 2).map((highlight, idx) => (
                            <span 
                              key={idx} 
                              className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-xs rounded-full"
                            >
                              {highlight}
                            </span>
                          ))}
                          {pkg.highlights.length > 2 && (
                            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full">
                              +{pkg.highlights.length - 2}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 line-clamp-2">
                    {pkg.description}
                  </p>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleEdit(pkg)}
                      disabled={loading}
                      className="flex-1 bg-yellow-500 text-white py-3 px-4 rounded-xl hover:bg-yellow-600 font-semibold transition-colors shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                      aria-label={`Edit ${pkg.name}`}
                    >
                      {loading && editingId === pkg._id ? (
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
                      onClick={() => handleDelete(pkg._id, pkg.name)}
                      disabled={loading}
                      className="flex-1 bg-red-500 text-white py-3 px-4 rounded-xl hover:bg-red-600 font-semibold transition-colors shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                      aria-label={`Delete ${pkg.name}`}
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
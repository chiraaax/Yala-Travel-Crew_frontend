import React, { useState, useEffect, useCallback } from "react";
import {
  getGallerys,
  createGallery,
  updateGallery,
  deleteGallery,
} from "../services/api";
import { getImageUrl } from "../utils/getImageUrl";

export default function AdminGallerys() {
  const [gallerys, setGallerys] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [currentImage, setCurrentImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const [form, setForm] = useState({
    title: "",
    type: "",
    description: "",
    image: null,
  });

  // Get unique types for filter
  const uniqueTypes = ["all", ...new Set(gallerys.map(item => item.type).filter(Boolean))];

  // Filter gallery items
  const filteredGallerys = gallerys.filter(item => {
    const matchesSearch = item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.type?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === "all" || item.type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  const loadGallerys = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getGallerys();
      setGallerys(res.data || []);
    } catch (error) {
      console.error("Error loading gallery items:", error);
      alert("Failed to load gallery items: " + (error.response?.data?.message || error.message));
      setTimeout(loadGallerys, 2000);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGallerys();
  }, [loadGallerys]);

  const resetForm = () => {
    setForm({
      title: "",
      type: "",
      description: "",
      image: null,
    });
    setCurrentImage("");
    setEditingId(null);
  };

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

  const validateForm = () => {
    if (!form.title.trim()) {
      alert("Title is required!");
      return false;
    }
    if (!form.type.trim()) {
      alert("Type is required!");
      return false;
    }
    if (!form.description.trim()) {
      alert("Description is required!");
      return false;
    }
    if (!form.image && !editingId && !currentImage) {
      alert("Please select an image!");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (editingId && !window.confirm("Update this gallery item?")) return;

    setLoading(true);

    const formData = new FormData();
    formData.append("title", form.title.trim());
    formData.append("type", form.type.trim());
    formData.append("description", form.description.trim());

    if (form.image) {
      formData.append("image", form.image);
    }

    try {
      if (editingId) {
        await updateGallery(editingId, formData);
        alert("Gallery item updated successfully!");
      } else {
        await createGallery(formData);
        alert("Gallery item added successfully!");
      }

      resetForm();
      loadGallerys();
    } catch (error) {
      console.error("Save error:", error);
      alert("Failed to save item: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setCurrentImage(getImageUrl(item.image));

    setForm({
      title: item.title || "",
      type: item.type || "",
      description: item.description || "",
      image: null,
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      setLoading(true);
      await deleteGallery(id);
      loadGallerys();
      alert("Gallery item deleted successfully!");
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete item: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100">Manage Gallery</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Upload and manage images in your gallery</p>
        </div>
        
        {gallerys.length > 0 && (
          <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Search gallery..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-48 p-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="p-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {uniqueTypes.map(type => (
                <option key={type} value={type}>
                  {type === "all" ? "All Types" : type}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* ================= FORM ================= */}
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg mb-12 border border-gray-100 dark:border-gray-700">
        <h2 className="text-2xl font-semibold mb-6 text-gray-700 dark:text-gray-200">
          {editingId ? "Edit Gallery Item" : "Add New Gallery Item"}
        </h2>

        {currentImage && (
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
            <img 
              src={currentImage} 
              alt="Preview" 
              className="w-48 h-48 object-cover rounded-lg mx-auto" 
              onError={(e) => {
                e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Image+Error';
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
              placeholder="e.g., Sunset at Beach"
              value={form.title}
              onChange={handleChange}
              className="w-full p-4 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Type *
            </label>
            <input
              type="text"
              name="type"
              placeholder="e.g., Nature, Urban, Wildlife"
              value={form.type}
              onChange={handleChange}
              className="w-full p-4 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
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
              placeholder="Describe the image..."
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
                  {editingId ? "Updating..." : "Uploading..."}
                </>
              ) : (
                editingId ? "Update Item" : "Add to Gallery"
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

      {/* ================= GALLERY LIST ================= */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-transparent dark:border-gray-700">
        <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-700">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                Gallery Items ({filteredGallerys.length})
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-300 mt-1">
                {searchTerm || typeFilter !== "all" 
                  ? `Showing filtered results` 
                  : "All gallery images"}
                {searchTerm && ` for "${searchTerm}"`}
                {typeFilter !== "all" && ` • Type: ${typeFilter}`}
              </p>
            </div>
            
            {(searchTerm || typeFilter !== "all") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setTypeFilter("all");
                }}
                className="mt-2 md:mt-0 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        {loading && gallerys.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-500 dark:text-gray-300 mt-4">Loading gallery items...</p>
          </div>
        ) : filteredGallerys.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-gray-500 dark:text-gray-300 text-lg">
              {searchTerm || typeFilter !== "all" 
                ? "No gallery items found matching your filters" 
                : "No gallery items added yet."}
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-400 mt-1">
              {searchTerm || typeFilter !== "all" 
                ? "Try adjusting your search or filters" 
                : "Start by adding your first image above!"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-8">
            {filteredGallerys.map((item) => (
              <div
                key={item._id}
                className="group relative bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-800 rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 hover:border-blue-200"
              >
                {/* Image with overlay */}
                <div className="relative overflow-hidden">
                  <img
                    src={getImageUrl(
                      item.image,
                      "https://via.placeholder.com/400x300?text=No+Image"
                    )}
                    alt={item.title}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/400x300?text=No+Image';
                    }}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300"></div>
                  
                  {editingId === item._id && (
                    <div className="absolute top-3 left-3 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      Editing
                    </div>
                  )}
                  
                  {item.type && (
                    <div className="absolute top-3 right-3 bg-purple-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      {item.type}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">
                    {item.title}
                  </h3>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                    {item.description}
                  </p>

                  <div className="flex justify-between items-center">
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(item.createdAt || Date.now()).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(item)}
                        disabled={loading}
                        className="px-4 py-2 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 font-semibold transition-colors shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center text-sm"
                        aria-label={`Edit ${item.title}`}
                      >
                        {loading && editingId === item._id ? (
                          <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-1 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Editing
                          </span>
                        ) : (
                          "Edit"
                        )}
                      </button>

                      <button
                        onClick={() => handleDelete(item._id, item.title)}
                        disabled={loading}
                        className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 font-semibold transition-colors shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center text-sm"
                        aria-label={`Delete ${item.title}`}
                      >
                        {loading ? "Deleting..." : "Delete"}
                      </button>
                    </div>
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
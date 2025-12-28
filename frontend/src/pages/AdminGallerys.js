import React, { useState, useEffect } from "react";
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
  const [isUploading, setIsUploading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    type: "",
    description: "",
    image: null,
  });

  useEffect(() => {
    loadGallerys();
  }, []);

  const loadGallerys = async () => {
    try {
      const res = await getGallerys();
      setGallerys(res.data || []);
    } catch (error) {
      console.error("Error loading gallery items:", error);
      alert("Failed to load gallery items.");
    }
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);

    if (!form.title.trim() || !form.type.trim() || !form.description.trim()) {
      alert("All fields are required!");
      setIsUploading(false);
      return;
    }

    if (!form.image && !editingId) {
      alert("Please select an image!");
      setIsUploading(false);
      return;
    }

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
        alert("Gallery item updated!");
      } else {
        await createGallery(formData);
        alert("Gallery item added!");
      }

      setForm({
        title: "",
        type: "",
        description: "",
        image: null,
      });
      setCurrentImage("");
      setEditingId(null);
      loadGallerys();
    } catch (error) {
      console.error("Save error:", error);
      alert("Failed to save item.");
    } finally {
      setIsUploading(false);
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

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this item?")) return;

    try {
      await deleteGallery(id);
      loadGallerys();
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete item.");
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto min-h-screen bg-gray-50 dark:bg-gray-900">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
        Manage Gallery
      </h1>

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10 bg-white dark:bg-gray-800 p-6 rounded-lg shadow"
      >
        <input
          type="text"
          name="title"
          placeholder="Title *"
          value={form.title}
          onChange={handleChange}
          className="p-3 border rounded bg-gray-50 dark:bg-gray-700 dark:text-white"
        />

        <input
          type="text"
          name="type"
          placeholder="Type *"
          value={form.type}
          onChange={handleChange}
          className="p-3 border rounded bg-gray-50 dark:bg-gray-700 dark:text-white"
        />

        <div className="md:col-span-2">
          <input
            type="file"
            name="image"
            accept="image/*"
            onChange={handleChange}
            className="w-full p-3 border rounded bg-gray-50 dark:bg-gray-700"
          />

          {currentImage && (
            <img
              src={currentImage}
              alt="Preview"
              className="mt-3 w-32 h-32 object-cover rounded mx-auto"
            />
          )}
        </div>

        <textarea
          name="description"
          placeholder="Description *"
          value={form.description}
          onChange={handleChange}
          className="p-3 border rounded md:col-span-2 bg-gray-50 dark:bg-gray-700 dark:text-white"
          rows={4}
        />

        <button
          type="submit"
          disabled={isUploading}
          className="md:col-span-2 bg-blue-600 text-white py-3 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isUploading ? "Saving..." : editingId ? "Update" : "Add Item"}
        </button>
      </form>

      {/* LIST */}
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        Gallery Items
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {gallerys.map((item) => (
          <div
            key={item._id}
            className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow"
          >
            <img
              src={getImageUrl(
                item.image,
                "https://via.placeholder.com/400x300?text=No+Image"
              )}
              alt={item.title}
              className="w-full h-48 object-cover rounded mb-4"
              onError={(e) => {
                e.currentTarget.src =
                  "https://via.placeholder.com/400x300?text=No+Image";
              }}
            />

            <h3 className="font-bold text-gray-900 dark:text-white">
              {item.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Type: {item.type}
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {item.description}
            </p>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => handleEdit(item)}
                className="px-3 py-1 bg-yellow-500 text-white rounded text-sm"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(item._id)}
                className="px-3 py-1 bg-red-600 text-white rounded text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from "react";
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
  const [isUploading, setIsUploading] = useState(false);

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

  /* ======================
     IMAGE URL HANDLER (FIXED)
  ====================== */
  const BACKEND_URL = process.env.REACT_APP_API_BASE_URL;

  const getImageUrl = (image) => {
    if (!image) {
      return "https://via.placeholder.com/150x150?text=No+Image";
    }

    // ✅ Cloudinary full URL → use directly
    if (image.startsWith("http")) {
      return image;
    }

    // ⚠️ Fallback for old relative paths
    return `${BACKEND_URL}${image}`;
  };

  /* ======================
     LOAD DATA
  ====================== */
  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    const res = await getPackages();
    setPackages(res.data || []);
  };

  /* ======================
     FORM HANDLING
  ====================== */
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);

    if (!form.name.trim()) {
      alert("Package name is required!");
      setIsUploading(false);
      return;
    }

    const priceNum = Number(form.price);
    if (isNaN(priceNum) || priceNum < 0) {
      alert("Invalid price!");
      setIsUploading(false);
      return;
    }

    if (!form.image && !editingId) {
      alert("Please select an image!");
      setIsUploading(false);
      return;
    }

    const formData = new FormData();
    formData.append("name", form.name.trim());
    formData.append("description", form.description.trim());
    formData.append("duration", form.duration.trim());
    formData.append("price", priceNum.toString());
    formData.append("destinations", form.destinations.trim());
    formData.append("category", form.category.trim());
    formData.append("includes", form.includes.trim());
    formData.append("highlights", form.highlights.trim());

    if (form.image) {
      formData.append("image", form.image);
    }

    try {
      if (editingId) {
        await updatePackage(editingId, formData);
        alert("Package updated!");
      } else {
        await createPackage(formData);
        alert("Package created!");
      }

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
      loadPackages();
    } catch (error) {
      console.error("Submit error:", error);
      alert(error.response?.data?.message || "Upload failed");
    } finally {
      setIsUploading(false);
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
      destinations: (pkg.destinations || []).join(", "),
      category: pkg.category || "",
      includes: (pkg.includes || []).join(", "),
      highlights: (pkg.highlights || []).join(", "),
      image: null,
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this package?")) return;
    await deletePackage(id);
    loadPackages();
  };

  /* ======================
     UI
  ====================== */
  return (
    <div className="p-8 max-w-5xl mx-auto min-h-screen bg-gray-50 dark:bg-gray-900">
      <h1 className="text-3xl font-bold mb-6">Manage Packages</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
        <input name="name" value={form.name} onChange={handleChange} placeholder="Package Name" required />
        <input name="category" value={form.category} onChange={handleChange} placeholder="Category" />
        <input name="duration" value={form.duration} onChange={handleChange} placeholder="Duration" />
        <input name="price" type="number" min="0" value={form.price} onChange={handleChange} placeholder="Price" required />
        <input name="destinations" value={form.destinations} onChange={handleChange} placeholder="Destinations" />
        <input name="includes" value={form.includes} onChange={handleChange} placeholder="Includes" />
        <input name="highlights" value={form.highlights} onChange={handleChange} placeholder="Highlights" />

        <input type="file" name="image" accept="image/*" onChange={handleChange} required={!editingId} />

        {currentImage && (
          <img src={currentImage} alt="Preview" className="w-32 h-32 object-cover rounded mx-auto" />
        )}

        <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" />

        <button disabled={isUploading} className="bg-blue-600 text-white py-3 rounded col-span-2">
          {isUploading ? "Uploading..." : editingId ? "Update Package" : "Add Package"}
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {packages.map((pkg) => (
          <div key={pkg._id} className="bg-white shadow p-4 flex gap-4 rounded">
            <img
              src={getImageUrl(pkg.image)}
              alt={pkg.name}
              className="w-32 h-32 object-cover rounded"
              onError={(e) =>
                (e.currentTarget.src =
                  "https://via.placeholder.com/150x150?text=No+Image")
              }
            />
            <div>
              <h3 className="font-bold">{pkg.name}</h3>
              <p>Rs {pkg.price}</p>
              <div className="flex gap-2 mt-2">
                <button onClick={() => handleEdit(pkg)} className="bg-yellow-500 px-3 py-1 text-white rounded">Edit</button>
                <button onClick={() => handleDelete(pkg._id)} className="bg-red-600 px-3 py-1 text-white rounded">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

export const getImageUrl = (
  imagePath,
  fallback = "https://via.placeholder.com/400x256?text=No+Image"
) => {
  // No image at all
  if (!imagePath) return fallback;

  // ✅ Cloudinary or any full URL
  if (imagePath.startsWith("http")) {
    return imagePath;
  }

  // ✅ Local / legacy backend image
  return `${BASE_URL}${imagePath}`;
};

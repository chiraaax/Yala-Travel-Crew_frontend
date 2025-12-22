const BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

export const getImageUrl = (imagePath, fallback) => {
  if (!imagePath) return fallback;
  return `${BASE_URL}${imagePath}`;
};

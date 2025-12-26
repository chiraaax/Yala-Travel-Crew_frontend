import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getGallerys } from "../services/api";
import PageTransition from "../components/PageTransition";
import { getImageUrl } from "../utils/getImageUrl";

const FALLBACK_IMAGE =
  "https://via.placeholder.com/600x400?text=No+Image";

const Gallery = () => {
  const [galleryItems, setGalleryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetchGalleryItems();
  }, []);

  const fetchGalleryItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getGallerys();
      setGalleryItems(response.data || []);
    } catch (err) {
      console.error("Error fetching gallery:", err);
      setError("Failed to load gallery. Please try again.");
      setGalleryItems([]);
    } finally {
      setLoading(false);
    }
  };

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <PageTransition>
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="text-6xl"
          >
            🖼️
          </motion.div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* ================= HERO ================= */}
        <section className="relative -mt-20 h-[50vh] md:h-[60vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1528164344705-47542687000d?auto=format&fit=crop&w=1920&q=80"
              alt="Gallery Hero"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40" />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-50 dark:from-gray-900 via-transparent to-black/30" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10 text-center px-4 pt-20"
          >
            <div className="backdrop-blur-md bg-white/10 border border-white/20 p-8 rounded-3xl shadow-2xl">
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-2">
                Visual{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400">
                  Diaries
                </span>
              </h1>
              <p className="text-lg text-gray-200">
                Capturing the soul of the Sri Lankan wilderness
              </p>
            </div>
          </motion.div>
        </section>

        {/* ================= GALLERY GRID ================= */}
        <section className="max-w-7xl mx-auto px-4 py-20">
          {error && (
            <div className="text-center text-red-500 mb-10">{error}</div>
          )}

          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {galleryItems.map((item) => (
                <motion.div
                  key={item._id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  whileHover={{ y: -6 }}
                  onClick={() => setSelectedImage(item)}
                  className="group relative aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer shadow-lg"
                >
                  <img
                    src={getImageUrl(item.image, FALLBACK_IMAGE)}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    onError={(e) => (e.currentTarget.src = FALLBACK_IMAGE)}
                  />

                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-center">
                    <div>
                      <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full">
                        {item.type}
                      </span>
                      <h3 className="text-2xl font-bold text-white mt-2">
                        {item.title}
                      </h3>
                      <p className="text-white/80 text-sm mt-1">
                        Click to expand
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {galleryItems.length === 0 && (
            <div className="text-center py-20 text-gray-500">
              🖼️ No images in the gallery yet.
            </div>
          )}
        </section>

        {/* ================= LIGHTBOX ================= */}
        <AnimatePresence>
          {selectedImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedImage(null)}
              className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 p-4"
            >
              <motion.div
                initial={{ scale: 0.7 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.7 }}
                onClick={(e) => e.stopPropagation()}
                className="relative max-w-5xl w-full rounded-3xl overflow-hidden"
              >
                <img
                  src={getImageUrl(selectedImage.image, FALLBACK_IMAGE)}
                  alt={selectedImage.title}
                  className="w-full max-h-[85vh] object-contain bg-black"
                />

                <button
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-4 right-4 bg-white/10 text-white p-2 rounded-full"
                >
                  ✕
                </button>

                <div className="absolute bottom-0 w-full p-6 bg-gradient-to-t from-black/80 to-transparent text-white">
                  <span className="text-orange-400 text-sm font-bold uppercase">
                    {selectedImage.type}
                  </span>
                  <h3 className="text-3xl font-bold">
                    {selectedImage.title}
                  </h3>
                  <p className="text-sm opacity-80 mt-2">
                    {selectedImage.description}
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
};

export default Gallery;

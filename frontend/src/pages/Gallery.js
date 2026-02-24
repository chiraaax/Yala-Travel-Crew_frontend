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
  const [setSelectedImage] = useState(null);

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

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center h-[60vh]">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500"></div>
          </div>
        )}

        {!loading && (
          <>
            {/* HERO */}
            <section className="relative -mt-20 h-[50vh] md:h-[60vh] flex items-center justify-center overflow-hidden">
              {/* hero content unchanged */}
            </section>

            {/* GALLERY GRID */}
            <section className="max-w-7xl mx-auto px-4 py-20">
              {error && (
                <div className="text-center text-red-500 mb-10">
                  {error}
                </div>
              )}

              <motion.div
                layout
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              >
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
                        onError={(e) =>
                          (e.currentTarget.src = FALLBACK_IMAGE)
                        }
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>

              {!loading && galleryItems.length === 0 && (
                <div className="text-center py-20 text-gray-500">
                  🖼️ No images in the gallery yet.
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </PageTransition>
  );
};

export default Gallery;
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PageTransition from "../components/PageTransition";
import { getPackages } from "../services/api";
import { getImageUrl } from "../utils/getImageUrl";

const Packages = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  // WhatsApp Config
  const whatsappNumber =
    process.env.REACT_APP_WHATSAPP_NUMBER || "+94772217970";
  const formattedNumber = whatsappNumber.replace(/[^0-9]/g, "");

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const response = await getPackages();
      setPackages(response.data || []);
    } catch (error) {
      console.error("Error fetching packages:", error);
      setPackages([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="text-6xl"
        >
          📦
        </motion.div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">

        {/* ================= HERO SECTION ================= */}
        <section className="relative -mt-20 h-[50vh] md:h-[60vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img
              src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=1920&q=80"
              alt="Safari"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/60" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10 text-center px-4 pt-20"
          >
            <div className="backdrop-blur-md bg-white/10 border border-white/20 p-8 rounded-3xl shadow-2xl">
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-3">
                Curated Experiences
              </h1>
              <p className="text-gray-200">
                All-inclusive safari packages tailored for you
              </p>
            </div>
          </motion.div>
        </section>

        {/* ================= PACKAGES GRID ================= */}
        <section className="max-w-7xl mx-auto px-4 py-20">
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
              {packages.map((pkg) => (
                <motion.div
                  key={pkg._id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-xl border dark:border-gray-700 flex flex-col"
                >
                  {/* IMAGE */}
                  <div className="relative h-72 overflow-hidden">
                    <img
                      src={getImageUrl(
                        pkg.image,
                        "https://via.placeholder.com/400x300?text=No+Image"
                      )}
                      alt={pkg.title}
                      className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                      onError={(e) => {
                        e.target.src =
                          "https://via.placeholder.com/400x300?text=No+Image";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent" />
                  </div>

                  {/* CONTENT */}
                  <div className="p-8 flex flex-col flex-grow">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {pkg.title}
                    </h3>

                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                      {pkg.description}
                    </p>

                    <div className="mt-auto flex items-center justify-between pt-6 border-t dark:border-gray-700">
                      <div>
                        <span className="text-xs uppercase text-gray-400">
                          Price
                        </span>
                        <div className="text-2xl font-bold text-purple-600">
                          LKR {pkg.price?.toLocaleString()}
                        </div>
                      </div>

                      <a
                        href={`https://wa.me/${formattedNumber}?text=Hi, I'm interested in the "${pkg.title}" package.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:scale-105 transition"
                      >
                        Book Now
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {packages.length === 0 && (
            <div className="text-center py-20 text-gray-500">
              No packages found.
            </div>
          )}
        </section>
      </div>
    </PageTransition>
  );
};

export default Packages;

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PageTransition from "../components/PageTransition";
import { getPackages } from "../services/api";
import { getImageUrl } from "../utils/getImageUrl";

const Packages = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">

        {loading && (
          <div className="flex justify-center items-center h-[60vh]">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600"></div>
          </div>
        )}

        {!loading && (
          <section className="max-w-7xl mx-auto px-4 py-20">
            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              <AnimatePresence>
                {packages.map((pkg) => (
                  <motion.div
                    key={pkg._id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-xl border dark:border-gray-700 flex flex-col"
                  >
                    <img
                      src={getImageUrl(
                        pkg.image,
                        "https://via.placeholder.com/400x300?text=No+Image"
                      )}
                      alt={pkg.title}
                      className="h-72 object-cover"
                    />

                    <div className="p-8">
                      <h3 className="text-2xl font-bold mb-4">
                        {pkg.title}
                      </h3>

                      <a
                        href={`https://wa.me/${formattedNumber}?text=Hi, I'm interested in the "${pkg.title}" package.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-bold"
                      >
                        Book Now
                      </a>
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
        )}
      </div>
    </PageTransition>
  );
};

export default Packages;
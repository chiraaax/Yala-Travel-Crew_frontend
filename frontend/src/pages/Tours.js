import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Clock,
  ArrowRight,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { getTours } from "../services/api";
import PageTransition from "../components/PageTransition";
import { getImageUrl } from "../utils/getImageUrl";

const Tours = () => {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTours();
  }, []);

  const fetchTours = async () => {
    try {
      setError(null);
      const response = await getTours();
      setTours(response.data || []);
    } catch (err) {
      console.error("Error fetching tours:", err);
      setError("Unable to load experiences. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950">
        <div className="flex flex-col items-center gap-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-t-2 border-primary-500 rounded-full"
          />
          <p className="text-gray-400 text-sm tracking-widest uppercase">
            Loading Adventures...
          </p>
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">

        {/* ================= HERO ================= */}
        <section className="relative -mt-20 h-[60vh] md:h-[70vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1920&q=80"
              alt="Safari Hero"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/20 to-gray-50 dark:to-gray-950" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10 text-center px-4 pt-20"
          >
            <span className="inline-block mb-4 px-4 py-1 rounded-full bg-white/10 backdrop-blur border border-white/20 text-white uppercase tracking-widest text-sm">
              Your Journey Awaits
            </span>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              Curated{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-emerald-400">
                Expeditions
              </span>
            </h1>
            <p className="text-lg text-gray-200 max-w-2xl mx-auto">
              Discover unforgettable wildlife experiences crafted by experts.
            </p>
          </motion.div>
        </section>

        {/* ================= GRID ================= */}
        <section className="max-w-7xl mx-auto px-4 py-20 -mt-16 relative z-20">

          {/* ERROR */}
          {error && (
            <div className="mb-10 p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl text-center">
              <AlertCircle className="mx-auto mb-4 text-red-500 w-8 h-8" />
              <p className="text-gray-700 dark:text-gray-300 mb-4">{error}</p>
              <button
                onClick={fetchTours}
                className="px-6 py-2 bg-gray-900 text-white rounded-full"
              >
                Retry
              </button>
            </div>
          )}

          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            <AnimatePresence>
              {tours.map((tour, index) => (
                <motion.div
                  key={tour._id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  className="group bg-white dark:bg-gray-900 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition"
                >
                  <Link to={`/tour/${tour._id}`} className="block h-full">

                    {/* IMAGE */}
                    <div className="relative h-64 overflow-hidden">
                      <img
                        src={getImageUrl(
                          tour.image,
                          "https://images.unsplash.com/photo-1549366021-9f761d450615?auto=format&fit=crop&q=80"
                        )}
                        alt={tour.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        onError={(e) => {
                          e.currentTarget.src =
                            "https://images.unsplash.com/photo-1549366021-9f761d450615?auto=format&fit=crop&q=80";
                        }}
                      />

                      <div className="absolute top-4 left-4 bg-white/90 dark:bg-black/80 px-3 py-1.5 rounded-full flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary-500" />
                        <span className="text-xs font-bold uppercase">
                          {tour.duration}
                        </span>
                      </div>
                    </div>

                    {/* CONTENT */}
                    <div className="p-8">
                      <h2 className="text-2xl font-bold mb-3 group-hover:text-primary-500 transition">
                        {tour.title}
                      </h2>

                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-6">
                        {tour.description}
                      </p>

                      <div className="flex justify-between items-center pt-4 border-t">
                        <div>
                          <p className="text-xs uppercase text-gray-400">
                            Price per person
                          </p>
                          <p className="text-xl font-bold text-primary-600">
                            LKR {tour.price.toLocaleString()}
                          </p>
                        </div>

                        <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 group-hover:bg-primary-600 group-hover:text-white transition transform group-hover:-rotate-45">
                          <ArrowRight />
                        </div>
                      </div>
                    </div>

                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* EMPTY */}
          {tours.length === 0 && !error && (
            <div className="text-center py-24">
              <Sparkles className="mx-auto mb-6 w-10 h-10 text-gray-400" />
              <h3 className="text-2xl font-bold mb-2">Coming Soon</h3>
              <p className="text-gray-500">
                New experiences are being prepared.
              </p>
            </div>
          )}
        </section>
      </div>
    </PageTransition>
  );
};

export default Tours;

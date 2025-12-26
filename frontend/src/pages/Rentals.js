import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getRentals } from "../services/api";
import PageTransition from "../components/PageTransition";
import { getImageUrl } from "../utils/getImageUrl";

const Rentals = () => {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ================= WHATSAPP ================= */
  const whatsappNumber =
    process.env.REACT_APP_WHATSAPP_NUMBER || "+94772217970";
  const formattedNumber = whatsappNumber.replace(/\D/g, "");

  useEffect(() => {
    fetchRentals();
  }, []);

  const fetchRentals = async () => {
    try {
      const response = await getRentals();
      setRentals(response.data || []);
    } catch (err) {
      console.error("Error fetching rentals:", err);
      setRentals([]);
    } finally {
      setLoading(false);
    }
  };

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="text-6xl"
        >
          🚙
        </motion.div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">

        {/* ================= HERO ================= */}
        <section className="relative -mt-20 h-[50vh] md:h-[60vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1506015391300-4802dc74de2e?auto=format&fit=crop&w=1920&q=80"
              alt="Safari Vehicle Hero"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50" />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-50 dark:from-gray-900 via-transparent to-black/60" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10 text-center px-4 pt-20"
          >
            <div className="backdrop-blur-md bg-white/10 dark:bg-black/40 border border-white/20 p-8 md:p-12 rounded-3xl shadow-2xl">
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-2">
                Our{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-500">
                  Fleet
                </span>
              </h1>
              <p className="text-lg text-gray-200">
                Choose your perfect ride for the adventure of a lifetime
              </p>
            </div>
          </motion.div>
        </section>

        {/* ================= GRID ================= */}
        <section className="max-w-7xl mx-auto px-4 pt-16 pb-24 relative z-20">
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            <AnimatePresence>
              {rentals.map((rental) => (
                <motion.div
                  key={rental._id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4 }}
                  className="group bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition"
                >
                  {/* IMAGE */}
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={getImageUrl(
                        rental.image,
                        "https://via.placeholder.com/400x256?text=No+Image"
                      )}
                      alt={rental.vehicleName}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://via.placeholder.com/400x256?text=No+Image";
                      }}
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent" />

                    {/* BADGES */}
                    <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
                      <span className="bg-white/20 backdrop-blur border border-white/20 text-white text-xs font-bold px-3 py-1 rounded-full uppercase">
                        {rental.vehicleType}
                      </span>

                      {rental.available ? (
                        <span className="bg-green-500/80 text-white text-xs font-bold px-3 py-1 rounded-full uppercase">
                          Available
                        </span>
                      ) : (
                        <span className="bg-red-500/80 text-white text-xs font-bold px-3 py-1 rounded-full uppercase">
                          Booked
                        </span>
                      )}
                    </div>

                    {/* TITLE */}
                    <div className="absolute bottom-4 left-4 text-white">
                      <h3 className="text-2xl font-bold">
                        {rental.vehicleName}
                      </h3>
                      <div className="flex gap-3 text-xs mt-1">
                        <span className="bg-black/40 px-2 py-1 rounded">
                          👥 {rental.seats} Seats
                        </span>
                        <span className="bg-black/40 px-2 py-1 rounded">
                          ⛽ {rental.fuel}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* CONTENT */}
                  <div className="p-6">
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                      {rental.description}
                    </p>

                    {/* FEATURES */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {(rental.features || []).map((feature, i) => (
                        <span
                          key={i}
                          className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>

                    {/* FOOTER */}
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div>
                        <p className="text-xs uppercase text-gray-400">
                          Ready to Rent
                        </p>
                        <p className="text-lg font-bold text-green-600">
                          {rental.available
                            ? "Available Now"
                            : "Check Availability"}
                        </p>
                      </div>

                      <a
                        href={`https://wa.me/${formattedNumber}?text=Hi, I am interested in renting the ${rental.vehicleName}. Is it available?`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => !rental.available && e.preventDefault()}
                        className={`px-6 py-2 rounded-xl font-bold text-sm transition ${
                          rental.available
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                      >
                        {rental.available ? "Rent Now" : "Unavailable"}
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* EMPTY */}
          {rentals.length === 0 && (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">🚙</div>
              <p className="text-gray-500">No vehicles found.</p>
            </div>
          )}
        </section>
      </div>
    </PageTransition>
  );
};

export default Rentals;

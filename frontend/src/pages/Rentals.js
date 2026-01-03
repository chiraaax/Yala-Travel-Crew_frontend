import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getRentals } from "../services/api";
import PageTransition from "../components/PageTransition";
import { getImageUrl } from "../utils/getImageUrl";
import { 
  Car, 
  Users, 
  Fuel, 
  CheckCircle2, 
  ArrowRight 
} from "lucide-react";

const Rentals = () => {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ================= WHATSAPP ================= */
  const whatsappNumber = process.env.REACT_APP_WHATSAPP_NUMBER || "+94772217970";
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
                Choose your perfect ride for the exploration of a lifetime.
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
                  className="group flex flex-col bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-gray-100 dark:border-gray-700"
                >
                  
                  {/* ================= CARD IMAGE ================= */}
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
                    
                    {/* Status Badge */}
                    <div className="absolute top-4 left-4">
                      {rental.available ? (
                        <span className="flex items-center gap-1.5 bg-green-500/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                          AVAILABLE
                        </span>
                      ) : (
                        <span className="bg-red-500/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                          BOOKED
                        </span>
                      )}
                    </div>

                    {/* Type Badge */}
                    <div className="absolute top-4 right-4">
                      <span className="bg-black/60 backdrop-blur-md text-white text-xs font-medium px-3 py-1.5 rounded-full border border-white/20">
                        {rental.vehicleType}
                      </span>
                    </div>
                  </div>

                  {/* ================= CARD CONTENT ================= */}
                  <div className="flex flex-col flex-grow p-6">
                    
                    {/* Header */}
                    <div className="mb-4">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 transition-colors">
                        {rental.vehicleName}
                      </h3>
                      <div className="h-1 w-12 bg-blue-500 rounded-full" />
                    </div>

                    {/* Quick Specs Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                          <Users size={18} />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase">Capacity</p>
                          <p className="text-sm font-bold text-gray-800 dark:text-gray-100">{rental.seats} Seats</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl">
                        <div className="p-2 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-lg">
                          <Fuel size={18} />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase">Fuel Type</p>
                          <p className="text-sm font-bold text-gray-800 dark:text-gray-100">{rental.fuel}</p>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 line-clamp-2 leading-relaxed">
                      {rental.description}
                    </p>

                    {/* Features Tags */}
                    <div className="flex flex-wrap gap-2 mb-6 mt-auto">
                      {(rental.features || []).slice(0, 3).map((feature, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 text-[11px] font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-md"
                        >
                          <CheckCircle2 size={12} className="text-green-500" />
                          {feature}
                        </span>
                      ))}
                      {(rental.features?.length > 3) && (
                        <span className="text-[11px] font-medium bg-gray-100 dark:bg-gray-700 text-gray-500 px-2 py-1 rounded-md">
                          +{rental.features.length - 3} more
                        </span>
                      )}
                    </div>

                    {/* Action Button */}
                    <a
                      href={`https://wa.me/${formattedNumber}?text=Hi, I am interested in booking the ${rental.vehicleName}. Is it available?`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => !rental.available && e.preventDefault()}
                      className={`
                        w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all shadow-lg
                        ${rental.available
                          ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-blue-200 dark:shadow-none transform active:scale-95"
                          : "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                        }
                      `}
                    >
                      {rental.available ? (
                        <>
                          Book Now <ArrowRight size={18} />
                        </>
                      ) : (
                        "Currently Unavailable"
                      )}
                    </a>

                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* EMPTY STATE */}
          {rentals.length === 0 && !loading && (
            <div className="text-center py-20">
              <div className="bg-gray-100 dark:bg-gray-800 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                <Car className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Vehicles Found</h3>
              <p className="text-gray-500 dark:text-gray-400 text-base max-w-md mx-auto">
                We couldn't find any vehicles available for rent at the moment. Please check back later.
              </p>
            </div>
          )}
        </section>
      </div>
    </PageTransition>
  );
};

export default Rentals;
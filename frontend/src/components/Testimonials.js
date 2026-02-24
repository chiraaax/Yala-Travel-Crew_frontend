import React from 'react';
import { motion } from 'framer-motion';

const Testimonials = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      {/* Decorative gradient orbs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-r from-emerald-200 to-teal-200 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-full filter blur-3xl opacity-30 -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-r from-blue-200 to-indigo-200 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-full filter blur-3xl opacity-30 translate-x-1/2 translate-y-1/2"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          {/* Google badge */}
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-md mb-6 border border-gray-200 dark:border-gray-700"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Google Reviews</span>
            <div className="flex items-center gap-1 ml-2">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-yellow-400 text-lg">⭐</span>
              ))}
              <span className="text-sm font-semibold text-gray-800 dark:text-white ml-1">4.9</span>
            </div>
          </motion.div>

          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-800 dark:text-white">
            Real Reviews From{' '}
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Happy Travelers
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            See what our guests have to say about their wildlife adventures with us
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <motion.div variants={itemVariants} className="relative">
            {/* Elfsight Google Reviews Widget */}
            <div className="elfsight-app-67a51eed-6139-495b-a84e-6c7f5e21337a" data-elfsight-app-lazy></div>
            
            {/* Custom styling for Elfsight widget */}
            <style jsx>{`
              .elfsight-app-67a51eed-6139-495b-a84e-6c7f5e21337a {
                min-height: 400px;
                --e-g-accent-color: #059669;
                --e-g-rating-color: #fbbf24;
                --e-g-card-bg-color: rgba(255, 255, 255, 0.8);
                --e-g-card-border-radius: 1rem;
                --e-g-card-padding: 1.5rem;
                --e-g-card-box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02);
                --e-g-card-border: 1px solid rgba(229, 231, 235, 0.5);
                --e-g-card-hover-transform: translateY(-4px);
                --e-g-card-hover-box-shadow: 0 25px 30px -5px rgba(0, 0, 0, 0.1);
              }
              
              @media (prefers-color-scheme: dark) {
                .elfsight-app-67a51eed-6139-495b-a84e-6c7f5e21337a {
                  --e-g-card-bg-color: rgba(31, 41, 55, 0.8);
                  --e-g-card-border: 1px solid rgba(75, 85, 99, 0.5);
                  --e-g-text-color: #f3f4f6;
                  --e-g-text-secondary-color: #9ca3af;
                }
              }
            `}</style>
          </motion.div>
        </motion.div>

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 text-center"
        >
          {[
            { number: '500+', label: '5-Star Reviews' },
            { number: '4.9', label: 'Average Rating' },
            { number: '1000+', label: 'Happy Guests' },
            { number: '2019', label: 'Since' },
          ].map((stat, index) => (
            <div key={index} className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <div className="text-2xl font-bold text-gray-800 dark:text-white">{stat.number}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Load Elfsight script */}
      <script src="https://elfsightcdn.com/platform.js" async></script>
    </section>
  );
};

export default Testimonials;
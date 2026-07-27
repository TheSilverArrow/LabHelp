import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface DarkModeToggleProps {
  isDark: boolean;
  toggle: () => void;
}

const DarkModeToggle: React.FC<DarkModeToggleProps> = ({ isDark, toggle }) => {
  return (
    <button
      onClick={toggle}
      className="relative w-16 h-8 rounded-full transition-colors duration-500 focus:outline-none overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer group shadow-sm"
      aria-label="Toggle dark mode"
    >
      {/* Background Fading Effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-amber-100 to-amber-50 dark:from-indigo-950 dark:to-slate-900"
        animate={{ opacity: isDark ? 1 : 0 }}
        transition={{ duration: 0.5 }}
      />

      {/* Decorative Clouds (Light Mode) */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{ 
          opacity: isDark ? 0 : 1,
          y: isDark ? 10 : 0 
        }}
        transition={{ duration: 0.4 }}
      >
        <div className="absolute top-2 left-8 w-4 h-2 bg-white/80 rounded-full" />
        <div className="absolute top-4 left-10 w-3 h-1.5 bg-white/60 rounded-full" />
        <div className="absolute top-1.5 left-14 w-5 h-2.5 bg-white/70 rounded-full" />
      </motion.div>

      {/* Decorative Stars (Dark Mode) */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: isDark ? 1 : 0,
          y: isDark ? 0 : -10 
        }}
        transition={{ duration: 0.4 }}
      >
        <div className="absolute top-2 left-2 w-0.5 h-0.5 bg-white rounded-full shadow-[0_0_2px_white]" />
        <div className="absolute top-5 left-4 w-1 h-1 bg-white rounded-full shadow-[0_0_2px_white] animate-pulse" />
        <div className="absolute top-1.5 left-6 w-0.5 h-0.5 bg-white rounded-full shadow-[0_0_2px_white]" />
        <div className="absolute top-4 left-12 w-0.5 h-0.5 bg-white rounded-full shadow-[0_0_2px_white]" />
        <div className="absolute top-2 left-14 w-1 h-1 bg-white rounded-full shadow-[0_0_2px_white] animate-pulse" />
      </motion.div>

      {/* Sliding Knob Container */}
      <motion.div
        className="absolute top-1 left-1 w-6 h-6 z-10"
        animate={{ x: isDark ? 32 : 0 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Sun Icon */}
          <motion.div
            className="absolute inset-0 bg-amber-400 rounded-full shadow-[0_0_8px_rgba(251,191,36,0.5)]"
            animate={{ 
              scale: isDark ? 0 : 1,
              opacity: isDark ? 0 : 1,
              rotate: isDark ? 90 : 0
            }}
            transition={{ duration: 0.4 }}
          >
            {/* Sun Rays */}
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute top-1/2 left-1/2 w-1 h-0.5 bg-amber-400 rounded-full origin-left"
                style={{ 
                  transform: `translate(-50%, -50%) rotate(${i * 45}deg) translateX(5px)` 
                }}
              />
            ))}
          </motion.div>

          {/* Moon Icon */}
          <motion.div
            className="absolute inset-0 bg-slate-100 rounded-full shadow-[0_0_12px_rgba(255,255,255,0.4)]"
            initial={{ scale: 0, opacity: 0, rotate: -90 }}
            animate={{ 
              scale: isDark ? 1 : 0,
              opacity: isDark ? 1 : 0,
              rotate: isDark ? 0 : -90
            }}
            transition={{ duration: 0.4 }}
          >
            {/* Moon Crescent Cutout (Flat Style) */}
            <div className="absolute top-0 -right-1 w-4 h-4 bg-indigo-950 dark:bg-slate-900 rounded-full" 
                 style={{ transform: 'scale(1.1)' }} />
            
            {/* Glowing effect for the moon */}
            <motion.div 
              className="absolute inset-0 rounded-full bg-white/20 blur-[2px]"
              animate={{ opacity: [0.2, 0.5, 0.2] }}
              transition={{ repeat: Infinity, duration: 3 }}
            />
          </motion.div>
        </div>
      </motion.div>

      {/* Decorative Stars/Clouds (Flat Style) */}
      <div className="absolute inset-0 pointer-events-none px-2 flex items-center justify-between">
        <motion.div
          animate={{ opacity: isDark ? 0 : 0.6, x: isDark ? -10 : 0 }}
          className="text-[8px] font-bold text-amber-600/40 select-none"
        >
          DAY
        </motion.div>
        <motion.div
          animate={{ opacity: isDark ? 0.6 : 0, x: isDark ? 0 : 10 }}
          className="text-[8px] font-bold text-slate-400/40 select-none"
        >
          NIGHT
        </motion.div>
      </div>
    </button>
  );
};

export default DarkModeToggle;

import React from 'react';
import { motion } from 'motion/react';
import { FlaskConical, Printer, Map, Sparkles, LucideIcon } from 'lucide-react';

interface AnimatedTabIconProps {
  id: string;
  isActive: boolean;
  size?: number;
}

const iconMap: Record<string, LucideIcon> = {
  'form-tool-content': FlaskConical,
  'third-tool': Printer,
  'second-tool': Map,
};

export const AnimatedTabIcon: React.FC<AnimatedTabIconProps> = ({ id, isActive, size = 20 }) => {
  const Icon = iconMap[id] || Sparkles;
  const containerSize = Math.round(size * 1.2);

  return (
    <div className="relative flex items-center justify-center mr-2" style={{ width: containerSize, height: containerSize }}>
      {/* Background glow effect when active */}
      {isActive && (
        <motion.div
          layoutId={id === 'form-tool-content' || id === 'third-tool' || id === 'second-tool' ? `icon-glow-${id}` : "icon-glow"}
          className="absolute inset-0 bg-blue-400/20 rounded-full blur-md"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1.2, opacity: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      )}

      <motion.div
        animate={isActive ? {
          scale: 1.1,
          rotate: [0, -5, 5, 0],
          y: [0, -2, 0]
        } : {
          scale: 1,
          rotate: 0,
          y: 0
        }}
        transition={{
          duration: 0.5,
          ease: "easeInOut",
          rotate: { repeat: isActive ? Infinity : 0, duration: 2, ease: "linear" },
          y: { repeat: isActive ? Infinity : 0, duration: 2, ease: "easeInOut" }
        }}
        className={`${isActive ? 'text-blue-500' : 'text-slate-400'}`}
      >
        <Icon size={size} strokeWidth={isActive ? 2.5 : 2} />
      </motion.div>

      {/* Small decorative particles for 'active' state */}
      {isActive && id === 'second-tool' && (
        <motion.div
          className="absolute -top-1 -right-1"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Map size={8} className="text-blue-400" />
        </motion.div>
      )}
    </div>
  );
};

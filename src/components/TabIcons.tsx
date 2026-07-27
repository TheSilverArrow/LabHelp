import React from 'react';
import { motion } from 'motion/react';

export const LabIcon = ({ active }: { active: boolean }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <motion.path
      d="M10 2V8L4.72 15.55C3.97 16.63 4.74 18.12 6.07 18.12H17.93C19.26 18.12 20.03 16.63 19.28 15.55L14 8V2"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      animate={active ? { 
        rotate: [0, -5, 5, -5, 0],
        transition: { repeat: Infinity, duration: 2 }
      } : {}}
    />
    <motion.path
      d="M8 2H16"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      animate={active ? { y: [0, -1, 0], transition: { repeat: Infinity, duration: 1 } } : {}}
    />
    <motion.circle
      cx="12" cy="14" r="1.5"
      fill="currentColor"
      animate={active ? { 
        y: [0, -4, 0],
        opacity: [0, 1, 0],
        transition: { repeat: Infinity, duration: 1.5, delay: 0.2 }
      } : { opacity: 0 }}
    />
    <motion.circle
      cx="9" cy="12" r="1"
      fill="currentColor"
      animate={active ? { 
        y: [0, -3, 0],
        opacity: [0, 1, 0],
        transition: { repeat: Infinity, duration: 1.2, delay: 0.5 }
      } : { opacity: 0 }}
    />
  </svg>
);

export const PrintablesIcon = ({ active }: { active: boolean }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M6 9V2H18V9"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M6 18H4C2.89543 18 2 17.1046 2 16V11C2 9.89543 2.89543 9 4 9H20C21.1046 9 22 9.89543 22 11V16C22 17.1046 21.1046 18 20 18H18"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <motion.rect
      x="6" y="14" width="12" height="8"
      stroke="currentColor"
      strokeWidth="2"
      animate={active ? { 
        y: [0, 2, 0],
        transition: { repeat: Infinity, duration: 2 }
      } : {}}
    />
    <motion.path
      d="M9 17H15"
      stroke="currentColor"
      strokeWidth="2"
      animate={active ? { 
        opacity: [0, 1, 0],
        transition: { repeat: Infinity, duration: 1, delay: 0.5 }
      } : {}}
    />
  </svg>
);

export const SoonIcon = ({ active }: { active: boolean }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <motion.path
      d="M12 2V6M12 18V22M6 12H2M22 12H18M19.07 4.93L16.24 7.76M7.76 16.24L4.93 19.07M19.07 19.07L16.24 16.24M7.76 7.76L4.93 4.93"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      animate={active ? { 
        rotate: 360,
        transition: { repeat: Infinity, duration: 4, ease: "linear" }
      } : {}}
    />
    <motion.circle
      cx="12" cy="12" r="3"
      stroke="currentColor"
      strokeWidth="2"
      animate={active ? { 
        scale: [1, 1.2, 1],
        transition: { repeat: Infinity, duration: 2 }
      } : {}}
    />
  </svg>
);

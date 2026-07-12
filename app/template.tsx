'use client';

import { motion } from 'framer-motion';

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ 
        duration: 0.35, 
        ease: [0.22, 1, 0.36, 1], // easeOutQuint-like curve for a native feel
      }}
    >
      {children}
    </motion.div>
  );
}
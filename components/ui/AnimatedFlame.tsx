"use client";

import { motion } from "framer-motion";
import { Flame } from "@/components/icons/lucide";

interface AnimatedFlameProps {
  size?: number;
}

export function AnimatedFlame({ size = 24 }: AnimatedFlameProps) {
  return (
    <motion.span
      animate={{
        scale: [1, 1.2, 0.95, 1.1, 1],
        rotate: [-5, 5, -3, 3, 0],
      }}
      transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      style={{ display: "inline-block", lineHeight: 1 }}
    >
      <Flame style={{ width: size, height: size }} className="text-orange-500" />
    </motion.span>
  );
}
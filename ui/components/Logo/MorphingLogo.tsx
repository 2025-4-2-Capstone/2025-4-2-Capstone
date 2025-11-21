"use client";

import { motion } from "framer-motion";
import { useState } from "react";

export default function MorphingLogo() {
  const letters = "Operation Log".split("");
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      className="relative flex items-center justify-center scale-125 animate-float"
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      animate={{
        rotateX: hovered ? 10 : 0,
        rotateY: hovered ? 10 : 0,
        scale: hovered ? 1.15 : 1,
      }}
      transition={{ type: "spring", stiffness: 150, damping: 10 }}
    >
      {letters.map((letter, i) => (
        <motion.span
          key={i}
          initial={{
            opacity: 0,
            x: (Math.random() - 0.5) * 300,
            y: (Math.random() - 0.5) * 300,
            rotate: Math.random() * 360,
            scale: 2.2,
          }}
          animate={{
            opacity: 1,
            x: 0,
            y: 0,
            rotate: 0,
            scale: 1,
          }}
          transition={{
            duration: 1.3,
            ease: "easeOut",
            delay: i * 0.05,
          }}
          className={`
            text-5xl font-extrabold tracking-wide
            bg-gradient-to-r from-indigo-500 to-blue-400
            text-transparent bg-clip-text
            animate-glow-pulse
            inline-block
          `}
        >
          {letter === " " ? "\u00A0" : letter}
        </motion.span>
      ))}
    </motion.div>
  );
}

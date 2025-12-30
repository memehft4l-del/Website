"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface AnimatedCounterProps {
  value: string; // e.g., "150 SOL"
  className?: string;
}

export function AnimatedCounter({ value, className = "" }: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState("0");

  useEffect(() => {
    // Extract number from value (e.g., "150 SOL" -> 150)
    const numMatch = value.match(/(\d+)/);
    if (!numMatch) {
      setDisplayValue(value);
      return;
    }

    const targetNum = parseInt(numMatch[1]);
    const suffix = value.replace(numMatch[0], "").trim();

    let current = 0;
    const duration = 2000; // 2 seconds
    const steps = 60;
    const increment = targetNum / steps;
    const stepDuration = duration / steps;

    const timer = setInterval(() => {
      current += increment;
      if (current >= targetNum) {
        current = targetNum;
        clearInterval(timer);
      }
      setDisplayValue(`${Math.floor(current)}${suffix ? ` ${suffix}` : ""}`);
    }, stepDuration);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <motion.span
      className={className}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {displayValue}
    </motion.span>
  );
}



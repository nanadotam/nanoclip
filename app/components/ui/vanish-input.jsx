"use client";
import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const VanishInput = ({
  value,
  onChange,
  placeholder = "Enter password...",
  type = "password",
  className,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const inputRef = useRef(null);

  useEffect(() => {
    if (isFocused && inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setCursorPosition({ x: rect.left, y: rect.top });
    }
  }, [isFocused]);

  return (
    <div className="relative">
      <motion.div
        initial={false}
        animate={{
          height: isFocused ? "48px" : "40px",
          width: isFocused ? "100%" : "180px",
        }}
        className={cn(
          "relative bg-gradient-to-b from-neutral-50 to-neutral-100 dark:from-neutral-800 dark:to-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-1",
          className
        )}
      >
        <div className="relative h-full w-full">
          <input
            ref={inputRef}
            className="h-full w-full bg-transparent text-neutral-900 dark:text-neutral-100 px-3 py-1 outline-none"
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            value={value}
            onChange={onChange}
            type={type}
            placeholder={placeholder}
          />
          <div className="absolute inset-0 flex items-center justify-end pr-2">
            {isFocused && (
              <motion.div
                layoutId="cursor"
                transition={{
                  type: "spring",
                  bounce: 0.2,
                  duration: 0.6,
                }}
                className="h-5 w-0.5 bg-neutral-900 dark:bg-neutral-100"
              />
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}; 
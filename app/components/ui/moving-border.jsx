"use client";
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function MovingBorderButton({
  children,
  containerClassName,
  className,
  ...otherProps
}) {
  return (
    <div
      className={cn(
        "group relative rounded-xl",
        containerClassName
      )}
      {...otherProps}
    >
      <motion.div
        className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 opacity-75 blur-sm group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"
        style={{
          backgroundSize: "200% 200%",
        }}
        animate={{
          backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          repeatType: "mirror",
        }}
      />
      <div
        className={cn(
          "relative rounded-xl bg-slate-900/90 px-6 py-8 text-white backdrop-blur-xl",
          className
        )}
      >
        {children}
      </div>
    </div>
  );
} 
"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export function PlaceholdersAndVanishInput({
  placeholders,
  onSubmit,
  animationDuration = 800,
  particleSpeed = 12
}) {
  const [currentPlaceholder, setCurrentPlaceholder] = useState(0);
  const [value, setValue] = useState("");
  const [animating, setAnimating] = useState(false);
  
  const intervalRef = useRef(null);
  const canvasRef = useRef(null);
  const newDataRef = useRef([]);
  const inputRef = useRef(null);

  // Placeholder rotation logic
  const startAnimation = () => {
    intervalRef.current = setInterval(() => {
      setCurrentPlaceholder((prev) => (prev + 1) % placeholders.length);
    }, 3000);
  };

  useEffect(() => {
    startAnimation();
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [placeholders]);

  // Canvas drawing and animation logic
  const draw = useCallback(() => {
    if (!inputRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    
    canvas.width = 800;
    canvas.height = 800;
    ctx.clearRect(0, 0, 800, 800);
    
    const computedStyles = getComputedStyle(inputRef.current);
    ctx.font = `${parseFloat(computedStyles.fontSize) * 2}px ${computedStyles.fontFamily}`;
    ctx.fillStyle = "#FFF";
    ctx.fillText(value, 16, 40);

    const imageData = ctx.getImageData(0, 0, 800, 800);
    const newData = [];

    for (let y = 0; y < 800; y++) {
      for (let x = 0; x < 800; x++) {
        const i = (y * 800 + x) * 4;
        if (imageData.data[i] > 0) {
          newData.push({
            x,
            y,
            r: 1,
            color: `rgba(${imageData.data[i]}, ${imageData.data[i + 1]}, ${imageData.data[i + 2]}, ${imageData.data[i + 3]})`,
          });
        }
      }
    }

    newDataRef.current = newData;
  }, [value]);

  useEffect(() => {
    draw();
  }, [value, draw]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAnimating(true);
    draw();
    
    if (value) {
      const maxX = Math.max(...newDataRef.current.map(p => p.x));
      animate(maxX);
      
      // Wait for animation to complete before submitting
      await new Promise(resolve => setTimeout(resolve, animationDuration));
      onSubmit && onSubmit(value);
    }
  };

  const animate = (startX) => {
    const startTime = Date.now();
    
    const animateFrame = (pos) => {
      if (!canvasRef.current) return;
      const ctx = canvasRef.current.getContext("2d");
      ctx.clearRect(pos, 0, 800, 800);

      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / animationDuration, 1);

      newDataRef.current = newDataRef.current
        .filter(particle => {
          if (particle.x < pos) return true;
          particle.x += (Math.random() - 0.5) * 3 * progress * 2;
          particle.y += (Math.random() - 0.5) * 3 * progress * 2;
          particle.r -= 0.08 * progress;
          return particle.r > 0;
        })
        .map(particle => {
          ctx.beginPath();
          ctx.rect(particle.x, particle.y, particle.r, particle.r);
          ctx.fillStyle = particle.color;
          ctx.fill();
          return particle;
        });

      if (newDataRef.current.length > 0 && elapsed < animationDuration) {
        requestAnimationFrame(() => animateFrame(pos - particleSpeed));
      } else {
        setValue("");
        setAnimating(false);
      }
    };

    requestAnimationFrame(() => animateFrame(startX));
  };

  return (
    <form className="w-full relative max-w-xl mx-auto" onSubmit={handleSubmit}>
      <canvas
        ref={canvasRef}
        className={cn(
          "absolute pointer-events-none text-base transform scale-50 top-[20%] left-2 origin-top-left filter invert dark:invert-0",
          animating ? "opacity-100" : "opacity-0"
        )}
      />
      <input
        ref={inputRef}
        type="password"
        value={value}
        onChange={(e) => {
          if (!animating) {
            setValue(e.target.value);
          }
        }}
        className={cn(
          "w-full text-base bg-white/5 border border-neutral-200 dark:border-neutral-800 px-4 py-2 rounded-lg",
          animating && "text-transparent"
        )}
      />
      <AnimatePresence mode="wait">
        {!value && (
          <motion.p
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="absolute inset-0 flex items-center px-4 pointer-events-none text-neutral-500"
          >
            {placeholders[currentPlaceholder]}
          </motion.p>
        )}
      </AnimatePresence>
    </form>
  );
} 
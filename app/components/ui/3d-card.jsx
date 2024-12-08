import { cn } from "@/lib/utils";
import { motion, useMotionTemplate, useMotionValue, AnimatePresence } from "framer-motion";

export function ThreeDCard({
  children,
  className,
  rotationIntensity = 5,
  showGradient = true,
}) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const scale = useMotionValue(1);

  function handleMouseMove(event) {
    const { clientX, clientY, currentTarget } = event;
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    const xRotation = ((clientX - left) / width - 0.5) * rotationIntensity;
    const yRotation = ((clientY - top) / height - 0.5) * rotationIntensity;

    mouseX.set(xRotation);
    mouseY.set(yRotation);
    scale.set(1.05);
  }

  function handleMouseLeave() {
    mouseX.set(0);
    mouseY.set(0);
    scale.set(1);
  }

  return (
    <motion.div
      className={cn(
        "relative h-full w-full rounded-xl transition-all duration-200 ease-linear",
        className
      )}
      style={{
        perspective: "1200px",
        transformStyle: "preserve-3d",
        scale,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ z: 10 }}
    >
      <motion.div
        style={{
          rotateX: useMotionTemplate`${mouseY}deg`,
          rotateY: useMotionTemplate`${mouseX}deg`,
        }}
        className="relative h-full w-full rounded-xl bg-background"
        transition={{
          rotateX: { duration: 0.2 },
          rotateY: { duration: 0.2 },
        }}
      >
        <motion.div
          className="relative z-10"
          style={{
            transform: "translateZ(20px)",
          }}
        >
          {children}
        </motion.div>
      </motion.div>
    </motion.div>
  );
} 
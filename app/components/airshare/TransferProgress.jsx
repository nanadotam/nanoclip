import { motion } from 'framer-motion';

export function TransferProgress({ progress, fileName }) {
  const circumference = 2 * Math.PI * 18;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative">
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <svg className="w-16 h-16" viewBox="0 0 40 40">
          <motion.circle
            className="text-primary"
            strokeWidth="4"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r="18"
            cx="20"
            cy="20"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-sm font-semibold">{Math.round(progress)}%</span>
          <span className="text-xs text-muted-foreground truncate max-w-[80px]">
            {fileName}
          </span>
        </div>
      </motion.div>
    </div>
  );
} 
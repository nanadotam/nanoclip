// HOME PAGE

"use client";

import { motion } from 'framer-motion';
import Download from "./components/home/Download";
import Upload from "./components/home/Upload";
import TestConnection from '@/components/TestConnection';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3,
      delayChildren: 0.6,
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: [0.65, 0, 0.35, 1]
    }
  }
};

export default function Home() {
  return (
    <motion.div 
      className="min-h-screen w-full flex flex-col justify-center items-center px-4 py-8 md:py-12"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.h1 
        className="font-weight-900 font-mona-sans text-3xl sm:text-4xl md:text-6xl lg:text-[6rem] tracking-tight text-center mb-6 md:mb-12"
        variants={itemVariants}
      >
        Copy. Paste. Get.
      </motion.h1>
      <motion.div 
        className="w-full max-w-[80rem] flex flex-col md:flex-row justify-center items-center gap-4 md:gap-8 px-4"
        variants={itemVariants}
      >
        <Upload />
        <Download />
      </motion.div>
      <TestConnection />
    </motion.div>
  );
}

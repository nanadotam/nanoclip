// HOME PAGE

"use client";

import { motion } from 'framer-motion';
import Download from "./components/home/Download";
import Upload from "./components/home/Upload";
import AirShare from "./components/home/AirShare";
// import TestConnection from '@/components/TestConnection';
import { FlipWords } from "@/components/ui/flip-words";
import Onboarding from "./components/home/Onboarding";
import { MagicCard } from "@/components/ui/magic-card"

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

const backgroundElementVariants = {
  animate: {
    scale: [1, 1.1, 1],
    opacity: [0.1, 0.2, 0.1],
    transition: {
      duration: 8,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

export default function Home() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <Onboarding />
      <motion.div 
        className="absolute top-[-20%] left-[-10%] w-[40rem] h-[40rem] rounded-full bg-blue-500/5 blur-3xl"
        variants={backgroundElementVariants}
        animate="animate"
      />
      <motion.div 
        className="absolute bottom-[-20%] right-[-10%] w-[35rem] h-[35rem] rounded-full bg-purple-500/5 blur-3xl"
        variants={backgroundElementVariants}
        animate="animate"
      />
      <motion.div 
        className="absolute top-[30%] right-[20%] w-[25rem] h-[25rem] rounded-full bg-cyan-500/5 blur-3xl"
        variants={backgroundElementVariants}
        animate="animate"
      />
      
      <motion.div 
        className="relative min-h-screen w-full flex flex-col justify-center items-center px-4 py-8 md:py-12"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1 
          className="font-weight-500 font-mona-sans text-3xl sm:text-4xl md:text-6xl lg:text-[6rem] tracking-tight text-center mb-6 md:mb-12"
          variants={itemVariants}
        >
          <FlipWords
            words={["Copy.", "Paste.", "Get.", "Share."]}
            duration={1200}
            delay={800}
            className="text-blue-500 font-medium"
          />
        </motion.h1>
        <motion.div 
          className="w-full md:hidden flex flex-col gap-4"
          variants={itemVariants}
        >
          <Upload />
          <Download />
          <AirShare />
        </motion.div>
        <motion.div 
          className="hidden md:flex justify-center gap-4 w-full max-w-[90rem]"
          variants={itemVariants}
        >
          <MagicCard 
            className="w-[30rem] h-[30rem] bg-transparent border-none shadow-none"
            onClick={() => {}}
          >
            <Upload />
          </MagicCard>
          <MagicCard 
            className="w-[30rem] h-[30rem] bg-transparent border-none shadow-none"
            onClick={() => {}}
          >
            <Download />
          </MagicCard>
          <MagicCard 
            className="w-[30rem] h-[30rem] bg-transparent border-none shadow-none"
            onClick={() => {}}
          >
            <AirShare />
          </MagicCard>
        </motion.div>
        {/* <TestConnection /> */}
      </motion.div>
    </div>
  );
}

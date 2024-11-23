"use client";

import React from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import UploadIcon from '../icons/Upload'

export default function Upload() {
  const router = useRouter()

  return (
    <motion.div 
      onClick={() => router.push('/upload')}
      className='w-full md:w-[30rem] h-[20rem] md:h-[30rem] bg-secondary border rounded-[16px] md:rounded-[24px] flex flex-col justify-center items-center gap-4 md:gap-6 relative overflow-hidden group cursor-pointer'
      whileHover={{ 
        scale: 1.02,
        borderRadius: "24px",
      }}
      transition={{ 
        duration: 0.3,
        ease: [0.65, 0, 0.35, 1],
        borderRadius: {
          duration: 0.2,
        }
      }}
    >
      <motion.div
        className="absolute inset-0 bg-secondary/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        initial={false}
      />
      <motion.div
        className="relative z-10 flex flex-col items-center gap-6"
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.2 }}
      >
        <UploadIcon className="text-foreground w-16 h-16 transition-transform duration-300 group-hover:scale-110" />
        <p className='bg-transparent text-foreground text-lg font-medium transition-all duration-300 group-hover:font-semibold'>
          Upload
        </p>
      </motion.div>
    </motion.div>
  )
}
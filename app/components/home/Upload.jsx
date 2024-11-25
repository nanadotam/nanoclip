"use client";

import React from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import UploadIcon from '../icons/Upload'

export default function Upload() {
  const router = useRouter()

  return (
    <div 
      className="w-full md:w-[30rem] h-[20rem] md:h-[30rem] bg-secondary/50 backdrop-blur-sm border rounded-[16px] md:rounded-[24px] flex flex-col justify-center items-center gap-4 md:gap-6 relative overflow-hidden group cursor-pointer hover:bg-secondary/60 transition-colors"
      onClick={() => router.push('/upload')}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
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

      <div className="pointer-events-none absolute inset-0 h-full bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
    </div>
  )
}
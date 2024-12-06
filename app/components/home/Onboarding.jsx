"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ArrowRight, ClipboardIcon, Share2, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Cookies from 'js-cookie'

const steps = [
  {
    title: "Create a Clip",
    description: "Choose a custom URL for your clip",
    Icon: ClipboardIcon,
    animation: (
      <motion.div
        className="w-full h-32 bg-secondary/50 rounded-lg flex items-center justify-center"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
      >
        <motion.div
          className="w-3/4 bg-background rounded border border-border p-3 overflow-hidden flex items-center gap-2 text-muted-foreground"
        >
          <span>nanoclip.vercel.app/clips/</span>
          <motion.span
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="text-primary"
          >
            my-clip
          </motion.span>
        </motion.div>
      </motion.div>
    )
  },
  {
    title: "Add Content",
    description: "Upload files or paste text",
    Icon: Upload,
    animation: (
      <motion.div
        className="w-full h-32 bg-secondary/50 rounded-lg flex items-center justify-center"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
      >
        <motion.div
          className="w-48 h-24 border-2 border-dashed border-primary/50 rounded-lg flex flex-col items-center justify-center gap-2"
          animate={{
            scale: [1, 1.05, 1],
            borderColor: ['rgb(var(--primary)/0.3)', 'rgb(var(--primary))'],
          }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <Upload className="w-8 h-8 text-primary" />
          <span className="text-sm text-muted-foreground">Drop files here</span>
        </motion.div>
      </motion.div>
    )
  },
  {
    title: "Share Instantly",
    description: "Share your clip URL with anyone",
    Icon: Share2,
    animation: (
      <motion.div
        className="w-full h-32 bg-secondary/50 rounded-lg flex items-center justify-center"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
      >
        <motion.div
          className="flex items-center gap-4"
          animate={{
            x: [0, 20, 0],
          }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <Share2 className="w-8 h-8 text-primary" />
          <motion.div
            className="flex items-center gap-2 text-muted-foreground bg-background rounded border border-border p-2"
          >
            <span>nanoclip.vercel.app/clips/</span>
            <motion.span
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="text-primary"
            >
              my-clip
            </motion.span>
          </motion.div>
        </motion.div>
      </motion.div>
    )
  }
]

export default function Onboarding() {
  const [isVisible, setIsVisible] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    const hasSeenOnboarding = Cookies.get('hasSeenOnboarding')
    if (!hasSeenOnboarding) {
      setIsVisible(true)
      Cookies.set('hasSeenOnboarding', 'true', { expires: 365 })
    }
  }, [])

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      setIsVisible(false)
    }
  }

  const handleSkip = () => {
    setIsVisible(false)
  }

  if (!isVisible) return null

  const currentStepData = steps[currentStep]
  const StepIcon = currentStepData.Icon

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Card className="w-full max-w-lg mx-4">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Welcome to NanoClip</h2>
            <Button variant="ghost" size="icon" onClick={handleSkip}>
              <X className="w-4 h-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {currentStepData.animation}
              
              <div className="space-y-2">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <StepIcon className="w-5 h-5" />
                  {currentStepData.title}
                </h3>
                <p className="text-muted-foreground">
                  {currentStepData.description}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-between items-center mt-8">
            <Button variant="ghost" onClick={handleSkip}>
              Skip
            </Button>
            <div className="flex items-center gap-2">
              {steps.map((_, index) => (
                <motion.div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === currentStep ? 'bg-primary' : 'bg-muted'
                  }`}
                  animate={index === currentStep ? {
                    scale: [1, 1.2, 1],
                  } : {}}
                  transition={{ repeat: Infinity, duration: 2 }}
                />
              ))}
            </div>
            <Button onClick={handleNext}>
              {currentStep === steps.length - 1 ? (
                'Get Started'
              ) : (
                <>
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  )
} 
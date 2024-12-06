'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link, FileUp, Globe, Smartphone } from 'lucide-react'
import { useTheme } from 'next-themes'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function HowItWorks() {
  const { theme, setTheme } = useTheme()
  const [activeStep, setActiveStep] = useState('create')

  useEffect(() => {
    setActiveStep('create')
  }, [])

  const steps = [
    {
      id: 'create',
      icon: Link,
      title: 'Create a Clip',
      description: 'Go to nanoclip.vercel.app/clips/your-clip-name to create a new clip. Choose any name you like!',
      example: 'https://nanoclip.vercel.app/clips/your-clip-name',
    },
    {
      id: 'add',
      icon: FileUp,
      title: 'Add Content',
      description: 'Upload files, paste text, or add any content you want to share or access later.',
      example: 'Upload files or paste text here',
    },
    {
      id: 'access',
      icon: Globe,
      title: 'Access Anywhere',
      description: 'Visit the same URL from any device to view or edit your clip.',
      example: 'Access from any device',
    },
    {
      id: 'share',
      icon: Smartphone,
      title: 'Share Easily',
      description: 'Share the clip URL with others for quick and easy content sharing.',
      example: 'https://nanoclip.vercel.app/clips/your-clip-name',
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3,
      }
    }
  }

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
  }

  return (
    <motion.div
      className="container mx-auto px-4 py-12"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div 
        className="flex justify-between items-center mb-12"
        variants={itemVariants}
      >
        <h1 className="text-4xl font-bold tracking-tight">How NanoClip Works</h1>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Tabs value={activeStep} onValueChange={setActiveStep} className="mb-12">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 gap-2 p-1">
            {steps.map((step) => (
              <TabsTrigger 
                key={step.id} 
                value={step.id} 
                className="relative px-4 py-3 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all duration-200"
              >
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-center gap-3"
                >
                  <step.icon className="w-5 h-5" />
                  <span className="font-medium">{step.title}</span>
                </motion.div>
              </TabsTrigger>
            ))}
          </TabsList>
          
          {steps.map((step) => (
            <TabsContent 
              key={step.id} 
              value={step.id}
              className="mt-6"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.65, 0, 0.35, 1] }}
              >
                <Card>
                  <CardHeader className="space-y-4">
                    <CardTitle className="flex items-center gap-4 text-2xl">
                      <step.icon className="w-8 h-8" />
                      {step.title}
                    </CardTitle>
                    <CardDescription className="text-lg">
                      {step.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-muted p-6 rounded-lg overflow-x-auto text-sm">
                      <code>{step.example}</code>
                    </pre>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          ))}
        </Tabs>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Additional Features</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-6 space-y-3 text-muted-foreground">
              <motion.li
                whileHover={{ x: 5 }}
                transition={{ duration: 0.2 }}
              >
                Access clips by simply going to nanoclip.vercel.app/clips/clipname
              </motion.li>
              <motion.li
                whileHover={{ x: 5 }}
                transition={{ duration: 0.2 }}
              >
                Upload any type of file, including text files
              </motion.li>
              <motion.li
                whileHover={{ x: 5 }}
                transition={{ duration: 0.2 }}
              >
                Set optional expiration dates for temporary clips
              </motion.li>
              <motion.li
                whileHover={{ x: 5 }}
                transition={{ duration: 0.2 }}
              >
                Secure your clips with optional password protection
              </motion.li>
            </ul>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}

'use client'

import { motion } from 'framer-motion'
import { Github, Linkedin, Globe } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function Contact() {
  const contacts = [
    { 
      icon: Github, 
      title: 'GitHub', 
      description: 'Check out my open-source projects and contributions', 
      href: 'https://github.com/nanadotam' 
    },
    { 
      icon: Linkedin, 
      title: 'LinkedIn', 
      description: 'Connect with me professionally', 
      href: 'https://www.linkedin.com/in/your-linkedin-profile' 
    },
    { 
      icon: Globe, 
      title: 'Portfolio', 
      description: 'Explore my personal portfolio and projects', 
      href: 'https://your-portfolio-url.com' 
    },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.h1 
        className="text-4xl font-bold mb-8 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        Get in Touch
      </motion.h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contacts.map((contact, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            <Card className="h-full">
              <CardHeader>
                <contact.icon className="w-12 h-12 mb-4 text-primary" />
                <CardTitle>{contact.title}</CardTitle>
                <CardDescription>{contact.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <a href={contact.href} target="_blank" rel="noopener noreferrer">
                    Visit {contact.title}
                  </a>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
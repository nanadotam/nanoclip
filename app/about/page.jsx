"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Clipboard, Share2, Image, File } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function About() {
  const [hoveredFeature, setHoveredFeature] = useState(null);

  const features = [
    {
      icon: Clipboard,
      title: "Universal Clipboard",
      description: "Copy and paste across all your devices",
    },
    {
      icon: Share2,
      title: "Instant Sharing",
      description: "Share content with anyone, anywhere",
    },
    {
      icon: Image,
      title: "Image Support",
      description: "Easily share images and screenshots",
    },
    {
      icon: File,
      title: "File Transfer",
      description: "Send files securely and quickly",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.section
        className="text-center mb-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-4xl font-bold mb-4">NanoClip</h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          A versatile, web-based universal clipboard for seamless sharing.
        </p>
      </motion.section>

      <motion.section
        className="mb-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <h2 className="text-3xl font-bold mb-8 text-center">Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              onMouseEnter={() => setHoveredFeature(index)}
              onMouseLeave={() => setHoveredFeature(null)}
            >
              <Card>
                <CardHeader>
                  <feature.icon
                    className={`w-12 h-12 mb-4 transition-colors duration-300 ${
                      hoveredFeature === index
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                  />
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <motion.section
        id="learn-more"
        className="max-w-3xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>About NanoClip</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              NanoClip is inspired by cl1p.net, crafted for seamless, quick
              sharing of text, images, and files. With unique, user-generated
              URLs, NanoClip enables users to store, access, and share content
              effortlessly from any device.
            </p>
            <p>
              Ideal for on-the-go sharing and temporary storage, NanoClip
              supports a wide range of file types, making it a practical
              solution for users needing a universal clipboard accessible
              anywhere, anytime.
            </p>
          </CardContent>
        </Card>
      </motion.section>
    </div>
  );
}

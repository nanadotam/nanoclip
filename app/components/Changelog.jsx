"use client"

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Cookies from 'js-cookie';

const CURRENT_VERSION = '2.0.0';
const CHANGELOG = {
  version: '2.0.0',
  features: [
    'QR Code generation for easy clip sharing',
    '3D interactive cards with hover effects',
    'Mobile-friendly QR code viewer',
    'Enhanced success animations',
  ],
  improvements: [
    'Better mobile responsiveness',
    'Smoother animations',
    'Updated UI components',
  ],
};

export function Changelog() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const lastSeenVersion = Cookies.get('lastSeenVersion');
    if (lastSeenVersion !== CURRENT_VERSION) {
      setIsVisible(true);
      Cookies.set('lastSeenVersion', CURRENT_VERSION, { expires: 365 });
    }
  }, []);

  if (!isVisible) return null;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <Card className="w-full max-w-lg p-6">
        <h2 className="text-2xl font-bold mb-4">What's New in NanoClip {CHANGELOG.version}</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-primary">✨ New Features</h3>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              {CHANGELOG.features.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-primary">🚀 Improvements</h3>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              {CHANGELOG.improvements.map((improvement, index) => (
                <li key={index}>{improvement}</li>
              ))}
            </ul>
          </div>
        </div>
        <Button 
          className="mt-6 w-full"
          onClick={() => setIsVisible(false)}
        >
          Got it!
        </Button>
      </Card>
    </motion.div>
  );
} 
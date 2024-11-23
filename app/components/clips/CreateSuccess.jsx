"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function CreateSuccess({ clipSlug, onClose }) {
  const clipUrl = `nanoclip.com/clips/${clipSlug}`;
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Trigger confetti on component mount
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }, []);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(clipUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50 p-4"
    >
      <Card className="w-full max-w-lg p-6 space-y-6">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="space-y-4 text-center"
        >
          <div className="h-12 w-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto">
            <Check className="h-6 w-6" />
          </div>
          
          <h2 className="text-2xl font-bold">Clip Created Successfully!</h2>
          
          <p className="text-muted-foreground">
            Your clip is now available at:
          </p>

          <div className="relative">
            <code className="block w-full p-4 bg-muted rounded-lg font-mono text-sm break-all">
              {clipUrl}
            </code>
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2"
              onClick={copyToClipboard}
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </motion.div>

        <div className="flex justify-end gap-4">
          <Button onClick={onClose}>
            Close
          </Button>
        </div>
      </Card>
    </motion.div>
  );
} 
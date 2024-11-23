"use client";

import { useTheme } from "next-themes";
import { motion } from 'framer-motion';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useState, useEffect } from 'react';
import MDPreview from './MDPreview';

export default function ClipContent({ clipData }) {
  const [copied, setCopied] = useState(false);
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!clipData || !mounted) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(clipData.text_content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 md:py-8 max-w-5xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6 md:space-y-8"
      >
        {clipData.text_content && (
          <>
            <div className="flex justify-between items-center">
              <h1 className="text-2xl md:text-3xl font-bold">Clip Content</h1>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>

            <div data-color-mode={theme}>
              <Card className="p-4 md:p-6">
                <MDPreview content={clipData.text_content} />
              </Card>
            </div>
          </>
        )}

        {clipData.file_metadata && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Attached Files</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {JSON.parse(clipData.file_metadata).map((file, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="font-medium truncate">{file.original_name}</p>
                        <p className="text-sm text-muted-foreground">
                          ({(file.size / 1024).toFixed(2)} KB)
                        </p>
                      </div>
                      <Button 
                        size="sm"
                        onClick={() => window.open(`http://localhost:8000/api/clips?download=1&filename=${file.stored_name}`, '_blank')}
                      >
                        Download
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {!clipData.text_content && !clipData.file_metadata && (
          <Card className="p-6 text-center">
            <p className="text-muted-foreground">This clip has no content</p>
          </Card>
        )}
      </motion.div>
    </div>
  );
} 
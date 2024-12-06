"use client";

import { useTheme } from "next-themes";
import { motion } from 'framer-motion';
import { Copy, Check, Download, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useState, useEffect } from 'react';
import MDPreview from './MDPreview';
import Image from 'next/image';

const isImageFile = (filename) => {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'ico'];
  const extension = filename.split('.').pop().toLowerCase();
  return imageExtensions.includes(extension);
};

export default function ClipContent({ clipData }) {
  const [copied, setCopied] = useState(false);
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showPreview, setShowPreview] = useState({});

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

  const togglePreview = (fileIndex) => {
    setShowPreview(prev => ({
      ...prev,
      [fileIndex]: !prev[fileIndex]
    }));
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

        {clipData.file_metadata && clipData.file_metadata.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Attached Files</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {clipData.file_metadata.map((file, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="p-4 space-y-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="font-medium truncate">{file.original_name}</p>
                        <p className="text-sm text-muted-foreground">
                          ({(file.size / 1024).toFixed(2)} KB)
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {isImageFile(file.original_name) && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => togglePreview(index)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        <Button 
                          size="sm"
                          onClick={() => window.open(file.url, '_blank')}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {isImageFile(file.original_name) && showPreview[index] && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="relative aspect-video rounded-lg overflow-hidden"
                      >
                        <Image
                          src={file.url}
                          alt={file.original_name}
                          fill
                          className="object-contain"
                        />
                      </motion.div>
                    )}
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
} 
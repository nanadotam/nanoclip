"use client";

import { motion } from 'framer-motion';
import { Copy } from 'lucide-react';
import MDEditor from '@uiw/react-md-editor';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ClipContent({ clipData }) {
  if (!clipData) return null;

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 md:py-8 max-w-5xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6 md:space-y-8"
      >
        <div className="flex justify-between items-center">
          <h1 className="text-2xl md:text-3xl font-bold">Clip Content</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigator.clipboard.writeText(clipData.text)}
          >
            <Copy className="w-4 h-4" />
          </Button>
        </div>

        <Card className="p-4 md:p-6">
          <MDEditor.Markdown source={clipData.text} />
        </Card>

        {clipData.files && clipData.files.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Attached Files</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {clipData.files.map((file, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="font-medium truncate">{file.name}</p>
                        <p className="text-sm text-muted-foreground">
                          ({(file.size / 1024).toFixed(2)} KB)
                        </p>
                      </div>
                      <Button size="sm">Download</Button>
                    </div>
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
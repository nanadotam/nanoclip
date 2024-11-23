"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function UrlInput() {
  const [clipUrl, setClipUrl] = useState('');
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (clipUrl.trim()) {
      router.push(`/clips/${clipUrl.trim()}`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto"
    >
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <div className="flex-1 w-full flex flex-col sm:flex-row items-center gap-2">
            <span className="text-foreground whitespace-nowrap font-mono text-sm sm:text-base w-full sm:w-auto text-center sm:text-left">
              nanoclip.com/clips/
            </span>
            <div className="relative flex-1 w-full">
              <Input
                value={clipUrl}
                onChange={(e) => setClipUrl(e.target.value)}
                className="h-12 w-full"
                placeholder="my-clip"
              />
            </div>
          </div>
          <Button 
            type="submit" 
            className="h-12 px-6 w-full sm:w-auto"
            disabled={!clipUrl.trim()}
          >
            <span className="mr-2">Get Clip</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </form>
      
      <p className="text-sm text-muted-foreground mt-2 text-center">
        Enter your clip name to access its contents
      </p>
    </motion.div>
  );
} 
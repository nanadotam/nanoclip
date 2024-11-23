"use client";

import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function ErrorState({ message }) {
  const router = useRouter();

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="p-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <AlertCircle className="w-12 h-12 text-destructive" />
            <h1 className="text-2xl font-bold">Error</h1>
            <p className="text-muted-foreground">{message}</p>
            <Button onClick={() => router.push('/')}>
              Return Home
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
} 
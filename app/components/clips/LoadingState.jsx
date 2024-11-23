"use client";

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';

export default function LoadingState() {
  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-4"
      >
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <Card className="p-6">
          <div className="space-y-4">
            <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
            <div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
            <div className="h-4 w-2/3 bg-muted rounded animate-pulse" />
          </div>
        </Card>
      </motion.div>
    </div>
  );
} 
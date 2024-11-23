"use client";

import { motion } from 'framer-motion';
import { Link } from 'lucide-react';
import UrlInput from '@/components/download/UrlInput';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function DownloadPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8 md:space-y-12"
      >
        <div className="text-center space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Access Your Clip
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Enter your clip URL to access its contents. Protected clips will require a password.
          </p>
        </div>

        <UrlInput />

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link className="w-5 h-5" />
                Quick Access
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Simply enter your clip name after nanoclip.com/clips/ to access your content instantly
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link className="w-5 h-5" />
                Protected Clips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Protected clips will prompt for a password before showing content
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link className="w-5 h-5" />
                File Support
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Access text, images, and files from your clips
              </CardDescription>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
} 
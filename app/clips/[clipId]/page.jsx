"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Copy, Lock, FileText } from 'lucide-react';
import MDEditor from '@uiw/react-md-editor';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PasswordProtection from '@/components/clips/PasswordProtection';
import ClipContent from '@/components/clips/ClipContent';
import LoadingState from '@/components/clips/LoadingState';
import ErrorState from '@/components/clips/ErrorState';

export default function ClipPage() {
  const params = useParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isProtected, setIsProtected] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [clipData, setClipData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchClipData();
  }, [params.clipId]);

  const fetchClipData = async () => {
    try {
      setIsLoading(true);
      // This would be your API call to fetch clip data
      // For demo, we'll simulate with mock data
      const response = await mockFetchClip(params.clipId);
      
      setIsProtected(response.isProtected);
      if (!response.isProtected) {
        setClipData(response.content);
        setIsAuthenticated(true);
      }
    } catch (err) {
      setError('Clip not found');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordVerification = async (password) => {
    try {
      // This would be your API call to verify password
      const response = await mockVerifyPassword(params.clipId, password);
      setIsAuthenticated(true);
      setClipData(response.content);
    } catch (err) {
      return 'Incorrect password';
    }
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  if (isProtected && !isAuthenticated) {
    return <PasswordProtection onVerify={handlePasswordVerification} />;
  }

  return <ClipContent clipData={clipData} />;
}

// Mock API functions for demonstration
const mockFetchClip = async (clipId) => {
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
  
  if (clipId.startsWith('protected-')) {
    return {
      isProtected: true,
      clipId,
    };
  }

  return {
    isProtected: false,
    clipId,
    content: {
      text: '# Sample Clip\nThis is an unprotected clip.',
      files: [
        { name: 'document.pdf', size: 1024, type: 'pdf' },
        { name: 'image.jpg', size: 2048, type: 'image' },
      ]
    }
  };
};

const mockVerifyPassword = async (clipId, password) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  if (password !== 'demo123') {
    throw new Error('Invalid password');
  }

  return {
    content: {
      text: '# Protected Content\nThis is a password-protected clip.',
      files: [
        { name: 'secret.pdf', size: 1024, type: 'pdf' },
        { name: 'confidential.jpg', size: 2048, type: 'image' },
      ]
    }
  };
}; 
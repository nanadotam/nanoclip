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
import clipService from '@/lib/api/clipService';

export default function ClipPage() {
  const params = useParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isProtected, setIsProtected] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [clipData, setClipData] = useState(null);
  const [error, setError] = useState('');

  const fetchClip = async (password = null) => {
    try {
      setIsLoading(true);
      const response = await clipService.getClip(params.clipId, password);
      setClipData(response);
      setIsProtected(response.isProtected);
      if (!response.isProtected) {
        setIsAuthenticated(true);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClip();
  }, [params.clipId]);

  const handlePasswordVerification = async (password) => {
    try {
      const response = await clipService.getClip(params.clipId, password);
      setIsAuthenticated(true);
      setClipData(response);
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
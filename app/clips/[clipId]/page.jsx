"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import ClipContent from '@/components/clips/ClipContent';
import PasswordModal from '@/components/clips/PasswordModal';
import { Card } from '@/components/ui/card';

export default function ClipPage() {
  const params = useParams();
  const router = useRouter();
  const [clipData, setClipData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isProtected, setIsProtected] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const fetchClip = async (password = null) => {
    const headers = new Headers({
      'Content-Type': 'application/json'
    });
    
    if (password) {
      headers.append('X-Clip-Password', password);
    }

    try {
      const response = await fetch(`http://localhost:8000/api/clips?url_slug=${params.clipId}`, {
        headers
      });

      if (!response.ok) {
        throw new Error('Failed to fetch clip');
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Handle protected clips
      if (data.is_protected) {
        setIsProtected(true);
        if (!password) {
          setShowPasswordModal(true);
          setClipData(null);
          setIsLoading(false);
          return;
        }
      }

      setClipData(data);
      setIsProtected(false);
      setShowPasswordModal(false);
      setIsLoading(false);
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClip();
  }, [params.clipId]);

  const handlePasswordVerification = async (password) => {
    setIsLoading(true);
    try {
      await fetchClip(password);
      if (clipData && !clipData.is_protected) {
        return null;
      }
      return "Invalid password. Please try again.";
    } catch (err) {
      return "Failed to verify password. Please try again.";
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-6 text-center text-destructive">
          {error}
        </Card>
      </div>
    );
  }

  return (
    <>
      {isProtected && showPasswordModal && (
        <PasswordModal
          onVerify={handlePasswordVerification}
          onClose={() => router.push('/')}
        />
      )}

      <motion.div 
        className="container mx-auto px-4 py-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {isLoading ? (
          <Card className="p-6 text-center">
            Loading...
          </Card>
        ) : clipData ? (
          <ClipContent clipData={clipData} />
        ) : !isProtected && (
          <Card className="p-6 text-center text-muted-foreground">
            This clip has no content
          </Card>
        )}
      </motion.div>
    </>
  );
} 
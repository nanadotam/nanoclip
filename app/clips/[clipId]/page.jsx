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
  const [isViewOnce, setIsViewOnce] = useState(false);

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

      // If the clip is protected and we don't have a password
      if (data.is_protected && !password) {
        setIsProtected(true);
        setShowPasswordModal(true);
        setClipData(null);
        setIsLoading(false);
        return { success: false, isProtected: true };
      }

      // If we have content, it means password was correct
      if (data.text_content || data.file_metadata) {
        setClipData(data);
        setIsProtected(false);
        setShowPasswordModal(false);
        setIsViewOnce(data.is_view_once === 1);
        setIsLoading(false);
        return { success: true, data };
      }

      // If we provided a password but still got protected response
      if (password && data.is_protected) {
        return { success: false, wrongPassword: true };
      }

      setClipData(data);
      return { success: true, data };
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
      return { success: false, error: err.message };
    }
  };

  useEffect(() => {
    fetchClip();
  }, [params.clipId]);

  useEffect(() => {
    if (isViewOnce && clipData) {
      const timer = setTimeout(() => {
        router.push('/');
      }, 30000); // 30 seconds viewing time

      return () => clearTimeout(timer);
    }
  }, [isViewOnce, clipData]);

  const handlePasswordVerification = async (password) => {
    setIsLoading(true);
    try {
      const result = await fetchClip(password);
      if (!result.success) {
        if (result.wrongPassword) {
          return "Invalid password. Please try again.";
        }
        return "Failed to verify password. Please try again.";
      }
      return null;
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
          onClose={() => setShowPasswordModal(false)}
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
          <>
            <ClipContent clipData={clipData} />
            {isViewOnce && (
              <Card className="mt-4 p-4 bg-yellow-500/10 border-yellow-500">
                <p className="text-center text-sm">
                  This clip will be deleted after viewing. You have 30 seconds to view it.
                </p>
              </Card>
            )}
          </>
        ) : !isProtected && (
          <Card className="p-6 text-center text-muted-foreground">
            This clip has no content
          </Card>
        )}
      </motion.div>
    </>
  );
} 
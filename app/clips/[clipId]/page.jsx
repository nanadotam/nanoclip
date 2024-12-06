"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import ClipContent from '@/components/clips/ClipContent';
import PasswordModal from '@/components/clips/PasswordModal';
import { Card } from '@/components/ui/card';
import clipService from '@/lib/api/clipService';
import MetadataConfig from '@/components/MetadataConfig';

export default function ClipPage() {
  const params = useParams();
  const router = useRouter();
  const [clipData, setClipData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isProtected, setIsProtected] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const fetchClip = async (password = null) => {
    try {
      const result = await clipService.getClipBySlug(params.clipId, password);
      
      // Handle password protection
      if (result.isProtected) {
        setIsProtected(true);
        setShowPasswordModal(true);
        setClipData(null);
        return { success: false, isProtected: true };
      }

      setClipData(result);
      setIsProtected(false);
      setShowPasswordModal(false);
      return { success: true, data: result };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClip();
  }, [params.clipId]);

  const handlePasswordVerification = async (password) => {
    setIsLoading(true);
    try {
      const result = await fetchClip(password);
      if (!result.success) {
        return "Invalid password. Please try again.";
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
      <MetadataConfig
        title={`NanoClip - ${clipData?.content_type === 'file' ? 'File Share' : 'Text Share'}`}
        description={
          clipData?.isProtected 
            ? "This content is password protected"
            : clipData?.text_content?.substring(0, 160) || "Shared content via NanoClip"
        }
      />
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
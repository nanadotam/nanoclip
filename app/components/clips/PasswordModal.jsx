"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";
import { motion } from "framer-motion";
import { LockIcon, UnlockIcon } from "lucide-react";

export default function PasswordModal({ onVerify, onClose }) {
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);

  const handleVerify = async (password) => {
    setIsVerifying(true);
    setError('');
    setIsUnlocking(true);
    
    try {
      const result = await onVerify(password);
      if (result) {
        setError(result);
        setIsUnlocking(false);
      }
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <motion.div 
            className="flex items-center justify-center mb-4"
            animate={{ scale: isUnlocking ? 1.1 : 1 }}
            transition={{ duration: 0.2 }}
          >
            {isUnlocking ? (
              <UnlockIcon className="h-8 w-8 text-green-500" />
            ) : (
              <LockIcon className="h-8 w-8 text-blue-500" />
            )}
          </motion.div>
          <DialogTitle className="text-center">Password Protected Clip</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <PlaceholdersAndVanishInput
            placeholders={[
              "Enter the secret password...",
              "Type the magic words...",
              "What's the password?",
              "Unlock this clip..."
            ]}
            onSubmit={handleVerify}
            animationDuration={800}
            particleSpeed={12}
          />
          {error && (
            <motion.p 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-destructive text-center"
            >
              {error}
            </motion.p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 
"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Unlock, ShieldCheck, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const bulletPointAnimation = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 }
};

export default function PasswordModal({ onVerify, onClose }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isWrongPassword, setIsWrongPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setIsWrongPassword(false);

    try {
      const result = await onVerify(password);
      if (result) {
        setError(result);
        setIsWrongPassword(true);
        // Shake animation trigger
        const form = e.target;
        form.classList.add('shake');
        setTimeout(() => form.classList.remove('shake'), 500);
      } else {
        setIsSuccess(true);
        setTimeout(() => onClose(), 1500);
      }
    } catch (err) {
      setError(err.message);
      setIsWrongPassword(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <Card className={`w-full max-w-md p-6 transition-colors duration-300 ${
        isWrongPassword ? 'border-destructive' : isSuccess ? 'border-green-500' : ''
      }`}>
        <motion.div 
          className="text-center mb-6"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", duration: 0.5 }}
        >
          <motion.div
            animate={{
              rotate: isSuccess ? [0, 0, -10, 10, -10, 10, 0] : 0,
              scale: isSuccess ? [1, 1.2, 1] : 1,
            }}
            transition={{ duration: 0.5 }}
          >
            {isSuccess ? (
              <ShieldCheck className="w-12 h-12 mx-auto mb-4 text-green-500" />
            ) : (
              <Lock className="w-12 h-12 mx-auto mb-4 text-primary" />
            )}
          </motion.div>
          <motion.h2 
            className="text-2xl font-bold"
            animate={{ color: isSuccess ? '#22c55e' : isWrongPassword ? '#ef4444' : '#000' }}
          >
            {isSuccess ? 'Access Granted' : 'Password Protected'}
          </motion.h2>
          <AnimatePresence>
            {!isSuccess && (
              <motion.p
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={bulletPointAnimation}
                className="text-muted-foreground mt-2"
              >
                This clip is password protected. Please enter the password to view.
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        {!isSuccess && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={`transition-colors duration-300 ${
                  isWrongPassword ? 'border-destructive' : ''
                }`}
              />
              {isWrongPassword && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <AlertCircle className="w-5 h-5 text-destructive" />
                </motion.div>
              )}
            </div>
            
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-destructive text-sm"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1"
                disabled={isLoading}
              >
                {isLoading ? 'Verifying...' : 'Unlock'}
              </Button>
            </div>
          </form>
        )}
      </Card>
    </motion.div>
  );
} 
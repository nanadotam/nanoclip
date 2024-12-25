"use client";

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Laptop, Smartphone, Tablet, ArrowRight } from 'lucide-react';
import TransferProgress from './TransferProgress';

const deviceIcons = {
  laptop: Laptop,
  phone: Smartphone,
  tablet: Tablet,
};

export default function ReceivingView({ 
  senderDevice, 
  receiverDevice,
  transferProgress,
  onNameChange,
  connectionStatus,
  selectedFiles = []
}) {
  const SenderIcon = deviceIcons[senderDevice?.type] || Laptop;
  const ReceiverIcon = deviceIcons[receiverDevice?.type] || Laptop;

  return (
    <div className="container max-w-2xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Connection Status Card */}
        <Card className="p-6">
          <div className="flex flex-col items-center gap-6">
            <h2 className="text-2xl font-bold">Connected to Device</h2>
            
            <div className="w-full flex justify-center items-center gap-8">
              <motion.div 
                className="flex flex-col items-center gap-2"
                initial={{ x: -50 }}
                animate={{ x: 0 }}
              >
                <SenderIcon className="w-12 h-12 text-primary" />
                <span className="font-medium">{senderDevice?.name || 'Unknown Device'}</span>
              </motion.div>

              <ArrowRight className="w-6 h-6 text-muted-foreground" />

              <motion.div 
                className="flex flex-col items-center gap-2"
                initial={{ x: 50 }}
                animate={{ x: 0 }}
              >
                <ReceiverIcon className="w-12 h-12 text-primary" />
                <div className="flex items-center gap-2">
                  <span className="font-medium">{receiverDevice?.name}</span>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onNameChange(receiverDevice?.id)}
                  >
                    Edit
                  </Button>
                </div>
              </motion.div>
            </div>

            <div className="text-sm text-muted-foreground text-center">
              Status: {connectionStatus}
            </div>
          </div>
        </Card>

        {/* Transfer Progress Card */}
        {transferProgress > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Receiving Files</h3>
                  <Download className="w-5 h-5 text-primary animate-bounce" />
                </div>
                
                <TransferProgress progress={transferProgress} />
                
                {selectedFiles.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Files:</h4>
                    <ul className="space-y-1">
                      {selectedFiles.map((file, index) => (
                        <li key={index} className="text-sm text-muted-foreground">
                          {file.name} ({(file.size / 1024).toFixed(2)} KB)
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Background Animation */}
        <div className="fixed inset-0 -z-10 bg-gradient-to-br from-green-500/20 to-emerald-500/20 opacity-30" />
        <motion.div
          className="fixed inset-0 -z-20"
          animate={{
            background: [
              'radial-gradient(circle at center, rgba(120,198,119,0.2) 0%, transparent 50%)',
              'radial-gradient(circle at center, rgba(120,198,119,0.2) 30%, transparent 80%)',
              'radial-gradient(circle at center, rgba(120,198,119,0.2) 0%, transparent 50%)',
            ],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.div>
    </div>
  );
} 
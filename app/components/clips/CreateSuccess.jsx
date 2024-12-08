"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, ExternalLink, Plus, Download } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';

export default function CreateSuccess({ clipSlug, onClose, expiryDate }) {
  const clipUrl = `https://nanoclip.vercel.app/clips/${clipSlug}`;
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  useEffect(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }, []);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(clipUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const downloadQRCode = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const width = 1080;
    const height = 1400;
    
    canvas.width = width;
    canvas.height = height;

    // Draw solid background
    ctx.fillStyle = '#18181b';
    ctx.fillRect(0, 0, width, height);

    // Draw title
    ctx.font = 'bold 72px system-ui';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.fillText('NanoClip', width/2, 100);

    // Draw expiry date
    const formattedDate = expiryDate ? 
      format(new Date(expiryDate), 'M/d/yy ∙ h:mm a') : 
      'No expiration';
    ctx.font = '36px system-ui';
    ctx.fillText(`Expires: ${formattedDate}`, width/2, 160);

    // Draw QR code
    const qrImage = document.querySelector('img[alt="Clip QR Code"]');
    if (qrImage) {
      ctx.drawImage(qrImage, (width - 800)/2, 220, 800, 800);
    }

    // Draw link
    ctx.font = '32px monospace';
    ctx.fillStyle = '#71717a';
    ctx.fillText(clipUrl, width/2, height - 180);

    // Draw sharing message
    ctx.font = '48px system-ui';
    ctx.fillStyle = 'white';
    ctx.fillText('Someone shared a clip with you ✨', width/2, height - 100);

    // Download the image
    const link = document.createElement('a');
    link.download = 'nanoclip-qr.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50"
    >
      <Card className="w-full max-w-sm p-4 bg-background">
        <div className="text-center space-y-2 mb-4">
          <h2 className="text-xl font-bold">Clip Created Successfully!</h2>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full text-sm">
            <span>Expires: {expiryDate ? new Date(expiryDate).toLocaleDateString() : 'No expiration'}</span>
          </div>
        </div>

        <div className="aspect-square bg-white rounded-lg p-4 mb-4">
          <img 
            src={`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(clipUrl)}`}
            alt="Clip QR Code"
            className="w-full h-full object-contain"
          />
        </div>

        <code className="block w-full p-2 bg-muted rounded text-sm text-center break-all mb-4">
          {clipUrl}
        </code>

        <div className="flex gap-2 justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={downloadQRCode}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Download
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={copyToClipboard}
            className="flex items-center gap-2"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-green-600" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(clipUrl, '_blank')}
            className="flex items-center gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            Open
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/')}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            New
          </Button>
        </div>
      </Card>
    </motion.div>
  );
} 
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { QRCodeCard } from './QRCodeCard';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

export function DownloadableQRCard({ clipUrl, expiryDate }) {
  const formattedDate = expiryDate ? 
    format(new Date(expiryDate), 'M/d/yy ∙ h:mm a') : 
    'No expiration';

  const downloadQRCode = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const width = 1080;
    const height = 1400;
    
    canvas.width = width;
    canvas.height = height;

    // Draw gradient background
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#3b82f6'); // blue-500
    gradient.addColorStop(1, '#14b8a6'); // teal-500
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Draw NanoClip title
    ctx.font = 'bold 72px system-ui';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.fillText('NanoClip', width/2, 100);

    // Draw expiry date
    ctx.font = '36px system-ui';
    ctx.fillText(`Expires: ${formattedDate}`, width/2, 160);

    // Draw sharing message
    ctx.font = '48px system-ui';
    ctx.fillText('Someone shared a clip with you ❤️', width/2, height - 100);

    // Draw QR code
    const qrImage = document.querySelector('#qr-code-image');
    if (qrImage) {
      ctx.drawImage(qrImage, (width - 800)/2, 220, 800, 800);
    }

    // Draw link
    ctx.font = '32px monospace';
    ctx.fillText(clipUrl, width/2, height - 180);

    // Download the image
    const link = document.createElement('a');
    link.download = 'nanoclip-qr.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="space-y-4">
      <motion.div
        className="relative bg-background p-8 rounded-xl text-foreground text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold mb-2">NanoClip</h1>
        <p className="text-sm opacity-90 mb-6">{formattedDate}</p>
        
        <div className="bg-white rounded-xl p-6 mb-6">
          <QRCodeCard clipUrl={clipUrl} />
        </div>

        <p className="text-lg font-medium mb-4">{clipUrl}</p>
        <p className="text-xl">Someone shared a clip with you ✨</p>
      </motion.div>

      <Button 
        onClick={downloadQRCode} 
        className="w-full flex items-center justify-center gap-2"
      >
        <Download className="w-4 h-4" />
        Download QR Code
      </Button>
    </div>
  );
} 
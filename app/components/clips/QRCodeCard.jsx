import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { motion } from 'framer-motion';
import { ThreeDCard } from '@/components/ui/3d-card';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';

export function QRCodeCard({ clipUrl, expiryDate }) {
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const router = useRouter();

  useEffect(() => {
    generateQRCode();
  }, [clipUrl]);

  const generateQRCode = async () => {
    try {
      const url = await QRCode.toDataURL(clipUrl, {
        width: 1080,
        height: 1080,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      });
      setQrCodeUrl(url);
    } catch (err) {
      console.error('QR Code generation failed:', err);
    }
  };

  const downloadQRImage = async () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 1080;
    canvas.height = 1400;

    // Set solid background color
    ctx.fillStyle = '#18181b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add NanoClip title
    ctx.fillStyle = 'white';
    ctx.font = 'bold 72px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Clip Created Successfully!', canvas.width/2, 100);

    // Add expiry date
    const formattedDate = expiryDate ? 
      format(new Date(expiryDate), 'M/d/yy ∙ h:mm a') : 
      'No expiration';
    ctx.font = '36px system-ui';
    ctx.fillText(`Expires: ${formattedDate}`, canvas.width/2, 180);

    // Load and draw QR code
    const qrImage = new Image();
    qrImage.src = qrCodeUrl;
    await new Promise((resolve) => {
      qrImage.onload = () => {
        ctx.drawImage(qrImage, 140, 240, 800, 800);
        resolve();
      };
    });

    // Add clip URL
    ctx.font = '32px monospace';
    ctx.fillStyle = '#71717a'; // zinc-500
    ctx.fillText(clipUrl, canvas.width/2, 1200);

    // Download the image
    const link = document.createElement('a');
    link.download = 'nanoclip-qr.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const formattedDate = expiryDate ? 
    format(new Date(expiryDate), 'EEEE, d MMM, yyyy h:mm a') : 
    'No expiration';

  return (
    <div className="space-y-4 max-w-sm mx-auto">
      <Card className="p-4 relative overflow-hidden">
        <div className="text-center space-y-2 mb-4">
          <h2 className="text-xl font-bold">Clip Created Successfully!</h2>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full text-sm">
            <span>Expires: {formattedDate}</span>
          </div>
        </div>
        <motion.div 
          className="aspect-square bg-white rounded-lg p-4"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          {qrCodeUrl && (
            <motion.img 
              src={qrCodeUrl} 
              alt="Clip QR Code"
              className="w-full h-full object-contain"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            />
          )}
        </motion.div>
        <div className="mt-4 space-y-2">
          <code className="block w-full p-2 bg-muted rounded text-sm text-center break-all">
            {clipUrl}
          </code>
          <div>
            <Button 
              onClick={downloadQRImage}
              className="w-full"
              variant="outline"
            >
              <Download className="w-4 h-4 mr-2" />
              Download QR
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
} 
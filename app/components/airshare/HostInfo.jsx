import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Laptop, Smartphone, Tablet, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';

const deviceIcons = {
  laptop: Laptop,
  phone: Smartphone,
  tablet: Tablet,
};

export default function HostInfo({ deviceName, deviceType, onNameChange }) {
  const Icon = deviceIcons[deviceType] || Laptop;
  
  return (
    <Card className="p-4">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <Icon className="w-6 h-6 text-primary" />
          <div className="flex items-center gap-2">
            <span className="font-medium">{deviceName}</span>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={onNameChange}
            >
              <Pencil className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <span className="text-xs text-muted-foreground">Host</span>
      </motion.div>
    </Card>
  );
}

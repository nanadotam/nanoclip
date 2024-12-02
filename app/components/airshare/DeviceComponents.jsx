import { motion } from 'framer-motion';
import { Laptop, Smartphone, Tablet, Wifi, WifiOff } from 'lucide-react';
import { Card } from "@/components/ui/card";

export const getDeviceIcon = (type) => {
  switch (type) {
    case 'laptop':
      return <Laptop className="w-8 h-8" />;
    case 'phone':
      return <Smartphone className="w-8 h-8" />;
    case 'tablet':
      return <Tablet className="w-8 h-8" />;
    default:
      return null;
  }
};

export function DeviceDiscovery({ devices }) {
  return (
    <div className="relative h-64">
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="w-40 h-40 border-4 border-primary/20 rounded-full flex items-center justify-center"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <motion.div
            className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center"
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
          >
            <Wifi className="w-16 h-16 text-primary" />
          </motion.div>
        </motion.div>
      </div>
      
      {devices.map((device, index) => (
        <DeviceIcon key={device.id} device={device} index={index} total={devices.length} />
      ))}
    </div>
  );
} 
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Laptop } from 'lucide-react';

export default function DeviceList({ devices, onDeviceSelect }) {
  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-4">Nearby Devices</h3>
      <div className="space-y-2">
        {devices.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            No devices found nearby
          </p>
        ) : (
          devices.map((device) => (
            <motion.div
              key={device.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between p-3 hover:bg-secondary rounded-lg"
            >
              <div className="flex items-center gap-3">
                <Laptop className="w-5 h-5" />
                <span>{device.name}</span>
              </div>
              <Button
                size="sm"
                onClick={() => onDeviceSelect(device.id)}
              >
                Connect
              </Button>
            </motion.div>
          ))
        )}
      </div>
    </Card>
  );
} 
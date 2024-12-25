"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Laptop, Smartphone, Tablet, Pencil } from 'lucide-react';

const deviceIcons = {
  laptop: Laptop,
  phone: Smartphone,
  tablet: Tablet,
};

export default function DevicesList({ nearbyDevices = [], connectedDevices = [], onDeviceSelect, onNameChange }) {
  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-4">Devices</h3>
      <div className="space-y-4">
        <AnimatePresence mode="wait">
          {connectedDevices.length > 0 && (
            <motion.div
              key="connected-devices"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              <h4 className="text-sm text-muted-foreground">Connected</h4>
              {connectedDevices.map((device) => {
                const Icon = deviceIcons[device.type] || Laptop;
                return (
                  <motion.div
                    key={device.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5" />
                      <span>{device.name}</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => onNameChange(device.id)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {nearbyDevices.length > 0 && (
            <motion.div
              key="nearby-devices"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              <h4 className="text-sm text-muted-foreground">Nearby</h4>
              {nearbyDevices.map((device) => {
                const Icon = deviceIcons[device.type] || Laptop;
                return (
                  <motion.div
                    key={device.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-3 hover:bg-secondary rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5" />
                      <span>{device.name}</span>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => onDeviceSelect(device.id)}
                    >
                      Connect
                    </Button>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {nearbyDevices.length === 0 && connectedDevices.length === 0 && (
          <p className="text-muted-foreground text-center py-4">
            No devices found
          </p>
        )}
      </div>
    </Card>
  );
} 
"use client";

import { motion } from 'framer-motion';
import { Wifi } from 'lucide-react';
import { DeviceIcon } from './DeviceIcon';

const DeviceDiscovery = ({ devices, onShare }) => {
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
          <Wifi className="w-16 h-16 text-primary" />
        </motion.div>
      </div>
      
      {devices.map((device, index) => (
        <DeviceIcon 
          key={device.id} 
          device={device} 
          index={index} 
          total={devices.length} 
        />
      ))}

      <button
        className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white py-2 px-4 rounded"
        onClick={onShare}
      >
        Share Data
      </button>
    </div>
  );
};

export default DeviceDiscovery;
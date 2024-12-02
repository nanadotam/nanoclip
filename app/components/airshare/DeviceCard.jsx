"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Laptop, Smartphone, Tablet, Wifi, WifiOff } from 'lucide-react';

const getDeviceIcon = (type) => {
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

const DeviceCard = ({ device }) => {
  return (
    <motion.div
      className="bg-white rounded-lg shadow-md p-4 flex items-center space-x-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 100 }}
    >
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center ${device.online ? 'bg-indigo-100' : 'bg-gray-200'}`}
      >
        {getDeviceIcon(device.type)}
      </div>
      <div>
        <h3 className="font-semibold text-indigo-900">{device.name}</h3>
        <p className="text-sm text-indigo-600">
          {device.online ? (
            <span className="flex items-center">
              <Wifi className="w-4 h-4 mr-1" /> Online
            </span>
          ) : (
            <span className="flex items-center">
              <WifiOff className="w-4 h-4 mr-1" /> Offline
            </span>
          )}
        </p>
      </div>
    </motion.div>
  );
};

export default DeviceCard; 
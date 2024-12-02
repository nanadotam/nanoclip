'use client';
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion';
import { Laptop, Smartphone, Tablet, Wifi, WifiOff } from 'lucide-react'

const AirShare = () => {
  const [devices, setDevices] = useState([])
  const [shareCode, setShareCode] = useState('')

  useEffect(() => {
    // Simulating device discovery
    const discoveredDevices = [
      { id: '1', type: 'laptop', name: 'MacBook Pro', online: true },
      { id: '2', type: 'phone', name: 'iPhone 12', online: true },
      { id: '3', type: 'tablet', name: 'iPad Air', online: false },
    ]
    setDevices(discoveredDevices)

    // Generate a random 6-digit code
    setShareCode(Math.floor(100000 + Math.random() * 900000).toString())
  }, [])

  const getDeviceIcon = (type) => {
    switch (type) {
      case 'laptop':
        return <Laptop className="w-8 h-8" />;
      case 'phone':
        return <Smartphone className="w-8 h-8" />;
      case 'tablet':
        return <Tablet className="w-8 h-8" />;
      default:
        return null
    }
  }

  return (
    (<div
      className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-4xl">
        <h1 className="text-3xl font-bold text-center mb-8 text-indigo-900">AirShare</h1>
        
        {/* Share code display */}
        <div className="bg-indigo-900 rounded-lg p-4 mb-8 text-center">
          <p className="text-indigo-200 mb-2">Your share code:</p>
          <p className="text-4xl font-mono font-bold text-white tracking-widest">{shareCode}</p>
        </div>

        {/* Main sharing space */}
        <div className="relative h-64 mb-8">
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="w-40 h-40 border-4 border-indigo-200 rounded-full flex items-center justify-center">
              <div
                className="w-32 h-32 bg-indigo-100 rounded-full flex items-center justify-center">
                <Wifi className="w-16 h-16 text-indigo-500" />
              </div>
            </div>
          </div>
          {devices.map((device, index) => (
            <DeviceIcon key={device.id} device={device} index={index} total={devices.length} />
          ))}
        </div>

        {/* Nearby devices */}
        <h2 className="text-xl font-semibold mb-4 text-indigo-900">Nearby Devices</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {devices.map((device) => (
            <DeviceCard key={device.id} device={device} />
          ))}
        </div>
      </div>
    </div>)
  );
}

const DeviceIcon = ({ device, index, total }) => {
  const angle = (index / total) * Math.PI * 2 - Math.PI / 2
  const x = Math.cos(angle) * 100
  const y = Math.sin(angle) * 100

  return (
    (<motion.div
      className="absolute top-1/2 left-1/2"
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1, x, y }}
      transition={{ delay: index * 0.1, type: 'spring', stiffness: 100 }}>
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md ${device.online ? 'bg-white' : 'bg-gray-200'}`}>
        {getDeviceIcon(device.type)}
      </div>
    </motion.div>)
  );
}

const DeviceCard = ({ device }) => {
  return (
    (<motion.div
      className="bg-white rounded-lg shadow-md p-4 flex items-center space-x-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 100 }}>
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center ${device.online ? 'bg-indigo-100' : 'bg-gray-200'}`}>
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
      {device.progress !== undefined && (
        <div className="ml-auto">
          <CircularProgress progress={device.progress} />
        </div>
      )}
    </motion.div>)
  );
}

const CircularProgress = ({ progress }) => {
  const circumference = 2 * Math.PI * 18
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    (<div className="relative w-12 h-12">
      <svg className="w-full h-full" viewBox="0 0 40 40">
        <circle
          className="text-indigo-100"
          strokeWidth="4"
          stroke="currentColor"
          fill="transparent"
          r="18"
          cx="20"
          cy="20" />
        <circle
          className="text-indigo-500"
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r="18"
          cx="20"
          cy="20" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-semibold text-indigo-900">{progress}%</span>
      </div>
    </div>)
  );
}

export default AirShare


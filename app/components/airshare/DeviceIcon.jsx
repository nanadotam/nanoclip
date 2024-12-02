import { motion } from 'framer-motion';
import { getDeviceIcon } from './DeviceComponents';

export const DeviceIcon = ({ device, index, total }) => {
  const angle = (index / total) * Math.PI * 2 - Math.PI / 2;
  const x = Math.cos(angle) * 100;
  const y = Math.sin(angle) * 100;

  return (
    <motion.div
      className="absolute top-1/2 left-1/2"
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1, x, y }}
      transition={{ delay: index * 0.1, type: 'spring', stiffness: 100 }}
    >
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center ${
          device.online ? 'bg-white' : 'bg-gray-200'
        }`}
      >
        {getDeviceIcon(device.type)}
      </div>
    </motion.div>
  );
}; 
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Laptop, Smartphone, Tablet, Pencil, Check } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const deviceIcons = {
  laptop: Laptop,
  phone: Smartphone,
  tablet: Tablet,
};

export default function ConnectedDevice({ device, isReceiving, onNameChange }) {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(device.name);
  const Icon = deviceIcons[device.type] || Laptop;

  const handleNameSubmit = () => {
    if (newName.trim()) {
      onNameChange(newName.trim());
      setIsEditing(false);
    }
  };

  return (
    <Card className="p-4">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <Icon className="w-6 h-6 text-primary" />
          {isEditing ? (
            <div className="flex items-center gap-2">
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="h-8 w-48"
                autoFocus
              />
              <Button size="sm" onClick={handleNameSubmit}>
                <Check className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="font-medium">{device.name}</span>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setIsEditing(true)}
              >
                <Pencil className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
        {isReceiving && (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm text-muted-foreground">Receiving...</span>
          </div>
        )}
      </motion.div>
    </Card>
  );
} 
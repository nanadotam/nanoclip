import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export default function FileList({ files, onRemoveFile, transferProgress }) {
  return (
    <Card className="p-4">
      <h2 className="text-lg font-semibold mb-4">Selected Files</h2>
      <ul className="space-y-2">
        {files.map((file, index) => (
          <motion.li 
            key={index} 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-2 p-2 hover:bg-muted/50 rounded-lg"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-1 min-w-0">
                <span className="text-foreground font-medium truncate">
                  {file.name}
                </span>
                <span className="text-sm text-muted-foreground">
                  ({(file.size / 1024).toFixed(2)} KB)
                </span>
              </div>
              <Button 
                type="button"
                variant="ghost" 
                size="sm"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => onRemoveFile(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {transferProgress > 0 && (
              <div className="space-y-1">
                <Progress value={transferProgress} />
                <p className="text-xs text-muted-foreground text-right">
                  {Math.round(transferProgress)}%
                </p>
              </div>
            )}
          </motion.li>
        ))}
      </ul>
    </Card>
  );
} 
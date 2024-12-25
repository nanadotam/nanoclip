import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';

export default function TransferProgress({ progress }) {
  return (
    <Card className="p-4">
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Transferring...</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} />
      </div>
    </Card>
  );
} 
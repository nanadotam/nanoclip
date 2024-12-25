"use client";

import { Progress } from "@/components/ui/progress";

export default function TransferProgress({ progress }) {
  return (
    <div className="w-full space-y-2">
      <Progress value={progress} />
      <p className="text-sm text-muted-foreground text-center">
        {Math.round(progress)}%
      </p>
    </div>
  );
} 
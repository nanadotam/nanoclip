import * as React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

const Terminal = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <ScrollArea className="h-full w-full">
      <div
        ref={ref}
        className={`bg-black/95 text-gray-100 font-mono text-sm p-4 rounded-lg ${className}`}
        {...props}
      >
        <div className="space-y-2">
          {children}
        </div>
      </div>
    </ScrollArea>
  );
});

Terminal.displayName = 'Terminal';

export { Terminal }; 
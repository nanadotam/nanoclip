"use client";

import { Card } from "./ui/card";

export default function ErrorBoundary({
  error,
  reset,
}) {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="p-6">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-destructive">Something went wrong!</h2>
          <p className="text-muted-foreground">{error.message || "An unexpected error occurred"}</p>
          <button
            onClick={reset}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Try again
          </button>
        </div>
      </Card>
    </div>
  );
} 
"use client";

import ErrorBoundary from "@/components/ErrorBoundary";

export default function GlobalError({
  error,
  reset,
}) {
  return <ErrorBoundary error={error} reset={reset} />;
} 
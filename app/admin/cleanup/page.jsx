"use client";

import { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Terminal } from '@/components/ui/terminal';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CleanupPage() {
  const [logs, setLogs] = useState([]);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('idle');
  const terminalRef = useRef(null);
  const abortControllerRef = useRef(null);

  const addLog = (message, type = 'info') => {
    setLogs(prev => [...prev, { message, type, timestamp: new Date() }]);
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  };

  const handleCleanup = async () => {
    setStatus('running');
    setProgress(0);
    setLogs([]);
    
    try {
      abortControllerRef.current = new AbortController();
      const response = await fetch('/api/admin/cleanup', {
        method: 'POST',
        signal: abortControllerRef.current.signal
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        const text = decoder.decode(value);
        const updates = text.split('\n').filter(Boolean);
        
        for (const update of updates) {
          const { message, type, progress: currentProgress } = JSON.parse(update);
          addLog(message, type);
          if (currentProgress !== null) {
            setProgress(currentProgress);
          }
          if (type === 'error') {
            setStatus('error');
          } else if (currentProgress === 100) {
            setStatus('completed');
          }
        }
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        addLog('Cleanup cancelled by user', 'warning');
        setStatus('cancelled');
      } else {
        addLog(`Error: ${error.message}`, 'error');
        setStatus('error');
      }
    }
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Cleanup Management</h1>
          <div className="space-x-4">
            <Button 
              onClick={handleCleanup} 
              disabled={status === 'running'}
              variant={status === 'error' ? 'destructive' : 'default'}
            >
              {status === 'running' && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Start Cleanup
            </Button>
            {status === 'running' && (
              <Button 
                onClick={handleCancel}
                variant="outline"
              >
                Cancel
              </Button>
            )}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {status === 'running' && 'Cleanup in Progress'}
              {status === 'completed' && 'Cleanup Completed'}
              {status === 'error' && 'Cleanup Failed'}
              {status === 'cancelled' && 'Cleanup Cancelled'}
              {status === 'idle' && 'Ready to Clean'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {status !== 'idle' && (
              <div className="space-y-2">
                <Progress value={progress} className="w-full" />
                <p className="text-sm text-muted-foreground text-right">
                  {progress}% Complete
                </p>
              </div>
            )}
            
            <Terminal ref={terminalRef} className="h-[400px]">
              {logs.map((log, i) => (
                <div key={i} className={`flex items-start gap-2 text-sm ${
                  log.type === 'error' ? 'text-red-500' : 
                  log.type === 'success' ? 'text-green-500' : 
                  log.type === 'warning' ? 'text-yellow-500' :
                  'text-gray-300'
                }`}>
                  <span className="opacity-50">
                    {log.timestamp.toLocaleTimeString()}
                  </span>
                  {log.type === 'error' && <XCircle className="w-4 h-4" />}
                  {log.type === 'success' && <CheckCircle className="w-4 h-4" />}
                  {log.type === 'warning' && <AlertCircle className="w-4 h-4" />}
                  {log.type === 'info' && <AlertCircle className="w-4 h-4" />}
                  <span>{log.message}</span>
                </div>
              ))}
            </Terminal>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
} 

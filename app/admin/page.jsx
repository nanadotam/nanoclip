"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import LoadingState from '@/components/clips/LoadingState';
import { 
  Trash2, 
  Shield, 
  Activity, 
  Users, 
  Clock, 
  AlertTriangle, 
  Database, 
  FileType, 
  TrendingUp, 
  LogOut 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import TrendsChart from '@/components/admin/TrendsChart';

export default function AdminDashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalClips: 0,
    activeClips: 0,
    protectedClips: 0,
    expiredClips: 0,
    flaggedContent: 0,
    storage: {
      used: 0,
      limit: 5 * 1024,
      percentUsed: 0
    }
  });
  const [trends, setTrends] = useState(null);
  const [isCleaningUp, setIsCleaningUp] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const checkAuth = async () => {
      try {
        const authResponse = await fetch('/api/admin/auth');
        
        if (!authResponse.ok) {
          window.location.replace('/admin/login');
          return;
        }

        const authData = await authResponse.json();
        if (!authData.authenticated) {
          window.location.replace('/admin/login');
          return;
        }

        setIsLoading(false);
      } catch (err) {
        console.error('Auth check failed:', err);
        window.location.replace('/admin/login');
      }
    };

    checkAuth();
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;

    const fetchStats = async () => {
      try {
        // Fetch stats
        const statsResponse = await fetch('/api/admin/stats');
        if (!statsResponse.ok) {
          throw new Error('Failed to fetch stats');
        }
        
        const statsData = await statsResponse.json();
        setStats(statsData);

        // Fetch trends
        const trendsResponse = await fetch('/api/admin/trends');
        if (!trendsResponse.ok) {
          throw new Error('Failed to fetch trends');
        }
        const trendsData = await trendsResponse.json();
        setTrends(trendsData);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchStats();
  }, [mounted]);

  const handleCleanup = () => {
    router.push('/admin/cleanup');
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      // Force a hard redirect to the login page
      window.location.href = '/admin/login';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Don't render anything until mounted
  if (!mounted) return null;

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-6 text-center text-destructive">
          {error}
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <Button 
            variant="destructive" 
            onClick={handleLogout}
            className="flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Clip Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p>Total Clips: {stats.totalClips}</p>
                <p>Active Clips: {stats.activeClips}</p>
                <p>Protected Clips: {stats.protectedClips}</p>
                <p>Expired Clips: {stats.expiredClips}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button 
                  variant="destructive" 
                  className="w-full"
                  onClick={() => router.push('/admin/flagged-content')}
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Review Flagged Content ({stats.flaggedContent})
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => router.push('/admin/security-logs')}
                >
                  View Security Logs
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleCleanup}
                  disabled={isCleaningUp}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {isCleaningUp ? 'Cleaning...' : 'Run Cleanup'}
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => router.push('/admin/users')}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Manage Users
                </Button>
                <Button 
                  variant="destructive" 
                  className="w-full"
                  onClick={async () => {
                    try {
                      await fetch('/api/admin/logout', { method: 'POST' });
                      // Force a hard redirect to the login page
                      window.location.href = '/admin/login';
                      // Alternative: router.replace('/admin/login');
                    } catch (error) {
                      console.error('Logout failed:', error);
                    }
                  }}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Storage Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Used: {stats.storage?.used.toFixed(2)} MB</span>
                    <span>{stats.storage?.percentUsed}%</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full rounded-full transition-all",
                        {
                          "bg-success": stats.storage?.percentUsed < 70,
                          "bg-warning": stats.storage?.percentUsed >= 70 && stats.storage?.percentUsed < 90,
                          "bg-destructive": stats.storage?.percentUsed >= 90
                        }
                      )}
                      style={{ width: `${stats.storage?.percentUsed}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {stats.storage?.limit - stats.storage?.used.toFixed(2)} MB remaining of {stats.storage?.limit} MB
                  </p>
                </div>
                {stats.storage?.percentUsed >= 80 && (
                  <Alert variant="warning">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Storage Warning</AlertTitle>
                    <AlertDescription>
                      You are approaching your storage limit. Consider cleaning up old clips.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileType className="w-5 h-5" />
                File Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.fileDistribution?.map((item) => (
                  <div key={item.type} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="capitalize">{item.type}</span>
                      <span>{item.count} files ({item.percentage}%)</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          "h-full rounded-full transition-all",
                          {
                            "bg-blue-500": item.type === "image",
                            "bg-red-500": item.type === "video",
                            "bg-green-500": item.type === "application",
                            "bg-yellow-500": item.type === "text",
                            "bg-purple-500": item.type === "audio",
                          }
                        )}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <TrendsChart trends={trends} />
        </div>
      </motion.div>
    </div>
  );
} 
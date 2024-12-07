import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Clock } from 'lucide-react';

export default function CleanupSchedule({ onScheduleUpdate }) {
  const [schedule, setSchedule] = useState({
    interval: 30,
    enabled: true
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    try {
      const response = await fetch('/api/admin/cleanup-schedule');
      if (response.ok) {
        const data = await response.json();
        setSchedule(data);
      }
    } catch (error) {
      console.error('Failed to fetch schedule:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/cleanup-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(schedule)
      });
      if (response.ok) {
        onScheduleUpdate?.();
      }
    } catch (error) {
      console.error('Failed to update schedule:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Cleanup Schedule
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center justify-between">
            <label>Auto Cleanup</label>
            <Switch 
              checked={schedule.enabled}
              onCheckedChange={(checked) => setSchedule(s => ({ ...s, enabled: checked }))}
            />
          </div>
          <div className="space-y-2">
            <label>Interval (minutes)</label>
            <Input 
              type="number"
              min="5"
              value={schedule.interval}
              onChange={(e) => setSchedule(s => ({ ...s, interval: parseInt(e.target.value) }))}
            />
          </div>
          <Button type="submit" className="w-full">
            Update Schedule
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 
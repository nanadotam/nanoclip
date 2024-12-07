import { adminService } from '../../../../lib/services/adminService';
import { cleanupHistoryService } from '../../../../lib/services/cleanupHistoryService';
import { NextResponse } from 'next/server';

export async function GET(request) {
  // Verify cron secret to prevent unauthorized access
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Check if cleanup is enabled
    const schedule = await adminService.getCleanupSchedule();
    if (!schedule?.enabled) {
      return NextResponse.json({ message: 'Cleanup is disabled' });
    }

    // Run cleanup
    const { stats, detailedClipData } = await adminService.cleanupExpiredContent();
    
    // Log cleanup
    await cleanupHistoryService.logCleanup(stats, detailedClipData);

    // Send detailed email notification
    await emailService.sendCleanupNotification(stats, detailedClipData);
    
    // Update next run time to first day of next month
    await adminService.updateCleanupSchedule({ enabled: true });

    return NextResponse.json({
      success: true,
      stats,
      nextRun: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
    });
  } catch (error) {
    console.error('Automated cleanup failed:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
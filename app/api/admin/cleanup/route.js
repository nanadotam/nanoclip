import { adminAuth, adminDb } from '@/app/lib/firebase-admin';
import { adminService } from '@/lib/services/adminService';
import { emailService } from '../../../../lib/services/emailService';
import { cleanupHistoryService } from '@/lib/services/cleanupHistoryService';

export async function POST(request) {
  try {
    // Get the session token from the headers
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      throw new Error('Missing authorization header');
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    
    if (!decodedToken.admin) {
      throw new Error('Insufficient permissions');
    }

    const encoder = new TextEncoder();
    let progress = 0;

    try {
      const stream = new TransformStream();
      const writer = stream.writable.getWriter();
      
      const sendProgress = async (message, type = 'info', progressPercent = null) => {
        progress = progressPercent ?? progress;
        const data = JSON.stringify({ message, type, progress });
        await writer.write(encoder.encode(data + '\n'));
      };

      const response = new Response(stream.readable, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });

      // Start cleanup process in background
      (async () => {
        try {
          await sendProgress('Starting cleanup process...', 'info', 0);
          
          // Get expired clips count
          await sendProgress('Scanning for expired clips...', 'info', 10);
          const expiredCount = await adminService.getExpiredClipsCount();
          
          if (expiredCount === 0) {
            await sendProgress('No expired clips found', 'success', 100);
            await writer.close();
            return;
          }

          await sendProgress(`Found ${expiredCount} expired clips`, 'info', 15);
          
          // Run cleanup with progress tracking
          const { stats, detailedClipData } = await adminService.cleanupExpiredContent(
            async (currentItem, total) => {
              const itemProgress = Math.round((currentItem / total) * 70) + 15; // 15-85%
              await sendProgress(
                `Processing clip ${currentItem} of ${total}...`,
                'info',
                itemProgress
              );
            }
          );

          // Log cleanup
          await sendProgress('Logging cleanup details...', 'info', 90);
          await cleanupHistoryService.logCleanup(stats, detailedClipData);

          // Send email
          await sendProgress('Sending email notification...', 'info', 95);
          await emailService.sendCleanupNotification(stats, detailedClipData);

          // Complete
          await sendProgress('Cleanup completed successfully', 'success', 100);
          await writer.close();
        } catch (error) {
          await sendProgress(`Error: ${error.message}`, 'error');
          await writer.close();
        }
      })();

      return response;
    } catch (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 
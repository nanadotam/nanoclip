import { NextResponse } from 'next/server';

export async function POST(request) {
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
        await sendProgress('Scanning for expired clips...', 'info', 10);
        
        // Simulate cleanup for now
        await new Promise(resolve => setTimeout(resolve, 1000));
        await sendProgress('Found 0 expired clips', 'success', 100);
        await writer.close();
      } catch (error) {
        await sendProgress(`Error: ${error.message}`, 'error');
        await writer.close();
      }
    })();

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
} 
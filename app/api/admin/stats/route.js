import { NextResponse } from 'next/server';
import { adminService } from '../../../../lib/services/adminService';

export async function GET() {
  try {
    const stats = await adminService.getDashboardStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
} 
import { NextResponse } from 'next/server';
import { adminService } from '../../../../lib/services/adminService';

export async function GET() {
  try {
    const trends = await adminService.getTrends();
    return NextResponse.json(trends);
  } catch (error) {
    return NextResponse.json(
      { error: error.message }, 
      { status: 500 }
    );
  }
}
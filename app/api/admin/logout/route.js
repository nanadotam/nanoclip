import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { authService } from '../../../../lib/services/authService';

export async function POST() {
  // Increment the auth version to invalidate all current sessions
  await authService.logout();
  
  // Create response and remove the cookie
  const response = NextResponse.json({ success: true }, { status: 200 });
  response.cookies.delete('admin_token');
  
  return response;
} 
import { NextResponse } from 'next/server';
import { authService } from '../../../../lib/services/authService';
import { collection, getDocs, query, where } from "firebase/firestore";

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    
    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const token = await authService.login(email, password);
    
    const response = NextResponse.json(
      { success: true },
      { status: 200 }
    );

    response.cookies.set({
      name: 'admin_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24
    });

    return response;
  } catch (error) {
    console.error('Login error:', error.message);
    return NextResponse.json(
      { error: error.message },
      { status: 401 }
    );
  }
}

export async function GET(request) {
  const token = request.cookies.get('admin_token')?.value;
  
  if (!token) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const payload = await authService.verifyToken(token);
  
  if (!payload) {
    return NextResponse.json(
      { error: 'Invalid token' },
      { status: 401 }
    );
  }

  return NextResponse.json({ authenticated: true });
} 
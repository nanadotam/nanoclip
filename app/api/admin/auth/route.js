import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { authService } from '../../../../lib/services/authService';

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

    // Set both the JWT token and session cookie
    response.cookies.set({
      name: 'admin_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 // 24 hours
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

export async function GET() {
  try {
    // Get cookies and await it
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;

    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    // Verify the JWT token
    const payload = await authService.verifyToken(token);
    
    if (!payload) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({ 
      authenticated: true,
      user: {
        email: payload.email,
        role: payload.role
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Auth verification error:', error);
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
} 
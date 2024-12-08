import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request: NextRequest) {
  // Get the pathname
  const path = request.nextUrl.pathname;

  // Allow access to login page
  if (path === '/admin/login') {
    return NextResponse.next();
  }

  // Check for admin token on protected routes
  if (path.startsWith('/admin')) {
    const token = request.cookies.get('admin_token')?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    try {
      const JWT_SECRET = process.env.JWT_SECRET;
      
      // Add validation for JWT_SECRET
      if (!JWT_SECRET) {
        console.error('JWT_SECRET is not configured');
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }

      await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
      return NextResponse.next();
    } catch (error) {
      // Add specific error logging
      console.error('JWT verification failed:', error);
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*'  // Match all admin routes
  ]
}; 
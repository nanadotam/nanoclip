import { jwtVerify, SignJWT } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET; 
const ADMIN_EMAIL = process.env.ADMIN_EMAIL?.trim();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD?.trim();

export const authService = {
  async login(email, password) {
    // Check if environment variables are set
    if (!ADMIN_EMAIL || !ADMIN_PASSWORD || !JWT_SECRET) {
      throw new Error('Server configuration error');
    }

    // Trim inputs
    const trimmedEmail = email?.trim();
    const trimmedPassword = password?.trim();

    // Combined check for security
    if (trimmedEmail !== ADMIN_EMAIL || trimmedPassword !== ADMIN_PASSWORD) {
      throw new Error('Invalid credentials');
    }

    // Create JWT token
    const token = await new SignJWT({ email: trimmedEmail, role: 'admin' })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('24h')
      .sign(new TextEncoder().encode(JWT_SECRET));

    return token;
  },

  async verifyToken(token) {
    try {
      const { payload } = await jwtVerify(
        token,
        new TextEncoder().encode(JWT_SECRET)
      );
      return payload;
    } catch {
      return null;
    }
  }
}; 
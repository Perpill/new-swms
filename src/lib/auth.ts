import { sign, verify } from 'jsonwebtoken';
import { serialize } from 'cookie';
import bcrypt from 'bcryptjs';

const SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function hashPassword(password: string) {
  return await bcrypt.hash(password, 10);
}

export async function comparePasswords(password: string, hashedPassword: string) {
  return await bcrypt.compare(password, hashedPassword);
}

export function createToken(userId: string) {
  return sign({ userId }, SECRET, { expiresIn: '7d' });
}

export function setAuthCookie(res: any, token: string) {
  res.setHeader(
    'Set-Cookie',
    serialize('auth', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 604800, // 7 days
      path: '/',
    })
  );
}

export function verifyToken(token: string) {
  return verify(token, SECRET);
}
export async function getServerSession(): Promise<{
  user: { id: string; email?: string; role: string } | null;
}> {
  const authHeader = headers().get('authorization');
  const token = authHeader?.split(' ')[1] || cookies().get('authToken')?.value;

  if (!token) {
    return { user: null };
  }

  try {
    const decoded = verifyToken(token);
    return {
      user: {
        id: decoded.userId,
        role: decoded.role,
      },
    };
  } catch (error) {
    return { user: null };
  }
}

// Protection middleware utilities
export async function protectRoute(requiredRole?: string) {
  const session = await getSession();
  
  if (!session.user) {
    redirect('/login');
  }

  if (requiredRole && session.user.role !== requiredRole) {
    redirect('/unauthorized');
  }

  return session;
}

// Admin-specific utility
export async function requireAdmin() {
  return protectRoute('2');
}

// src/lib/auth.js
export async function checkAdmin() {
  const role = localStorage.getItem('userRole');
  return role === '2'; // 2 = admin
}
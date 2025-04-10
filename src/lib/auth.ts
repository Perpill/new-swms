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
import { H3Event } from 'h3';
import jwt, { JwtPayload } from 'jsonwebtoken';

export function checkUserPermission(event: H3Event): JwtPayload | null {
  const authorization = getHeader(event, 'authorization');
  const token = authorization?.split(' ')[ 1 ] || '';
  if (!token) return null;

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as string);
    return payload as JwtPayload;
  } catch (e) {
    return null;
  }
}

export function getUserStoreKey(userId: string): string {
  return `${process.env.KEY_PREFIX || 'aAuth'}-user-${userId}`;
}

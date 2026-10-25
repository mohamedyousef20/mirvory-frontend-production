import NextAuth from 'next-auth';
import type { Session } from 'next-auth';
import { authOptions } from './lib/auth-options';

const { auth } = NextAuth(authOptions);

export const getServerSession = (): Promise<Session | null> => auth();

export const getCurrentUser = async () => {
  const session = await getServerSession();
  return session?.user || null;
};

export const requireAuth = async () => {
  const session = await getServerSession();
  if (!session) {
    throw new Error('Not authenticated');
  }
  return session.user;
};

export const requireRole = async (requiredRole: 'admin' | 'seller' | 'user' | 'driver') => {
  const user = await requireAuth();
  
  if (user.role !== requiredRole) {
    throw new Error(`Insufficient permissions. Required role: ${requiredRole}`);
  }
  
  return user;
};

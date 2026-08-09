// components/ProtectedRoute.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
// FIX: was incorrectly importing from RootLayout which does NOT export useAuth.
// useAuth is only exported from AuthProvider.
import { useAuth } from '@/contexts/AuthProvider';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    // FIX: AuthContext has no "loading" field — it uses "cookiesReady".
    // "loading" was always undefined → treated as falsy → incorrect behaviour.
    const { user, cookiesReady } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (cookiesReady && !user) {
            router.push('/auth/login');
        }
    }, [user, cookiesReady, router]);

    if (!cookiesReady || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    return <>{children}</>;
}
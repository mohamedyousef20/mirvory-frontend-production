'use client'

import React from 'react'
import { StoreProvider } from '@/src/app/providers/StoreProvider'
import { LayoutWrapper } from './layout-wrapper'
import { LanguageProvider } from '@/components/language-provider'
import { ColorThemeProvider } from '@/components/color-theme-provider'
import { ThemeProvider } from '@/components/theme-provider'
import ErrorBoundaryProvider from '@/providers/ErrorBoundaryProvider'
import { AuthProvider } from '@/contexts/AuthProvider'
import { MainNav } from '@/components/main-nav'
import { SiteFooter } from '@/components/site-footer'
import { Toaster } from 'sonner'

interface ProvidersProps {
    children: React.ReactNode;
    user?: any;
}

export function Providers({ children, user }: ProvidersProps) {
    return (
        <StoreProvider>
            <LayoutWrapper>
                <LanguageProvider>
                    <ColorThemeProvider>
                        <ThemeProvider attribute="class" defaultTheme="system">
                            <ErrorBoundaryProvider>
                                <AuthProvider initialUser={user}>
                                    <MainNav />

                                    <Toaster position="top-center" />

                                    {children}

                                    <SiteFooter />
                                </AuthProvider>
                            </ErrorBoundaryProvider>
                        </ThemeProvider>
                    </ColorThemeProvider>
                </LanguageProvider>
            </LayoutWrapper>
        </StoreProvider>
    )
}

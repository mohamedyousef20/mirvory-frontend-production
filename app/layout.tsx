// app/layout.tsx
// Updated RootLayout with global user/token loader
// Meta Pixel: 2 Pixels

import type React from "react"
import type { Metadata } from "next"

import { Cairo, Noto_Naskh_Arabic } from "next/font/google"

import "./globals.css"

import { ThemeProvider } from "@/components/theme-provider"
import { LanguageProvider } from "@/components/language-provider"
import { ColorThemeProvider } from "@/components/color-theme-provider"
import { StoreProvider } from "@/src/app/providers/StoreProvider"
import { LayoutWrapper } from "./layout-wrapper"
import { MainNav } from "@/components/main-nav"
import ErrorBoundaryProvider from "@/providers/ErrorBoundaryProvider"
import { SiteFooter } from "@/components/site-footer"
import { Toaster } from "sonner"
import { getUserServer } from "@/src/lib/getUserServer"
import { AuthProvider } from "@/contexts/AuthProvider"

import Script from "next/script"

// import { SocketProvider } from "@/contexts/SocketProvider"

const cairo = Cairo({
  subsets: ["latin", "arabic"],
  display: "swap",
  variable: "--font-cairo",
  weight: ["400", "500", "700"],
})

const notoNaskh = Noto_Naskh_Arabic({
  subsets: ["arabic"],
  display: "swap",
  variable: "--font-noto-naskh",
  weight: ["400", "500", "600", "700"],
})

export const metadata: Metadata = {
  title: "Mirvory - متجر الكوتشيات والملابس",

  description:
    "منصة تجارة إلكترونية متعددة التجار متخصصة في بيع الكوتشيات الميرور والملابس",

  generator: "v0.dev",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const userData = await getUserServer()

  return (
    <html
      lang="ar"
      dir="rtl"
      suppressHydrationWarning
    >
      <body
        className={`
                    ${cairo.variable}
                    ${notoNaskh.variable}
                    font-sans
                    antialiased
                `}
      >

        {/* ================================================= */}
        {/* Meta Pixel - Two Pixels                         */}
        {/* ================================================= */}

        <Script
          id="meta-pixels"
          strategy="afterInteractive"
        >
          {`
                        !function(f,b,e,v,n,t,s)
                        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                        n.queue=[];t=b.createElement(e);t.async=!0;
                        t.src=v;s=b.getElementsByTagName(e)[0];
                        s.parentNode.insertBefore(t,s)}(
                            window,
                            document,
                            'script',
                            'https://connect.facebook.net/en_US/fbevents.js'
                        );

                        /* Pixel 1 */
                        fbq('init', '1063770146377303');

                        /* Pixel 2 */
                        fbq('init', '2200341703888804');

                        /* Page View */
                        fbq('track', 'PageView');
                    `}
        </Script>

        {/* ================================================= */}
        {/* Meta Pixel Noscript                              */}
        {/* ================================================= */}

        <noscript>
          <img
            height="1"
            width="1"
            style={{
              display: "none",
            }}
            src="https://www.facebook.com/tr?id=1063770146377303&ev=PageView&noscript=1"
            alt=""
          />

          <img
            height="1"
            width="1"
            style={{
              display: "none",
            }}
            src="https://www.facebook.com/tr?id=2200341703888804&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>

        {/* ================================================= */}
        {/* End Meta Pixel                                   */}
        {/* ================================================= */}


        <StoreProvider>

          <LayoutWrapper>

            <LanguageProvider>

              <ColorThemeProvider>

                <ThemeProvider
                  attribute="class"
                  defaultTheme="system"
                  enableSystem
                  disableTransitionOnChange
                >

                  <ErrorBoundaryProvider>

                    <AuthProvider
                      initialUser={userData}
                    >

                      {/* 
                                            <SocketProvider>
                                            */}

                      <MainNav />

                      <div className="pt-16">

                        <Toaster
                          position="top-center"
                          richColors
                          expand
                          duration={4000}
                          closeButton
                        />

                        {children}

                      </div>

                      <SiteFooter />

                      {/*
                                            </SocketProvider>
                                            */}

                    </AuthProvider>

                  </ErrorBoundaryProvider>

                </ThemeProvider>

              </ColorThemeProvider>

            </LanguageProvider>

          </LayoutWrapper>

        </StoreProvider>

      </body>
    </html>
  )
}
// app/layout.tsx
// Updated RootLayout with new Meta Pixel

import type React from "react"
import type { Metadata } from "next"

import { Cairo, Noto_Naskh_Arabic, Space_Grotesk, Plus_Jakarta_Sans } from "next/font/google"

import "./globals.css"

import { ThemeProvider } from "@/components/theme-provider"
import { LanguageProvider } from "@/components/language-provider"
import { ColorThemeProvider } from "@/components/color-theme-provider"
import { StoreProvider } from "@/src/app/providers/StoreProvider"
import { LayoutWrapper } from "./layout-wrapper"
import { MainNav } from "@/components/main-nav"
import ErrorBoundaryProvider from "@/providers/ErrorBoundaryProvider"
import { NavSwitch } from "@/components/stitch/StitchDesktopHeader"
import { FloatingWhatsApp } from "@/components/stitch/FloatingWhatsApp"
import { StitchFooter } from "@/components/stitch/StitchFooter"
import { Toaster } from "sonner"
import { getUserServer } from "@/src/lib/getUserServer"
import { AuthProvider } from "@/contexts/AuthProvider"
import { AnnouncementBar } from "@/components/announcement-bar"
import { DesktopOnly, HideOnStitch, HideHeaderOnBrand, StitchBrandBar, StitchBackBar, MobileHeader, MobileNav, PageOffset } from "@/components/m3/chrome"

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

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-space-grotesk",
  weight: ["500", "600", "700"],
})

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jakarta",
  weight: ["400", "500", "600"],
})

export const metadata: Metadata = {
  title: "Mirvory - متجر الكوتشيات والملابس",
  description:
    "متجر متخصص في بيع الكوتشيات الميرور والملابس العصرية بأفضل الأسعار وأعلى جودة",
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
      <head>
        {/* Material Symbols icon font used by the redesigned mobile screens */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        />
      </head>
      <body
        className={`
                    ${cairo.variable}
                    ${notoNaskh.variable}
                    ${spaceGrotesk.variable}
                    ${plusJakarta.variable}
                    font-sans
                    antialiased
                `}
      >

        {/* ================================================= */}
        {/* Meta Pixel - New Single Pixel (2989899261351129)  */}
        {/* ================================================= */}

        <Script
          id="meta-pixel"
          strategy="afterInteractive"
        >
          {`
         !function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '2089839991898952');
fbq('init', '2228813714332492');
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
            src="https://www.facebook.com/tr?id=2989899261351129&ev=PageView&noscript=1"
            alt=""
          />
          <img
            height="1"
            width="1"
            style={{
              display: "none",
            }}
            src="https://www.facebook.com/tr?id=2228813714332492&ev=PageView&noscript=1"
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
                  defaultTheme="light"
                  enableSystem
                  disableTransitionOnChange
                >

                  <ErrorBoundaryProvider>

                    <AuthProvider
                      initialUser={userData}
                    >

                      {/* ── Scrolling Announcement Bar (above sticky header) ── */}
                      <DesktopOnly>
                        <AnnouncementBar />

                        <NavSwitch classic={<MainNav />} />
                      </DesktopOnly>
                      <HideOnStitch><HideHeaderOnBrand><MobileHeader /></HideHeaderOnBrand></HideOnStitch>
                      <StitchBrandBar />
                      <StitchBackBar />

                      <PageOffset>

                        <Toaster
                          position="top-center"
                          richColors
                          expand
                          duration={4000}
                          closeButton
                        />

                        {children}

                      </PageOffset>

                      {/* v5: extra space so the bottom bar never covers the footer (mobile only) */}
                      <div className="pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0">
                        <StitchFooter />
                      </div>

                      <FloatingWhatsApp />
                      <HideOnStitch><MobileNav /></HideOnStitch>

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
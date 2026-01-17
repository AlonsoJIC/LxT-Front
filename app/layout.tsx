import type React from "react"
import { Header } from "@/components/header"
import type { Metadata } from "next"
import { Toaster } from "@/components/ui/toaster"
import { TranscriptionProvider } from "@/contexts/TranscriptionContext"
import { FloatingTranscriptionIndicator } from "@/components/floating-transcription-indicator"
import { LicenseWrapper } from "@/components/license/license-wrapper"
import "./globals.css"

export const metadata: Metadata = {
  title: "LxT - Transcripción Profesional con IA",
  description: "Transcribe audio a texto con precisión y velocidad profesional",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className="dark">
      <body className={`font-sans antialiased`}>
        <LicenseWrapper>
          <TranscriptionProvider>
            {/* Navbar/Header always visible */}
            <Header />
            {children}
            {/* Toast notifications */}
            <Toaster />
            {/* Floating transcription indicator */}
            <FloatingTranscriptionIndicator />
          </TranscriptionProvider>
        </LicenseWrapper>
      </body>
    </html>
  )
}

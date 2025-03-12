import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import SyncManager from "@/components/SyncManager"
import OfflineIndicator from "@/components/OfflineIndicator"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Task Management System",
  description: "An educational app for managing tasks, courses, and more",
  manifest: "/manifest.json",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head>
      <body className={inter.className}>
        {children}
        {/* Client-side only components */}
        <div suppressHydrationWarning>
          {typeof window === "undefined" ? null : (
            <>
              <SyncManager />
              <OfflineIndicator />
            </>
          )}
        </div>
        {/* Register service worker */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/service-worker.js').then(
                    function(registration) {
                      console.log('Service Worker registration successful with scope: ', registration.scope);
                    },
                    function(err) {
                      console.log('Service Worker registration failed: ', err);
                    }
                  );
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
}



import './globals.css'
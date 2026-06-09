import type { ReactNode } from 'react'
import Providers from '@/components/core/providers'
import './globals.css'

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* FIX: THE NO-BLINK SCRIPT
          vanilla JS runs synchronously before React even boots up.
            a. It reads the values of theme and mode from local storage.
            b. Them sets the correct HTML attributes instantly.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var theme = localStorage.getItem('data-theme-name') || 'tally';
                var mode = localStorage.getItem('data-mode') || 'light';
                document.documentElement.setAttribute('data-theme-name', theme);
                document.documentElement.setAttribute('data-mode', mode);
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}

import type { Metadata } from 'next'
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter'
import ClientProviders from '@/components/providers/ClientProviders'
import './globals.css'

export const metadata: Metadata = {
  title: 'TelecomTools Suite',
  description: 'Sistema de Análise de Telecomunicações e RF',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <script src="/leaflet-heat.js" defer />
      </head>
      <body>
        <AppRouterCacheProvider>
          <ClientProviders>
            {children}
          </ClientProviders>
        </AppRouterCacheProvider>
      </body>
    </html>
  )
}


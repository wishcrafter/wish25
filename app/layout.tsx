import { Inter } from 'next/font/google'
import './globals.css'
import PageTemplate from './components/PageTemplate'
import { metadata } from './metadata'
import ReactQueryProvider from './providers/ReactQueryProvider'

const inter = Inter({ subsets: ['latin'] })

export { metadata }

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <ReactQueryProvider>
          <PageTemplate>
            {children}
          </PageTemplate>
        </ReactQueryProvider>
      </body>
    </html>
  );
} 
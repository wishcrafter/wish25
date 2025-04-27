import { Inter } from 'next/font/google'
import './globals.css'
import PageTemplate from './components/PageTemplate'
import { metadata } from './metadata'

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
        <PageTemplate>
          {children}
        </PageTemplate>
      </body>
    </html>
  );
} 
import 'rc-slider/assets/index.css';
import './globals.css';
import React from 'react';
import Sidebar from './components/Sidebar';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>
        <div className="layout">
          <Sidebar />
          <main className="main">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
} 
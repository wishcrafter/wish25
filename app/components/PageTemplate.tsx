'use client';

import Sidebar from './Sidebar';
import { usePathname } from 'next/navigation';

export default function PageTemplate({
  children
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  if (isLoginPage) {
    return children;
  }

  return (
    <div className="layout">
      <Sidebar />
      <main className="main">
        {children}
      </main>
    </div>
  );
} 
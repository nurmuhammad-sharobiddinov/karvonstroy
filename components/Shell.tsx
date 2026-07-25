'use client';

import type { ReactNode } from 'react';
import { AppProvider } from '@/store/AppContext';
import Header from './Header';
import Footer from './Footer';
import Toast from './Toast';

// Global chrome shared by every route: provider + header + footer + toast.
export default function Shell({ children }: { children: ReactNode }) {
  return (
    <AppProvider>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header />
        <main style={{ flex: 1 }}>{children}</main>
        <Footer />
        <Toast />
      </div>
    </AppProvider>
  );
}

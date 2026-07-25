'use client';

import { useApp } from '@/store/AppContext';

// Bottom-center toast; slides up when a message is set (auto-hides via store).
export default function Toast() {
  const { state } = useApp();
  const shown = !!state.toast;
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        left: '50%',
        bottom: 26,
        zIndex: 200,
        transform: `translateX(-50%) translateY(${shown ? '0' : '160%'})`,
        transition: 'transform .4s cubic-bezier(.16,1,.3,1)',
        background: 'var(--ink)',
        color: '#fff',
        fontSize: 14,
        fontWeight: 600,
        padding: '14px 22px',
        borderRadius: 12,
        boxShadow: '0 12px 40px rgba(15,24,38,.3)',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        maxWidth: 'calc(100vw - 28px)',
      }}
    >
      <span style={{ color: 'var(--free)', fontSize: 16 }}>✓</span>
      <span>{state.toast}</span>
    </div>
  );
}

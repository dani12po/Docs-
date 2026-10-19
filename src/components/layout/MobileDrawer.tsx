'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import { Sidebar } from './Sidebar';

export function MobileDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[90] lg:hidden" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute inset-y-0 left-0 flex w-72 flex-col border-r border-line bg-base p-4">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm font-semibold text-gold">KORAMP</span>
          <button
            onClick={onClose}
            aria-label="Tutup menu"
            className="text-ink-muted transition-colors hover:text-ink-primary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <Sidebar onNavigate={onClose} />
        </div>
      </div>
    </div>
  );
}

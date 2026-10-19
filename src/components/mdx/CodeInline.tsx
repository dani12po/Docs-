import type { ReactNode } from 'react';

export function CodeInline({ className, children }: { className?: string; children?: ReactNode }) {
  if (className && /language-/.test(className)) {
    return <code className={className}>{children}</code>;
  }
  return (
    <code className="rounded border border-line bg-surface-2 px-1.5 py-0.5 font-mono text-[0.85em] text-gold">
      {children}
    </code>
  );
}

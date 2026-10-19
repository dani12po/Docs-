import type { ReactNode } from 'react';
import clsx from 'clsx';

type CalloutType = 'info' | 'warning' | 'success' | 'danger';

const STYLES: Record<CalloutType, { border: string; bg: string; text: string; label: string }> = {
  info: { border: 'border-blue-500/30', bg: 'bg-blue-500/10', text: 'text-blue-400', label: 'Info' },
  warning: {
    border: 'border-yellow-500/30',
    bg: 'bg-yellow-500/10',
    text: 'text-yellow-400',
    label: 'Perhatian',
  },
  success: {
    border: 'border-green-500/30',
    bg: 'bg-green-500/10',
    text: 'text-green-400',
    label: 'Berhasil',
  },
  danger: { border: 'border-red-500/30', bg: 'bg-red-500/10', text: 'text-red-400', label: 'Penting' },
};

export function Callout({
  type = 'info',
  title,
  children,
}: {
  type?: CalloutType;
  title?: string;
  children?: ReactNode;
}) {
  const style = STYLES[type] ?? STYLES.info;
  return (
    <div className={clsx('not-prose my-6 rounded-lg border p-4', style.border, style.bg)}>
      <p className={clsx('mb-1 text-sm font-semibold', style.text)}>{title ?? style.label}</p>
      <div className="text-sm leading-6 text-ink-secondary">{children}</div>
    </div>
  );
}
